import React, { useState, useEffect } from 'react'
import { BarLoader, BeatLoader, BounceLoader, CircleLoader, ClimbingBoxLoader, ClockLoader } from 'react-spinners';

const loaders = [
  ClockLoader,
  BarLoader,
  BounceLoader,
  BeatLoader,
  CircleLoader,
  ClimbingBoxLoader,
];

const LoadingMessage = ({message, show = true, compact = false, style, className = "", dynamic = false, layout = "col", size = 40, color = "#878787"}) => {
  const [LoaderComponent, setLoaderComponent] = useState(() => loaders[0]);

  useEffect(() => {
    if (dynamic) {
      const randomNumber = Math.floor(Math.random() * loaders.length);
      setLoaderComponent(() => loaders[randomNumber]);
    } else {
      setLoaderComponent(() => loaders[0]);
    }
  }, [dynamic]);

  if (!show) return null;

  const layoutClass = layout === "row" ? "flex-row" : "flex-col";
  const spacingClass = compact ? "m-4" : "m-10";

  return (
    <div 
      className={`flex ${layoutClass} items-center justify-center ${spacingClass} ${className}`}
      style={style}
    >
      <LoaderComponent color={color} loading={show} size={size} />
      {message && (
        <span 
          className="mt-2 text-center font-medium"
          style={{
            color: color,
            fontSize: 14
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
}

export default LoadingMessage
