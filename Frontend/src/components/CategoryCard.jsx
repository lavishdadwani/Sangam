import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const CategoryCard = ({ name, image, onClick, isSelected = false }) => {
  return (
    <div 
      className={`w-[120px] h-[120px] md:w-[180px] md:h-[180px] rounded-2xl border-2 shrink-0 overflow-hidden bg-white shadow-xl transition-all duration-300 relative cursor-pointer group ${
        isSelected 
          ? "border-[#ff4d2d] shadow-[#ff4d2d]/30 shadow-2xl ring-2 ring-[#ff4d2d]/20" 
          : "border-[#ff4d2d] shadow-gray-200 hover:shadow-lg"
      }`}
      onClick={onClick}
    >
      <img
        src={image}
        alt={name}
        className={`w-full h-full object-cover transform transition-transform duration-300 ${
          isSelected ? "scale-105" : "group-hover:scale-110"
        }`}
      />
      <div className={`absolute bottom-0 w-full left-0 px-3 py-1 rounded-t-xl text-center shadow text-sm font-medium backdrop-blur transition-colors ${
        isSelected 
          ? "bg-[#ff4d2d]/95 text-white" 
          : "bg-[#ffffff96] bg-opacity-95 text-gray-800"
      }`}>
        <div className="flex items-center justify-center gap-1.5">
          {isSelected && <FaCheckCircle className="text-xs" />}
          <span>{name}</span>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 bg-[#ff4d2d] text-white rounded-full p-1 shadow-lg">
          <FaCheckCircle size={16} />
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
