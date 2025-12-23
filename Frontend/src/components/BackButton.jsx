import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const BackButton = ({ onClick, className = "", size = 35 }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate("/");
    }
  };

  return (
    <div 
      className={`cursor-pointer transition-all duration-200 hover:scale-110 hover:-translate-x-1 active:scale-95 ${className}`}
      onClick={handleClick}
    >
      <IoIosArrowRoundBack size={size} className="text-[#ff4d2d]" />
    </div>
  );
};

export default BackButton;

