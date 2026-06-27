import express from "express";
import { getStats } from "../../controllers/admin/adminStats.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/", isAdmin, getStats);

export default router;
