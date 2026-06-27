import express from "express";
import {
  sendNotification,
  getHistory,
  getTemplates,
  createTemplate,
  deleteTemplate,
} from "../../controllers/admin/adminNotifications.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.post("/send",                      isAdmin, sendNotification);
router.get("/history",                    isAdmin, getHistory);
router.get("/templates",                  isAdmin, getTemplates);
router.post("/templates",                 isAdmin, createTemplate);
router.delete("/templates/:templateId",   isAdmin, deleteTemplate);

export default router;
