import express from "express";
import {
  getRiders,
  getRiderById,
  updateRiderStatus,
  approveRider,
} from "../../controllers/admin/adminRiders.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/", isAdmin, getRiders);
router.get("/:riderId", isAdmin, getRiderById);
router.patch("/:riderId/status", isAdmin, updateRiderStatus);
router.patch("/:riderId/approve", isAdmin, approveRider);

export default router;
