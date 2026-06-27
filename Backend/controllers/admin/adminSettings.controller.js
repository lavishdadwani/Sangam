import bcrypt from "bcryptjs";
import Admin from "../../models/admin.model.js";
import PlatformSettings from "../../models/platformSettings.model.js";

// ── Platform settings ─────────────────────────────────────────────────────────

export const getSettings = async (req, res) => {
  try {
    // Auto-create default settings on first access
    const settings = await PlatformSettings.findOneAndUpdate(
      { key: "platform" },
      { $setOnInsert: { key: "platform" } },
      { upsert: true, new: true }
    );
    return res.success("Settings fetched", settings);
  } catch (err) {
    return res.error("getSettings error", err);
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { deliveryCharge, commission, tax, order, notifications } = req.body;

    const settings = await PlatformSettings.findOneAndUpdate(
      { key: "platform" },
      {
        $set: {
          ...(deliveryCharge  && { deliveryCharge }),
          ...(commission      && { commission }),
          ...(tax             && { tax }),
          ...(order           && { order }),
          ...(notifications !== undefined && { notifications }),
        },
      },
      { upsert: true, new: true }
    );

    return res.success("Settings updated", settings);
  } catch (err) {
    return res.error("updateSettings error", err);
  }
};

// ── Admin profile ─────────────────────────────────────────────────────────────

export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");
    if (!admin) return res.unauthorized("Admin not found");
    return res.success("Profile fetched", admin);
  } catch (err) {
    return res.error("getProfile error", err);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName?.trim()) return res.error("Full name is required");

    const admin = await Admin.findByIdAndUpdate(
      req.adminId,
      { fullName: fullName.trim() },
      { new: true, select: "-password" }
    );

    return res.success("Profile updated", admin);
  } catch (err) {
    return res.error("updateProfile error", err);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.error("Both current and new password are required");

    if (newPassword.length < 6)
      return res.error("New password must be at least 6 characters");

    const admin = await Admin.findById(req.adminId);
    if (!admin) return res.unauthorized("Admin not found");

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.error("Current password is incorrect");

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return res.success("Password changed successfully");
  } catch (err) {
    return res.error("changePassword error", err);
  }
};
