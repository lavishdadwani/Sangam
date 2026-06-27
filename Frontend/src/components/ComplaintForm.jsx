import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import complaintAPI from "../../services/complaint";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

const CATEGORIES = [
  { value: "order",      label: "Order Issue" },
  { value: "restaurant", label: "Restaurant" },
  { value: "rider",      label: "Delivery Rider" },
  { value: "payment",    label: "Payment" },
  { value: "other",      label: "Other" },
];

const ComplaintForm = ({ onClose, orderId = null }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "order",
    orderId: orderId || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    try {
      setSubmitting(true);
      const result = await complaintAPI.submitComplaint({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        orderId: form.orderId || undefined,
      });

      if (result.ok) {
        dispatch(openSnackbar("Complaint submitted. Our team will review it.", "success"));
        onClose();
      } else {
        dispatch(openSnackbar(result.data?.message || "Failed to submit complaint", "error"));
      }
    } catch (err) {
      dispatch(openSnackbar(err.message || "Something went wrong", "error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-[#ff4d2d]" />
            <h2 className="text-lg font-bold text-gray-800">Submit a Complaint</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Title <span className="text-red-500">*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={120}
              placeholder="Short summary of the issue"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the issue in detail…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40 resize-none"
            />
          </div>

          {!orderId && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Order ID <span className="text-gray-400">(optional)</span></label>
              <input
                name="orderId"
                value={form.orderId}
                onChange={handleChange}
                placeholder="Paste order ID if relevant"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40"
              />
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.title.trim() || !form.description.trim()}
              className="flex-1 bg-[#ff4d2d] text-white py-2 rounded-xl text-sm font-semibold hover:bg-[#e04428] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
