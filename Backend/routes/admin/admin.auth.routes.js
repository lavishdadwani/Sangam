import express from "express";
import { adminLogin, adminLogout, getMe } from "../../controllers/admin/adminAuth.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/me", isAdmin, getMe);
router.post("/logout", isAdmin, adminLogout);

export default router;
