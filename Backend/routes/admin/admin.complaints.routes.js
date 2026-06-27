import express from "express";
import {
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateStatus,
  resolveComplaint,
  getAdminList,
} from "../../controllers/admin/adminComplaints.controller.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

router.get("/",                        isAdmin, getComplaints);
router.get("/admins",                  isAdmin, getAdminList);
router.get("/:complaintId",            isAdmin, getComplaintById);
router.patch("/:complaintId/assign",   isAdmin, assignComplaint);
router.patch("/:complaintId/status",   isAdmin, updateStatus);
router.patch("/:complaintId/resolve",  isAdmin, resolveComplaint);

export default router;
