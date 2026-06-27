import express from "express";
import { createComplaint, getMyComplaints } from "../controllers/complaint.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/", isAuth, createComplaint);
router.get("/", isAuth, getMyComplaints);

export default router;
