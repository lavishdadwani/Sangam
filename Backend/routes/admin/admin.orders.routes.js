import express from "express";
import {
  getOrders,
  getOrderById,
  forceCancelOrder,
  updateShopOrderStatus,
  reassignRider,
} from "../../controllers/admin/adminOrders.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/", isAdmin, getOrders);
router.get("/:orderId", isAdmin, getOrderById);
router.patch("/:orderId/cancel", isAdmin, forceCancelOrder);
router.patch("/:orderId/shop-orders/:shopOrderId/status", isAdmin, updateShopOrderStatus);
router.patch("/:orderId/shop-orders/:shopOrderId/reassign", isAdmin, reassignRider);

export default router;
