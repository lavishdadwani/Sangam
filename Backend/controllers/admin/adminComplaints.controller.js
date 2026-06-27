import Complaint from "../../models/complaint.model.js";
import Admin from "../../models/admin.model.js";

export const getComplaints = async (req, res) => {
  try {
    const { status = "", category = "", search = "", page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status)   filter.status = status;
    if (category) filter.category = category;
    if (search)   filter.title = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate("raisedBy", "fullName email role")
        .populate("assignedTo", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Complaint.countDocuments(filter),
    ]);

    return res.success("Complaints fetched", {
      complaints,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    return res.error("getComplaints error", err);
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.complaintId)
      .populate("raisedBy", "fullName email mobile role photo")
      .populate("assignedTo", "fullName email role")
      .populate("orderId", "totalAmount paymentMethod createdAt");

    if (!complaint) return res.error("Complaint not found");

    return res.success("Complaint fetched", complaint);
  } catch (err) {
    return res.error("getComplaintById error", err);
  }
};

export const assignComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { adminId } = req.body;

    const [complaint, admin] = await Promise.all([
      Complaint.findById(complaintId),
      Admin.findById(adminId).select("-password"),
    ]);

    if (!complaint) return res.error("Complaint not found");
    if (!admin)     return res.error("Admin not found");

    complaint.assignedTo = admin._id;
    if (complaint.status === "open") complaint.status = "in_progress";
    await complaint.save();

    return res.success("Complaint assigned", {
      status: complaint.status,
      assignedTo: { _id: admin._id, fullName: admin.fullName, email: admin.email },
    });
  } catch (err) {
    return res.error("assignComplaint error", err);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    const allowed = ["open", "in_progress", "resolved", "closed"];
    if (!allowed.includes(status)) return res.error("Invalid status");

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { status },
      { new: true }
    );

    if (!complaint) return res.error("Complaint not found");

    return res.success("Status updated", { status: complaint.status });
  } catch (err) {
    return res.error("updateStatus error", err);
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { resolution } = req.body;

    if (!resolution?.trim()) return res.error("Resolution note is required");

    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        resolution: resolution.trim(),
        status: "resolved",
        resolvedAt: new Date(),
      },
      { new: true }
    );

    if (!complaint) return res.error("Complaint not found");

    return res.success("Complaint resolved", complaint);
  } catch (err) {
    return res.error("resolveComplaint error", err);
  }
};

// For the assignment dropdown in the admin panel
export const getAdminList = async (req, res) => {
  try {
    const admins = await Admin.find({ isActive: true }).select("fullName email role");
    return res.success("Admin list", admins);
  } catch (err) {
    return res.error("getAdminList error", err);
  }
};
