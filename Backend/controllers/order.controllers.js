import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
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

    if (paymentMethod == "online") {
      const razorOrder = await instance.orders.create({
        amount: Math.round(totalAmount) * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      const newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        razorpayOrderId: razorOrder.id,
        payment: false,
      });
      return res.success("Order created successfully", {
        razorOrder,
        orderId: newOrder._id,
      });
    }
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });
    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price"
    );
    await newOrder.populate("shopOrders.shop", "name");
    await newOrder.populate("shopOrders.owner", "name socketId");
    await newOrder.populate("user", "name email mobile");
    const io = req.app.get("io");

    if (io) {
      newOrder.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            user: newOrder.user,
            deliveryAddress: newOrder.deliveryAddress,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            payment: newOrder.payment,
          });
        }
      });
    }

    return res.success("Order created successfully", newOrder);
  } catch (err) {
    console.error(err);
    return res.error("Error placing order", err);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;
    const payment = await instance.payments.fetch(razorpay_payment_id);
    if (!payment || payment.status != "captured") {
      return res.error("Payment not captured.");
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.error("Order Not Found");
    }
    order.payment = true;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    await order.populate("shopOrders.shopOrderItems.item", "name image price");
    await order.populate("shopOrders.shop", "name");
    await order.populate("shopOrders.owner", "name socketId");
    await order.populate("user", "name email mobile");
    const io = req.app.get("io");

    if (io) {
      order.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: order._id,
            paymentMethod: order.paymentMethod,
            user: order.user,
            deliveryAddress: order.deliveryAddress,
            shopOrders: shopOrder,
            createdAt: order.createdAt,
            payment: order.payment,
          });
        }
      });
    }
    return res.success("Order created successfully", order);
  } catch (err) {
    console.error(err);
    return res.error("Error placing order", err);
  }
};
export const getOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.error("User not found.");
    if (user.role == "user") {
      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      return res.success("Orders retrieved successfully", orders);
    } else if (user.role == "owner") {
      const orders = await Order.find({ "shopOrders.owner": userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");
      const filteredOrders = orders.map((order) => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        deliveryAddress: order.deliveryAddress,
        shopOrders: order.shopOrders.find(
          (o) => o.owner._id.toString() === userId.toString()
        ),
        createdAt: order.createdAt,
        payment: order.payment,
      }));
      return res.success("Orders retrieved successfully", filteredOrders);
    }
    return res.success("this is a delivery boy");
  } catch (err) {
    console.error(err);
    return res.error("Error retrieving orders", err);
  }
};

export const UpdateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.error("Order not found.");
    const shopOrder = order.shopOrders.find((o) => o.shop == shopId);
    if (!shopOrder) return res.error("Shop Order not found.");
    shopOrder.status = status;

    let deliveryBoyPayload = [];
    if (status === "out for delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000,
          },
        },
      });
      const nearByIds = nearByDeliveryBoys.map((b) => b._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));
      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id))
      );
      const candidates = availableBoys.map((b) => b._id);

      if (candidates.length == 0) {
        await order.save();
        return res.success(
          "Order status updated but there is no delivery boy available."
        );
      }
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidates,
        status: "broadcasted",
      });

      // Note: assignedTo will be set later when delivery boy accepts
      shopOrder.assignment = deliveryAssignment._id;
      deliveryBoyPayload = availableBoys.map((b) => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile,
      }));

      await deliveryAssignment.populate("order");
      await deliveryAssignment.populate("shop");
      const io = req.app.get("io");
      if (io) {
        availableBoys.forEach((boy) => {
          const boySocketId = boy.socketId;
          if (boySocketId) {
            io.to(boySocketId).emit("newAssignment", {
                sentTo:boy._id,
              assignmentId: deliveryAssignment._id,
              orderId: deliveryAssignment.order._id,
              shopName: deliveryAssignment.shop.name,
              deliveryAddress: deliveryAssignment.order.deliveryAddress,
              items:
                deliveryAssignment.order.shopOrders.find((so) =>
                  so._id.equals(deliveryAssignment.shopOrderId)
                ).shopOrderItems || [],
              subTotal: deliveryAssignment.order.shopOrders.find((so) =>
                so._id.equals(deliveryAssignment.shopOrderId)
              ).subTotal,
            });
          }
        });
      }
    }
    // Save the parent order document - this will save all subDocuments including shopOrder
    await order.save();
    const updatedShopOrder = order.shopOrders.find((o) => o.shop == shopId);

    await order.populate("shopOrders.shop", "name");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullName email mobile"
    );
    await order.populate("user", "socketId");
    const io = req.app.get("io");
    if (io) {
      const userSocketId = order.user.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit("update-status", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          status: updatedShopOrder.status,
          userId: order.user._id,
        });
      }
    }

    // await shopOrder.populate("shopOrderItems.item", "name image price")
    return res.success("Shop order status changed successfully", {
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy || null,
      availableBoys: deliveryBoyPayload,
      assignment: updatedShopOrder?.assignment?._id || null,
    });
  } catch (err) {
    console.error(err);
    return res.error("Error updating order status", err);
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const assignments = await DeliveryAssignment.find({
      broadcastedTo: deliveryBoyId,
      status: "broadcasted",
    })
      .populate("order")
      .populate("shop");
    if (!assignments) {
      return res.error("Assignments not found");
    }
    const formatedData = assignments.map((a) => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      deliveryAddress: a.order.deliveryAddress,
      items:
        a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
          .shopOrderItems || [],
      subTotal: a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
        .subTotal,
    }));
    return res.success("Delivery Boy assignment list", formatedData);
  } catch (err) {
    console.error(err);
    return res.error("Error while fetching delivery boy assignment ", err);
  }
};
// for delivery boy
export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.userId;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.error("Assignments not found");
    }
    if (assignment.status !== "broadcasted") {
      return res.error("Assignments is expired");
    }
    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: userId,
      status: { $nin: ["broadcasted", "completed"] },
    });
    if (alreadyAssigned) {
      return res.error("You are already assigned to another order");
    }
    assignment.assignedTo = userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.error("Order not found");
    }
    let shopOrder = order.shopOrders.id(assignment.shopOrderId);
    shopOrder.assignedDeliveryBoy = userId;
    await order.save();
    return res.success("Order Accepted Successfully");
  } catch (err) {
    console.error(err);
    return res.error("Error while accepting the order", err);
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const userID = req.userId;
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: userID,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName email location mobile" }],
      });

    if (!assignment) {
      return res.error("Assignment not found");
    }
    if (!assignment.order) {
      return res.error("Order not found");
    }

    const shopOrder = assignment.order.shopOrders.find(
      (o) => String(o._id) == String(assignment.shopOrderId)
    );
    if (!shopOrder) {
      return res.error("Shop Order not found");
    }
    let deliveryBoyLocation = { lat: null, lng: null };
    if (assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lng = assignment.assignedTo.location.coordinates[0];
    }

    let customerLocation = { lat: null, lng: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lng = assignment.order.deliveryAddress.longitude;
    }

    return res.success("Current Order by user", {
      _id: assignment.order._id,
      user: assignment.order.user,
      shop: assignment.shop,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (err) {
    console.error(err);
    return res.error("Error while getting current the order", err);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .lean();

    if (!order) {
      return res.error("Order not found");
    }
    return res.success("Order By ID", order);
  } catch (err) {
    console.error(err);
    return res.error("Error while getting order", err);
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.error("Enter valid order/shopOrderId");
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;
    await order.save();
    console.log(order.user);
    await sendDeliveryOtpMail(order.user, otp);
    return res.success(`OTP sent Successfully to ${order.user.fullName}`);
  } catch (err) {
    console.error(err);
    return res.error("Error while sending OTP", err);
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.error("Enter valid order/shopOrderId");
    }
    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.error("Invalid/Expired Otp");
    }
    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();
    await order.save();
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });

    return res.success("Order Delivered Successfully");
  } catch (err) {
    console.error(err);
    return res.error("Error verify delivery OTP error", err);
  }
};

export const getTodayDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId
    const startsOfDay = new Date()
    startsOfDay.setHours(0,0,0,0)
    const orders = await Order.find({
        "shopOrders.assignedDeliveryBoy":deliveryBoyId,
        "shopOrders.status":"delivered",
        "shopOrders.deliveredAt":{$gte:startsOfDay},
    }).lean() ;

    let todaysDeliveries = []
    orders.forEach(order =>{
        order.shopOrders.forEach(shopOrder =>{
            if(shopOrder.assignedDeliveryBoy == deliveryBoyId && shopOrder.status == "delivered" && shopOrder.deliveredAt && shopOrder.deliveredAt >= startsOfDay ){
                todaysDeliveries.push(shopOrder)
            }
        })
    })
    let stats ={}

    todaysDeliveries.forEach(shopOrder =>{
        const hour = new Date(shopOrder.deliveredAt).getHours()
        stats[hour] = (stats[hour] || 0) + 1
    })
    let formattedStats = Object.keys(stats).map(hour => ({
        hour:parseInt(hour),
        count:stats[hour]
    }))
    formattedStats.sort((a,b) => a.hour - b.hour)
    return res.success(" Success Message", formattedStats);
  } catch (err) {
    console.error(err);
    return res.error("Error while sending OTP", err);

  }
}