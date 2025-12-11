import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";

export const createOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.error("Cart is empty");
    }
    if (
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.error("Please provide complete delivery address.");
    }
    const groupItemsByShop = {};
    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });
    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        try {
          const shop = await Shop.findById(shopId).populate("owner");
          if (!shop) {
            throw new Error(`Shop not found: ${shopId}`);
          }
          const items = groupItemsByShop[shopId];
          const subTotal = items.reduce(
            (sum, i) => sum + Number(i.price) * Number(i.quantity),
            0
          );
          return {
            shop: shop._id,
            owner: shop.owner._id,
            subTotal,
            shopOrderItems: items.map((i) => ({
              item: i.id,
              price: i.price,
              quantity: i.quantity,
              name: i.name,
            })),
          };
        } catch (err) {
          console.error(err);
          throw err; // Re-throw to be caught by outer try-catch
        }
      })
    );
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });
    await newOrder.populate('shopOrders.shopOrderItems.item', "name image price")
    await newOrder.populate('shopOrders.shop', "name")
    return res.success("Order created successfully", newOrder);
  } catch (err) {
    console.error(err);
    return res.error("Error placing order", err);
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId)
    if(!user) return  res.error("User not found.");
    if(user.role == "user"){
        const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");
  
        return res.success("Orders retrieved successfully", orders);
    }else if(user.role == "owner"){
        const orders = await Order.find({ "shopOrders.owner": userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price");
        const filteredOrders = orders.map((order => (
            {
                _id:order._id,
                paymentMethod:order.paymentMethod,
                user:order.user,
                deliveryAddress:order.deliveryAddress,
                shopOrders:order.shopOrders.find( o => o.owner._id.toString() === userId.toString()),
                createdAt:order.createdAt,

            }
        )))
        return res.success("Orders retrieved successfully", filteredOrders);
    }

  } catch (err) {
    console.error(err);
    return res.error("Error retrieving orders", err);
  }
};

export const UpdateOrderStatus = async (req, res) => {
  try {
    const {orderId, shopId} = req.params
    const {status} = req.body
    const order = await Order.findById(orderId)
    if(!order) return res.error("Order not found.");
    const shopOrder = order.shopOrders.find( o => o.shop == shopId)
    if(!shopOrder) return res.error("Shop Order not found.");
    shopOrder.status = status

    let deliveryBoyPayload = []
    if(status === "out of delivery" || !shopOrder.assignment){
        const {longitude, latitude} = order.deliveryAddress
        const nearByDeliveryBoys = await User.find({
            role:"deliveryBoy",
            location:{
                $near:{
                    $geometry:{
                        type:"Point", coordinates:[Number(longitude), Number(latitude)],

                    },
                    $maxDistance: 5000,

                }
            }
        })
        const nearByIds = nearByDeliveryBoys.map( b=> b._id)
        const busyIds = await DeliveryAssignment.find({
            assignedTo:{$in:nearByIds},
            status:{$nin:["broadcasted", "completed"]}
        }).distinct("assignedTo")

        const busyIdSet = new Set(busyIds.map(id => String(id)))
        const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)))
        const candidates = availableBoys.map(b => b._id)

        if(candidates.length == 0){
            await order.save()
            return res.success("Order status updated but there is no delivery boy available.")
        }
        const deliveryAssignment = await DeliveryAssignment.create({
            order:order._id,
            shop:shopOrder.shop,
            shopOrderId:shopOrder._id,
            broadcastedTo:candidates,
            status:"broadcasted",
        })

        // Note: assignedTo will be set later when delivery boy accepts
        shopOrder.assignment = deliveryAssignment._id
        deliveryBoyPayload = availableBoys.map( b => ({
            id:b._id,
            fullName:b.fullName,
            longitude:b.location.coordinates?.[0],
            latitude:b.location.coordinates?.[1],
            mobile:b.mobile,
        }))
    }
    // Save the parent order document - this will save all subdocuments including shopOrder
    await order.save()
    const updatedShopOrder = order.shopOrders.find( o => o.shop == shopId)

    await order.populate("shopOrders.shop", "name")
    await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")

    // await shopOrder.populate("shopOrderItems.item", "name image price")
    return res.success("Shop order status changed successfully", {
        shopOrder:updatedShopOrder,
        assignedDeliveryBoy:updatedShopOrder?.assignedDeliveryBoy || null,
        availableBoys:deliveryBoyPayload,
        assignment: updatedShopOrder?.assignment?._id || null
    });

  } catch (err) {
    console.error(err);
    return res.error("Error updating order status", err);
  }
}