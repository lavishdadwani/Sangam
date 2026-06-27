import Complaint from "../models/complaint.model.js";

export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, orderId } = req.body;

    if (!title?.trim() || !description?.trim() || !category) {
      return res.error("Title, description, and category are required");
    }

    const complaint = await Complaint.create({
      title: title.trim(),
      description: description.trim(),
      category,
      raisedBy: req.userId,
      orderId: orderId || null,
    });

    return res.success("Complaint submitted", complaint, null, 201);
  } catch (err) {
    return res.error("createComplaint error", err);
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ raisedBy: req.userId })
      .sort({ createdAt: -1 })
      .select("-resolution");

    return res.success("My complaints", complaints);
  } catch (err) {
    return res.error("getMyComplaints error", err);
  }
};
