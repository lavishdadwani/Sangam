import React from "react";

const InputSelect = React.forwardRef(({
  label,
  labelIcon: LabelIcon,
  name,
  icon: Icon,
  options = [],
  required = false,
  error,
  className = "",
  selectClassName = "",
  register, // New prop: can pass register("name", {...rules}) directly
  ...restProps
}, ref) => {
  // Extract error message - handle both string and error object
  const errorMessage = error?.message || error || "";
  const hasError = !!errorMessage;

  const baseSelectClasses = "w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer";
  const errorClasses = hasError ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-[#ff4d2d] focus:ring-orange-200";
  const selectClasses = `${baseSelectClasses} ${errorClasses} ${selectClassName}`;
  const iconSelectClasses = Icon ? `${selectClasses} pl-11` : selectClasses;

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
        <select
          id={name}
          name={name}
          className={iconSelectClasses}
          required={required}
          {...registerProps}
        >
          {options.map((option, index) => {
            if (typeof option === "object" && option !== null) {
              return (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              );
            }
            return (
              <option key={index} value={option}>
                {option}
              </option>
            );
          })}
        </select>
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
        )}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {errorMessage && (
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
});

InputSelect.displayName = "InputSelect";

export default InputSelect;

