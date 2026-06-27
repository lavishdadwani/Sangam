import express from "express";
import {
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
  changePassword,
} from "../../controllers/admin/adminSettings.controller.js";
import isAdmin, { requireSuperAdmin } from "../../middlewares/isAdmin.js";

const router = express.Router();

// Platform settings (only superadmin can write)
router.get("/",   isAdmin, getSettings);
router.put("/",   isAdmin, requireSuperAdmin, updateSettings);

// Admin profile (any admin, scoped to themselves)
router.get("/profile",          isAdmin, getProfile);
router.put("/profile",          isAdmin, updateProfile);
router.put("/change-password",  isAdmin, changePassword);

export default router;
