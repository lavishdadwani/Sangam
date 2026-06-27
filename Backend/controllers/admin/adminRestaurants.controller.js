import Shop from "../../models/shop.model.js";
import Item from "../../models/item.model.js";
import Order from "../../models/order.model.js";

export const getRestaurants = async (req, res) => {
  try {
    const { search = "", status = "", city = "", page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (city) filter.city = { $regex: city, $options: "i" };
    if (search) filter.name = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);

    const [restaurants, total] = await Promise.all([
      Shop.find(filter)
        .populate("owner", "fullName email mobile")
        .select("-items")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Shop.countDocuments(filter),
    ]);

    return res.success("Restaurants fetched", {
      restaurants,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    return res.error("getRestaurants error", err);
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const shop = await Shop.findById(restaurantId).populate(
      "owner",
      "fullName email mobile photo createdAt"
    );
    if (!shop) return res.error("Restaurant not found");

    const [items, revenueAgg, orderCount] = await Promise.all([
      Item.find({ shop: restaurantId }).select("name price category rating foodType image"),
      Order.aggregate([
        { $unwind: "$shopOrders" },
        {
          $match: {
            "shopOrders.shop": shop._id,
            payment: true,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$shopOrders.subTotal" },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
      Order.countDocuments({ "shopOrders.shop": shop._id }),
    ]);

    const revenue = revenueAgg[0] ?? { totalRevenue: 0, totalOrders: 0 };

    // Compute average rating across all items
    const ratedItems = items.filter((i) => i.rating.count > 0);
    const avgRating =
      ratedItems.length > 0
        ? ratedItems.reduce((s, i) => s + i.rating.average, 0) / ratedItems.length
        : 0;

    return res.success("Restaurant fetched", {
      shop,
      items,
      stats: {
        itemCount: items.length,
        totalOrders: orderCount,
        totalRevenue: revenue.totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10,
      },
    });
  } catch (err) {
    return res.error("getRestaurantById error", err);
  }
};

export const updateRestaurantStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "active", "suspended", "rejected"];
    if (!allowed.includes(status)) return res.error("Invalid status value");

    const shop = await Shop.findByIdAndUpdate(
      restaurantId,
      { status },
      { new: true }
    ).populate("owner", "fullName email");

    if (!shop) return res.error("Restaurant not found");

    return res.success(`Restaurant status updated to ${status}`, shop);
  } catch (err) {
    return res.error("updateRestaurantStatus error", err);
  }
};
