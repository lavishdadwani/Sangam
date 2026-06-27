import express from "express";
import { getFleetStats } from "../../controllers/admin/adminFleet.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/", isAdmin, getFleetStats);

export default router;
