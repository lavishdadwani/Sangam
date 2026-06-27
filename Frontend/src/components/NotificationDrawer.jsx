import React, { useEffect, useState } from "react";
import { FaBell, FaTimes, FaInfoCircle, FaExclamationTriangle, FaTag, FaCog } from "react-icons/fa";
import notificationAPI from "../../services/notification";

const LS_KEY = "notif_last_seen";

const TYPE_CONFIG = {
  info:      { icon: FaInfoCircle,         cls: "text-blue-500 bg-blue-50" },
  warning:   { icon: FaExclamationTriangle, cls: "text-amber-500 bg-amber-50" },
  promotion: { icon: FaTag,                cls: "text-pink-500 bg-pink-50" },
  system:    { icon: FaCog,                cls: "text-gray-500 bg-gray-100" },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const NotificationDrawer = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastSeen = localStorage.getItem(LS_KEY) ?? "0";

  useEffect(() => {
    notificationAPI.getNotifications()
      .then((r) => { if (r.ok) setNotifications(r.data.data ?? []); })
      .finally(() => setLoading(false));

    // Mark all as seen when drawer opens
    localStorage.setItem(LS_KEY, new Date().toISOString());
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/20" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[9999] shadow-2xl flex flex-col animate-[slideInRight_0.2s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FaBell className="text-[#ff4d2d]" />
            <h2 className="font-bold text-gray-800">Notifications</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-6 h-6 border-2 border-[#ff4d2d] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
              <FaBell size={36} />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => {
              const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
              const Icon = cfg.icon;
              const isNew = new Date(n.createdAt).toISOString() > lastSeen;

              return (
                <div
                  key={n._id}
                  className={`flex gap-3 px-5 py-4 border-b border-gray-50 ${isNew ? "bg-orange-50/40" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.cls}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800 leading-snug">{n.title}</p>
                      {isNew && <span className="w-2 h-2 bg-[#ff4d2d] rounded-full flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export { LS_KEY };
export default NotificationDrawer;
