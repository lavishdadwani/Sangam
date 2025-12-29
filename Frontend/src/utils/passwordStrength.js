/**
 * Password strength utility functions
 */

export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: "", color: "" }
  
  let strength = 0
  const checks = {
    length: password.length >= 8, // Updated to match helpers.js validatePassword (min 8 chars)
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password), // Updated to match helpers.js validatePassword special chars
  }

  // Calculate strength
  if (checks.length) strength++
  if (checks.hasUpperCase) strength++
  if (checks.hasLowerCase) strength++
  if (checks.hasNumber) strength++
  if (checks.hasSpecialChar) strength++

  const strengthLabels = {
    0: { label: "Very Weak", color: "bg-red-500" },
    1: { label: "Weak", color: "bg-red-400" },
    2: { label: "Fair", color: "bg-yellow-400" },
    3: { label: "Good", color: "bg-yellow-500" },
    4: { label: "Strong", color: "bg-green-400" },
    5: { label: "Very Strong", color: "bg-green-500" },
  }

  return {
    strength,
    ...strengthLabels[strength],
    checks,
  }
}

// Note: Password validation is now done using validatePassword regex from helpers.js
// This function is kept for backward compatibility but not used in SignUp.jsx
export const validatePasswordBasic = (password) => {
  if (!password) {
    return "Password is required"
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters"
  }
  return true
}

