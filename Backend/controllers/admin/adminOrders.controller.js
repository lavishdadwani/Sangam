import Order from "../../models/order.model.js";
import User from "../../models/user.model.js";
import DeliveryAssignment from "../../models/deliveryAssignment.model.js";
import { ORDER_STATUS } from "../../constants/orderStatus.js";

// ── List ──────────────────────────────────────────────────────────────────────
export const getOrders = async (req, res) => {
  try {
    const {
      status = "",
      paymentMethod = "",
      payment = "",
      search = "",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (payment !== "") filter.payment = payment === "true";

    // Status filter applies to at least one shopOrder
    if (status) filter["shopOrders.status"] = status;

    // Search by order ID (partial hex) or user email via lookup
    if (search) {
      // If it looks like a Mongo ObjectId prefix, search by _id string
      if (/^[a-f0-9]{6,24}$/i.test(search)) {
        filter["_id"] = { $regex: `^${search}`, $options: "i" };
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    let query = Order.find(filter)
      .populate("user", "fullName email mobile")
      .select("-shopOrders.deliveryOtp")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const [orders, total] = await Promise.all([
      query,
      Order.countDocuments(filter),
    ]);

    return res.success("Orders fetched", {
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    return res.error("getOrders error", err);
  }
};

// ── Detail ────────────────────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "fullName email mobile photo")
      .populate({ path: "shopOrders.shop", select: "name image city address" })
      .populate({ path: "shopOrders.assignedDeliveryBoy", select: "fullName email mobile isOnline" })
      .populate({ path: "shopOrders.shopOrderItems.item", select: "name image price" })
      .lean();

    if (!order) return res.error("Order not found");

    return res.success("Order fetched", order);
  } catch (err) {
    return res.error("getOrderById error", err);
  }
};

// ── Force cancel ──────────────────────────────────────────────────────────────
export const forceCancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.error("Order not found");

    const nonCancellable = [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED];

    let cancelled = 0;
    order.shopOrders.forEach((so) => {
      if (!nonCancellable.includes(so.status)) {
        so.status = ORDER_STATUS.CANCELLED;
        cancelled++;
      }
    });

    if (cancelled === 0) {
      return res.error("Order is already delivered or cancelled");
    }

    await order.save();

    return res.success("Order force cancelled", order);
  } catch (err) {
    return res.error("forceCancelOrder error", err);
  }
};

// ── Update single shopOrder status ────────────────────────────────────────────
export const updateShopOrderStatus = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.params;
    const { status } = req.body;

    const validStatuses = Object.values(ORDER_STATUS);
    if (!validStatuses.includes(status)) return res.error("Invalid status");

    const order = await Order.findById(orderId);
    if (!order) return res.error("Order not found");

    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder) return res.error("Shop order not found");

    shopOrder.status = status;
    if (status === ORDER_STATUS.DELIVERED) {
      shopOrder.deliveredAt = new Date();
    }

    await order.save();
    return res.success("Status updated", order);
  } catch (err) {
    return res.error("updateShopOrderStatus error", err);
  }
};

// ── Reassign rider ────────────────────────────────────────────────────────────
export const reassignRider = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.params;
    const { riderId } = req.body;

    const [order, rider] = await Promise.all([
      Order.findById(orderId),
      User.findOne({ _id: riderId, role: "deliveryBoy" }),
    ]);

    if (!order) return res.error("Order not found");
    if (!rider) return res.error("Rider not found");

    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder) return res.error("Shop order not found");

    shopOrder.assignedDeliveryBoy = rider._id;

    // Update the linked assignment if it exists
    if (shopOrder.assignment) {
      await DeliveryAssignment.findByIdAndUpdate(shopOrder.assignment, {
        assignedTo: rider._id,
      });
    }

    await order.save();
    return res.success("Rider reassigned", { riderId: rider._id, riderName: rider.fullName });
  } catch (err) {
    return res.error("reassignRider error", err);
  }
};
