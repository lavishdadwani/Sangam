import React from "react";

const InputText = React.forwardRef(({
  label,
  labelIcon: LabelIcon,
  type = "text",
  name,
  placeholder,
  icon: Icon,
  required = false,
  error,
  className = "",
  inputClassName = "",
  min,
  max,
  step,
  register, // New prop: can pass register("name", {...rules}) directly
  ...restProps
}, ref) => {
  // Extract error message - handle both string and error object
  const errorMessage = error?.message || error || "";
  const hasError = !!errorMessage;

  const baseInputClasses = "w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white placeholder:text-gray-400";
  const errorClasses = hasError ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-[#ff4d2d] focus:ring-orange-200";
  const inputClasses = `${baseInputClasses} ${errorClasses} ${inputClassName}`;
  const iconInputClasses = Icon ? `${inputClasses} pl-11` : inputClasses;

  // If register prop is provided, use it; otherwise use ref and restProps
  const registerProps = register || { ref, ...restProps };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={name} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          {LabelIcon && <LabelIcon className="text-[#ff4d2d] text-xs" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          className={iconInputClasses}
          required={required}
          min={min}
          max={max}
          step={step}
          {...registerProps}
        />
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
        )}
      </div>

      {errorMessage && (
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
});

InputText.displayName = "InputText";

export default InputText;

