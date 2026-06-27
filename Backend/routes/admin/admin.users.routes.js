import express from "express";
import {
  getUsers,
  getUserById,
  updateUserStatus,
} from "../../controllers/admin/adminUsers.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/", isAdmin, getUsers);
router.get("/:userId", isAdmin, getUserById);
router.patch("/:userId/status", isAdmin, updateUserStatus);

export default router;
