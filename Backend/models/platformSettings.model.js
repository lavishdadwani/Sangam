import mongoose from "mongoose";

const PlatformSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "platform", unique: true },

    deliveryCharge: {
      base:       { type: Number, default: 30 },
      perKm:      { type: Number, default: 5 },
      freeAbove:  { type: Number, default: 500 },
    },
    commission: {
      percentage: { type: Number, default: 15 },
    },
    tax: {
      gst: { type: Number, default: 18 },
    },
    order: {
      minOrderAmount:     { type: Number, default: 100 },
      maxDeliveryRadiusKm: { type: Number, default: 20 },
    },
    notifications: {
      emailEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const PlatformSettings = mongoose.model("PlatformSettings", PlatformSettingsSchema);

export default PlatformSettings;
