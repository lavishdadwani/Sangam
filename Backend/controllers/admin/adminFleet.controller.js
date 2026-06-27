import User from "../../models/user.model.js";
import Order from "../../models/order.model.js";
import DeliveryAssignment from "../../models/deliveryAssignment.model.js";
import { ORDER_STATUS } from "../../constants/orderStatus.js";

export const getFleetStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Busy = has an active assignment right now
    const busyRiderIds = await DeliveryAssignment.distinct("assignedTo", {
      status: "assigned",
    });

    const [
      totalRiders,
      onlineRiders,
      todayDeliveriesAgg,
      avgTimeAgg,
      topRidersAgg,
    ] = await Promise.all([
      User.countDocuments({ role: "deliveryBoy" }),
      User.countDocuments({ role: "deliveryBoy", isOnline: true }),

      // Today's completed deliveries
      Order.aggregate([
        { $unwind: "$shopOrders" },
        {
          $match: {
            "shopOrders.status": ORDER_STATUS.DELIVERED,
            "shopOrders.deliveredAt": { $gte: todayStart },
          },
        },
        { $count: "total" },
      ]),

      // Average delivery time in minutes (deliveredAt - shopOrder.createdAt)
      Order.aggregate([
        { $unwind: "$shopOrders" },
        {
          $match: {
            "shopOrders.status": ORDER_STATUS.DELIVERED,
            "shopOrders.deliveredAt": { $ne: null },
          },
        },
        {
          $project: {
            minutes: {
              $divide: [
                { $subtract: ["$shopOrders.deliveredAt", "$shopOrders.createdAt"] },
                60000,
              ],
            },
          },
        },
        { $group: { _id: null, avg: { $avg: "$minutes" } } },
      ]),

      // Top 5 riders by delivery count
      Order.aggregate([
        { $unwind: "$shopOrders" },
        {
          $match: {
            "shopOrders.status": ORDER_STATUS.DELIVERED,
            "shopOrders.assignedDeliveryBoy": { $ne: null },
          },
        },
        {
          $group: {
            _id: "$shopOrders.assignedDeliveryBoy",
            deliveryCount: { $sum: 1 },
            totalValue: { $sum: "$shopOrders.subTotal" },
          },
        },
        { $sort: { deliveryCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "rider",
          },
        },
        { $unwind: "$rider" },
        {
          $project: {
            _id: 1,
            fullName: "$rider.fullName",
            email: "$rider.email",
            isOnline: "$rider.isOnline",
            deliveryCount: 1,
            totalValue: 1,
          },
        },
      ]),
    ]);

    const offlineRiders = totalRiders - onlineRiders;
    const busyCount = busyRiderIds.length;
    const availableOnline = Math.max(0, onlineRiders - busyCount);

    return res.success("Fleet stats fetched", {
      riders: {
        total: totalRiders,
        online: onlineRiders,
        offline: offlineRiders,
        busy: busyCount,
        available: availableOnline,
      },
      deliveries: {
        today: todayDeliveriesAgg[0]?.total ?? 0,
        avgMinutes: Math.round(avgTimeAgg[0]?.avg ?? 0),
      },
      topRiders: topRidersAgg,
    });
  } catch (err) {
    return res.error("getFleetStats error", err);
  }
};
