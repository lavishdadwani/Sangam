import React from "react";
import { FaCheckCircle, FaClock, FaTruck, FaBox } from "react-icons/fa";
import { MdPending } from "react-icons/md";

const StatusBadge = ({ status, showIcon = true, className = "" }) => {
  const getStatusConfig = (status) => {
    switch(status?.toLowerCase()) {
      case "delivered":
        return {
          icon: FaCheckCircle,
          iconClass: "text-green-600 animate-pulse",
          textClass: "text-green-600",
          bgClass: "bg-green-50",
          borderClass: "border-green-200",
        };
      case "awaiting pickup":
        return {
          icon: FaBox,
          iconClass: "text-purple-600 animate-pulse",
          textClass: "text-purple-600",
          bgClass: "bg-purple-50",
          borderClass: "border-purple-200",
          animationStyle: { animationDuration: '2s' },
        };
      case "out for delivery":
        return {
          icon: FaTruck,
          iconClass: "text-blue-600 animate-bounce",
          textClass: "text-blue-600",
          bgClass: "bg-blue-50",
          borderClass: "border-blue-200",
          animationStyle: { animationDuration: '2s' },
        };
      case "preparing":
        return {
          icon: FaClock,
          iconClass: "text-orange-600 animate-spin",
          textClass: "text-orange-600",
          bgClass: "bg-orange-50",
          borderClass: "border-orange-200",
          animationStyle: { animationDuration: '3s' },
        };
      default:
        return {
          icon: MdPending,
          iconClass: "text-gray-600 animate-pulse",
          textClass: "text-gray-600",
          bgClass: "bg-gray-50",
          borderClass: "border-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold ${config.textClass} ${config.bgClass} ${config.borderClass} ${className}`}>
      {showIcon && Icon && (
        <Icon 
          className={config.iconClass} 
          style={config.animationStyle}
        />
      )}
      <span className="capitalize">{status}</span>
    </div>
  );
};

export default StatusBadge;

