import express from "express";
import {
  getRestaurants,
  getRestaurantById,
  updateRestaurantStatus,
} from "../../controllers/admin/adminRestaurants.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/", isAdmin, getRestaurants);
router.get("/:restaurantId", isAdmin, getRestaurantById);
router.patch("/:restaurantId/status", isAdmin, updateRestaurantStatus);

export default router;
