import React from "react";

const AnimatedCard = ({
  children,
  index = 0,
  delay = 100,
  className = "",
  animationType = "slideInRight",
  duration = "0.4s",
}) => {
  const animationStyle = {
    animationDelay: `${index * delay}ms`,
    animationDuration: duration,
    animationFillMode: "forwards",
    animationTimingFunction: "ease-out",
  };

  const getAnimationClass = () => {
    switch (animationType) {
      case "slideInRight":
        return "animate-slide-in-right";
      case "fadeInUp":
        return "animate-fade-in-up";
      default:
        return "animate-fade-in";
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation-name: slideInRight;
        }
        .animate-fade-in-up {
          animation-name: fadeInUp;
        }
        .animate-fade-in {
          animation-name: fadeIn;
        }
      `}</style>
      <div
        className={`${getAnimationClass()} ${className}`}
        style={animationStyle}
      >
        {children}
      </div>
    </>
  );
};

export default AnimatedCard;
