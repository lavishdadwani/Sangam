import React from "react";
import ResponsiveModal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import classNames from "classnames";
import { FaTimes } from "react-icons/fa";

const Modal = ({ legacy, subtitle, isOpen, onClose, title, children, className = "", size = "md" }) => {
  const sizeMaxWidths = {
    sm: "28rem", // max-w-md
    md: "42rem", // max-w-2xl
    lg: "56rem", // max-w-4xl
    xl: "72rem", // max-w-6xl
    full: "95%",
  };

  const customStyles = {
    modal: {
      padding: 0,
      borderRadius: "1rem",
      maxWidth: sizeMaxWidths[size] || sizeMaxWidths.md,
      width: size === "full" ? "95%" : "calc(100% - 2rem)",
      maxHeight: "90vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      margin: "auto",
      position: "relative",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    modalContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    },
  };

  const CloseButton = ({ onClick, ariaLabel }) => (
    <button
      onClick={onClose}
      aria-label={ariaLabel}
      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
    >
      <FaTimes className="w-5 h-5" />
    </button>
  );

  return (
    <ResponsiveModal
      open={isOpen}
      onClose={onClose}
      center
      classNames={{
        modal: `custom-modal ${className}`,
        overlay: "custom-overlay",
      }}
      styles={customStyles}
      closeIcon={<CloseButton onClick={onClose} ariaLabel="Close modal" />}
      showCloseIcon={!!title}
      animationDuration={200}
    >
      {title && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
      )}
      <div className="overflow-y-auto flex-1 p-6" style={{ maxHeight: "calc(90vh - 80px)" }}>
        {children}
      </div>
    </ResponsiveModal>
  );
};

export default Modal;