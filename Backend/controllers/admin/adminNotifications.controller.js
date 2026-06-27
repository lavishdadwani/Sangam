import User from "../../models/user.model.js";
import Notification from "../../models/notification.model.js";
import NotificationTemplate from "../../models/notificationTemplate.model.js";
import { sendEmail } from "../../services/email.js";

// ── Send ──────────────────────────────────────────────────────────────────────
export const sendNotification = async (req, res) => {
  try {
    const { title, message, type, targetRole, targetUserId, sendEmailFlag, scheduledAt } = req.body;

    if (!title?.trim() || !message?.trim() || !targetRole) {
      return res.error("Title, message, and target are required");
    }

    // If scheduled for the future, store and return
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      const notification = await Notification.create({
        title, message, type: type || "info",
        targetRole, targetUserId: targetUserId || null,
        sendEmail: !!sendEmailFlag,
        sentBy: req.adminId,
        status: "scheduled",
        scheduledAt: new Date(scheduledAt),
      });
      return res.success("Notification scheduled", notification);
    }

    // Build user query
    let userFilter = {};
    if (targetRole === "specific" && targetUserId) {
      userFilter._id = targetUserId;
    } else if (targetRole !== "all") {
      userFilter.role = targetRole;
    }
    userFilter.status = "active";

    const users = await User.find(userFilter).select("email fullName");
    const recipientCount = users.length;

    // Send emails in background — don't await to keep response fast
    if (sendEmailFlag && users.length > 0) {
      const emailBody = `
        <div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#1b2960">${title}</h2>
          <p style="color:#374151;line-height:1.6">${message}</p>
          <p style="color:#9ca3af;font-size:0.8rem">— FoodOps Platform</p>
        </div>`;

      Promise.allSettled(
        users.map((u) => sendEmail(u.email, title, emailBody))
      ).catch(() => {});
    }

    const notification = await Notification.create({
      title, message, type: type || "info",
      targetRole, targetUserId: targetUserId || null,
      sendEmail: !!sendEmailFlag,
      sentBy: req.adminId,
      status: "sent",
      sentAt: new Date(),
      recipientCount,
    });

    return res.success(`Notification sent to ${recipientCount} user(s)`, notification);
  } catch (err) {
    return res.error("sendNotification error", err);
  }
};

// ── History ───────────────────────────────────────────────────────────────────
export const getHistory = async (req, res) => {
  try {
    const { status = "", page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate("sentBy", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments(filter),
    ]);

    return res.success("Notification history", {
      notifications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    return res.error("getHistory error", err);
  }
};

// ── Templates ─────────────────────────────────────────────────────────────────
export const getTemplates = async (req, res) => {
  try {
    const templates = await NotificationTemplate.find().sort({ createdAt: -1 });
    return res.success("Templates fetched", templates);
  } catch (err) {
    return res.error("getTemplates error", err);
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, title, message, type } = req.body;
    if (!name?.trim() || !title?.trim() || !message?.trim()) {
      return res.error("Name, title, and message are required");
    }

    const template = await NotificationTemplate.create({
      name: name.trim(), title: title.trim(),
      message: message.trim(), type: type || "info",
    });

    return res.success("Template created", template, null, 201);
  } catch (err) {
    if (err.code === 11000) return res.error("A template with this name already exists");
    return res.error("createTemplate error", err);
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const template = await NotificationTemplate.findByIdAndDelete(req.params.templateId);
    if (!template) return res.error("Template not found");
    return res.success("Template deleted");
  } catch (err) {
    return res.error("deleteTemplate error", err);
  }
};
