import React from "react";
import BackButton from "./BackButton";

const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  showBackButton = true,
  backButtonAction,
  className = "",
  rightContent
}) => {
  return (
    <div className={`mb-8 transform translate-y-[-10px] opacity-0 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards] ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 md:gap-6">
          {showBackButton && (
            <BackButton onClick={backButtonAction} />
          )}
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon size={32} className="text-[#ff4d2d] animate-pulse" />
            )}
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-start text-gray-800 tracking-tight mb-1">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm md:text-base text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        {rightContent && (
          <div>{rightContent}</div>
        )}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </div>
  );
};

export default PageHeader;

