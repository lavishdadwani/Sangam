import React from "react";
import ButtonSquare from "./ButtonSquare";
import { useNavigate } from "react-router-dom";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonAction,
  buttonRoute,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (buttonAction) {
      buttonAction();
    } else if (buttonRoute) {
      navigate(buttonRoute);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] py-16 px-4 opacity-0 animate-[fadeIn_0.6s_ease-out_0.2s_forwards] ${className}`}>
      <div className="flex flex-col items-center justify-center gap-8 max-w-md">
        {/* Icon Container */}
        <div className="relative mb-2">
          <div className="absolute inset-0 bg-[#ff4d2d]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-orange-100 to-orange-50 rounded-full p-10 md:p-12 shadow-xl border-2 border-[#ff4d2d]/20 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            {Icon && (
              <Icon className="text-[#ff4d2d] text-6xl md:text-7xl transform translate-y-[-10px] opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards]" />
            )}
          </div>
        </div>
        
        {/* Message */}
        <div className="text-center space-y-4 transform translate-y-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-sm px-4">
              {description}
            </p>
          )}
        </div>
        
        {/* Action Button */}
        {buttonText && (
          <div className="transform translate-y-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.8s_forwards]">
            <ButtonSquare
              styleType="default"
              onClick={handleButtonClick}
              className="mt-2 px-10 py-3.5 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              {buttonText}
            </ButtonSquare>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

