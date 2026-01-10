import React from "react";
import { RxCross2 } from "react-icons/rx";

const CloseButton = ({ onClick, className = "", size = 24, ariaLabel = "Close" }) => {
  return (
    <button
      onClick={onClick}
      className={`text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full cursor-pointer ${className}`}
      aria-label={ariaLabel}
    >
      <RxCross2 size={size} />
    </button>
  );
};

export default CloseButton;

