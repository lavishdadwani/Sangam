import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import complaintAPI from "../../services/complaint";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import AnimatedCard from "../components/AnimatedCard";
import ComplaintForm from "../components/ComplaintForm";
import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const STATUS_STYLES = {
  open:        "bg-red-50 text-red-600 border-red-200",
  in_progress: "bg-yellow-50 text-yellow-700 border-yellow-200",
  resolved:    "bg-green-50 text-green-700 border-green-200",
  closed:      "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABELS = {
  open:        "Open",
  in_progress: "In Progress",
  resolved:    "Resolved",
  closed:      "Closed",
};

const MyComplaints = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const result = await complaintAPI.getMyComplaints();
      if (result.ok) {
        setComplaints(result.data.data || []);
      } else {
        dispatch(openSnackbar(result.data?.message || "Failed to load complaints", "error"));
      }
    } catch (err) {
      dispatch(openSnackbar(err.message, "error"));
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    fetchComplaints();
  };

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-[800px]">
        <div className="flex items-center justify-between mb-6">
          <PageHeader
            title="My Complaints"
            icon={FaExclamationTriangle}
            backButtonAction={() => navigate("/")}
          />
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#ff4d2d] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#e04428] transition-colors shadow"
          >
            + New Complaint
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={FaExclamationTriangle}
            title="No complaints yet"
            description="If you have an issue with an order, restaurant, or rider — we're here to help."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {complaints.map((c, i) => (
              <AnimatedCard key={c._id} index={i} delay={60}>
                <div className="bg-white rounded-2xl p-5 shadow border border-orange-50">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-gray-800">{c.title}</h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${STATUS_STYLES[c.status] || STATUS_STYLES.open}`}>
                      {STATUS_LABELS[c.status] || c.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{c.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">{c.category}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                  {c.resolution && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs font-semibold text-green-700 mb-1">Resolution</p>
                      <p className="text-sm text-green-800">{c.resolution}</p>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>

      {showForm && <ComplaintForm onClose={handleFormClose} />}
    </div>
  );
};

export default MyComplaints;
