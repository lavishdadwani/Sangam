import User from "../../models/user.model.js";
import Order from "../../models/order.model.js";
import { ORDER_STATUS } from "../../constants/orderStatus.js";

export const getRiders = async (req, res) => {
  try {
    const { search = "", status = "", isOnline = "", page = 1, limit = 10 } = req.query;

    const filter = { role: "deliveryBoy" };
    if (status) filter.status = status;
    if (isOnline !== "") filter.isOnline = isOnline === "true";
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [riders, total] = await Promise.all([
      User.find(filter)
        .select("-password -reSetOtp -socketId")
        .sort({ isOnline: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return res.success("Riders fetched", {
      riders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    return res.error("getRiders error", err);
  }
};

export const getRiderById = async (req, res) => {
  try {
    const { riderId } = req.params;

    const rider = await User.findOne({ _id: riderId, role: "deliveryBoy" }).select(
      "-password -reSetOtp -socketId"
    );
    if (!rider) return res.error("Rider not found");

    // Aggregate earnings and delivery count from completed shopOrders
    const earningsAgg = await Order.aggregate([
      { $unwind: "$shopOrders" },
      {
        $match: {
          "shopOrders.assignedDeliveryBoy": rider._id,
          "shopOrders.status": ORDER_STATUS.DELIVERED,
        },
      },
      {
        $group: {
          _id: null,
          totalDeliveries: { $sum: 1 },
          totalOrderValue: { $sum: "$shopOrders.subTotal" },
        },
      },
    ]);

    const stats = earningsAgg[0] ?? { totalDeliveries: 0, totalOrderValue: 0 };

    return res.success("Rider fetched", { rider, stats });
  } catch (err) {
    return res.error("getRiderById error", err);
  }
};

export const updateRiderStatus = async (req, res) => {
  try {
    const { riderId } = req.params;
    const { status } = req.body;

    const allowed = ["active", "deactivated", "blocked", "banned"];
    if (!allowed.includes(status)) return res.error("Invalid status value");

    const rider = await User.findOneAndUpdate(
      { _id: riderId, role: "deliveryBoy" },
      { status },
      { new: true, select: "-password -reSetOtp -socketId" }
    );

    if (!rider) return res.error("Rider not found");

    return res.success(`Rider status updated to ${status}`, rider);
  } catch (err) {
    return res.error("updateRiderStatus error", err);
  }
};

export const approveRider = async (req, res) => {
  try {
    const { riderId } = req.params;
    const { isApproved } = req.body;

    if (typeof isApproved !== "boolean") return res.error("isApproved must be a boolean");

    const rider = await User.findOneAndUpdate(
      { _id: riderId, role: "deliveryBoy" },
      { isApproved },
      { new: true, select: "-password -reSetOtp -socketId" }
    );

    if (!rider) return res.error("Rider not found");

    return res.success(
      isApproved ? "Rider approved" : "Rider approval revoked",
      rider
    );
  } catch (err) {
    return res.error("approveRider error", err);
  }
};
