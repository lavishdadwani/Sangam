import express from "express";
import { getAnalytics } from "../../controllers/admin/adminAnalytics.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/", isAdmin, getAnalytics);

export default router;
