import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import PlatformSettings from "../models/platformSettings.model.js";

export const getUserNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user) return res.unauthorized("User not found");

    const notifications = await Notification.find({
      status: "sent",
      $or: [{ targetRole: "all" }, { targetRole: user.role }],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("title message type createdAt");

    return res.success("Notifications fetched", notifications);
  } catch (err) {
    return res.error("getUserNotifications error", err);
  }
};

export const getPublicSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne({ key: "platform" }).select(
      "deliveryCharge tax order"
    );

    // Return defaults if no settings document exists yet
    return res.success("Settings", settings ?? {
      deliveryCharge: { base: 30, perKm: 5, freeAbove: 500 },
      tax: { gst: 18 },
      order: { minOrderAmount: 100, maxDeliveryRadiusKm: 20 },
    });
  } catch (err) {
    return res.error("getPublicSettings error", err);
  }
};
