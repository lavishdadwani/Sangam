import User from "../../models/user.model.js";
import Shop from "../../models/shop.model.js";
import Order from "../../models/order.model.js";
import { ORDER_STATUS } from "../../constants/orderStatus.js";

export const getStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalOwners,
      totalDeliveryBoys,
      totalShops,
      totalOrders,
      pendingOrders,
      todayOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "owner" }),
      User.countDocuments({ role: "deliveryBoy" }),
      Shop.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ "shopOrders.status": ORDER_STATUS.PENDING }),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.aggregate([
        { $match: { payment: true } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total ?? 0;

    return res.success("Stats fetched", {
      users: {
        total: totalUsers,
        owners: totalOwners,
        deliveryBoys: totalDeliveryBoys,
      },
      shops: {
        total: totalShops,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        today: todayOrders,
      },
      revenue: {
        total: totalRevenue,
      },
    });
  } catch (err) {
    return res.error("getStats error", err);
  }
};
