import React from "react";
import { getPasswordStrength } from "../utils/passwordStrength";

const PasswordStrengthIndicator = ({ password }) => {
  if (!password || password.length === 0) {
    return null;
  }

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
          />
        </div>
        <span
          className={`text-xs font-medium whitespace-nowrap ${
            passwordStrength.strength >= 3
              ? "text-green-600"
              : passwordStrength.strength >= 2
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {passwordStrength.label}
        </span>
      </div>

      {/* Password Requirements */}
      <div className="text-xs text-gray-600 space-y-1">
        <p className="font-medium text-gray-700">Password requirements:</p>
        <div className="grid grid-cols-2 gap-1">
          <div
            className={`flex items-center gap-1 ${
              passwordStrength.checks.length ? "text-green-600" : "text-gray-400"
            }`}
          >
            <span className="font-bold">
              {passwordStrength.checks.length ? "✓" : "○"}
            </span>
            <span>At least 8 characters</span>
          </div>
          <div
            className={`flex items-center gap-1 ${
              passwordStrength.checks.hasSpecialChar
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            <span className="font-bold">
              {passwordStrength.checks.hasSpecialChar ? "✓" : "○"}
            </span>
            <span>One special character (@$!%*?&)</span>
          </div>
          <div
            className={`flex items-center gap-1 ${
              passwordStrength.checks.hasUpperCase
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            <span className="font-bold">
              {passwordStrength.checks.hasUpperCase ? "✓" : "○"}
            </span>
            <span>One uppercase letter</span>
          </div>
          <div
            className={`flex items-center gap-1 ${
              passwordStrength.checks.hasLowerCase
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            <span className="font-bold">
              {passwordStrength.checks.hasLowerCase ? "✓" : "○"}
            </span>
            <span>One lowercase letter</span>
          </div>
          <div
            className={`flex items-center gap-1 ${
              passwordStrength.checks.hasNumber ? "text-green-600" : "text-gray-400"
            }`}
          >
            <span className="font-bold">
              {passwordStrength.checks.hasNumber ? "✓" : "○"}
            </span>
            <span>One number</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;

