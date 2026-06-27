import mongoose from "mongoose";

const NotificationTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["info", "warning", "promotion", "system"],
      default: "info",
    },
  },
  { timestamps: true }
);

const NotificationTemplate = mongoose.model("NotificationTemplate", NotificationTemplateSchema);
export default NotificationTemplate;
