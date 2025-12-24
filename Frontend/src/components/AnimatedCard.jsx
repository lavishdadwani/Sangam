import React from "react";

const AnimatedCard = ({ 
  children, 
  index = 0, 
  delay = 100, 
  className = "",
  animationType = "fadeInUp",
  duration = "0.5s"
}) => {
  const animationClass = `opacity-0 transform translate-y-6 scale-95 animate-[${animationType}_${duration}_ease-out_forwards]`;
  
  return (
    <div
      className={`${animationClass} ${className}`}
      style={{ animationDelay: `${index * delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;

