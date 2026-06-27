import User from "../../models/user.model.js";
import Order from "../../models/order.model.js";

export const getAnalytics = async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 90);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      revenueAndOrders,
      customerGrowth,
      peakHours,
      paymentBreakdown,
      topRestaurants,
    ] = await Promise.all([

      // Daily revenue + order count
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, payment: true } },
        {
          $group: {
            _id: {
              year:  { $year:  "$createdAt" },
              month: { $month: "$createdAt" },
              day:   { $dayOfMonth: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),

      // New customer registrations per day
      User.aggregate([
        { $match: { role: "user", createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year:  { $year:  "$createdAt" },
              month: { $month: "$createdAt" },
              day:   { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),

      // Orders per hour of day (0-23)
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id:   { $hour: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // COD vs Online payment split
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id:   "$paymentMethod",
            count: { $sum: 1 },
          },
        },
      ]),

      // Top 5 restaurants by revenue in the period
      Order.aggregate([
        { $match: { payment: true, createdAt: { $gte: startDate } } },
        { $unwind: "$shopOrders" },
        {
          $group: {
            _id:     "$shopOrders.shop",
            revenue: { $sum: "$shopOrders.subTotal" },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from:         "shops",
            localField:   "_id",
            foreignField: "_id",
            as:           "shop",
          },
        },
        { $unwind: "$shop" },
        {
          $project: {
            _id:     1,
            name:    "$shop.name",
            city:    "$shop.city",
            revenue: 1,
            orders:  1,
          },
        },
      ]),
    ]);

    return res.success("Analytics fetched", {
      days,
      revenueAndOrders,
      customerGrowth,
      peakHours,
      paymentBreakdown,
      topRestaurants,
    });
  } catch (err) {
    return res.error("getAnalytics error", err);
  }
};
