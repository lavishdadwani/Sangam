import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import userAPI from "../../services/user/user"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { openSnackbar } from "../redux/snackbarSlice";
import InputText from "../components/InputText";
import InputSelect from "../components/InputSelect";
import InputPassword from "../components/InputPassword";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import ButtonSquare from "../components/ButtonSquare";
import { emailRegex, validatePhone, validatePassword, validateName } from "../../utils/helpers";

function SignUp() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);
  
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      password: '',
      role: 'user'
    }
  });

  const password = watch("password")
  const onSubmit = async (data) => {
    try {
      setLoading(true)
      clearErrors()
      
      const result = await userAPI.signUp(data)
      
      if (result.ok) {
        const userData = result.data.data
        dispatch(setUserData(userData))
        dispatch(openSnackbar("Account created successfully!", "success"))
        navigate("/")
      } else {
        const errorMessage = result.data?.message || "Failed to create account"
        
        // Handle specific backend errors
        if (errorMessage.includes("email")) {
          setError("email", { type: "server", message: errorMessage })
        } else if (errorMessage.includes("mobile")) {
          setError("mobile", { type: "server", message: errorMessage })
        } else {
          dispatch(openSnackbar(errorMessage, "error"))
      }
      }
    } catch (err) {
      console.error("SignUp error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong. Please try again."
      dispatch(openSnackbar(errorMessage, "error"))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      const mobile = watch("mobile")
      const role = watch("role")
      
      if (!mobile || !role) {
        dispatch(openSnackbar("Please fill mobile number and select role first", "warning"))
        setLoading(false)
        return
      }

      const provider = new GoogleAuthProvider()
      provider.addScope('profile')
      provider.addScope('email')
      
      const result = await signInWithPopup(auth, provider)
      
      // Extract user information
      const user = result.user
      const userData = {
        fullName: user.displayName,
        email: user.email,
        mobile: mobile,
        role: role,
      }
      
      const data = await userAPI.signUpWithGoogle(userData)
      
      if (data.ok) {
        const responseData = data.data || data
        dispatch(setUserData(responseData))
        dispatch(openSnackbar("Account created with Google successfully!", "success"))
        navigate("/")
      } else {
        const errorMessage = data.data?.message || "Failed to sign up with Google"
        dispatch(openSnackbar(errorMessage, "error"))
      }
    } catch (err) {
      console.error('Google authentication error:', err)

      // Handle specific error types
      if (err.code === 'auth/popup-closed-by-user') {
        dispatch(openSnackbar("Sign in cancelled", "info"))
      } else if (err.code === 'auth/popup-blocked') {
        dispatch(openSnackbar("Popup was blocked. Please allow popups for this site.", "error"))
      } else if (err.code === 'auth/cancelled-popup-request') {
        dispatch(openSnackbar("Please wait for the current sign in to complete", "warning"))
      } else {
        const errorMessage = err.response?.data?.message || err.message || "Google authentication failed"
        dispatch(openSnackbar(errorMessage, "error"))
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div
      className={"min-h-screen w-full flex items-center justify-center p-4"}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1
          className={"text-3xl font-bold mb-2"}
          style={{ color: primaryColor }}
        >
          KT Mart
        </h1>
        <p className="text-gray-600 mb-8">
          Create your account to get instant groceries
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <InputText
            label="Full Name"
            labelIcon={FaUser}
            type="text"
            name="fullName"
            placeholder="Enter your Full Name"
            register={register("fullName", {
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Full name must be at least 2 characters"
              },
              pattern: {
                value: validateName,
                message: "Full name should only contain letters, spaces, and special characters (., /, &, -)"
              }
            })}
            error={errors.fullName}
            required
          />

          {/* Email */}
          <InputText
            label="Email"
            labelIcon={FaEnvelope}
            type="email"
            name="email"
            placeholder="Enter your Email"
            register={register("email", {
              required: "Email is required",
              pattern: {
                value: emailRegex,
                message: "Please enter a valid email address"
              }
            })}
            error={errors.email}
            required
          />

          {/* Mobile */}
          <InputText
            label="Mobile Number"
            labelIcon={FaPhone}
            type="tel"
            name="mobile"
            placeholder="Enter your Mobile Number"
            register={register("mobile", {
              required: "Mobile number is required",
              pattern: {
                value: validatePhone,
                message: "Mobile number must be exactly 10 digits"
              }
            })}
            error={errors.mobile}
            required
          />

          {/* Password */}
          <div className="space-y-2">
            <InputPassword
              label="Password"
              labelIcon={FaLock}
              name="password"
              placeholder="Enter your Password"
              register={register("password", {
                required: "Password is required",
                pattern: {
                  value: validatePassword,
                  message: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (@$!%*?&)"
                }
              })}
              error={errors.password}
              required
            />
            
            {/* Password Strength Indicator */}
            <PasswordStrengthIndicator password={password} />
          </div>

          {/* Role */}
          <InputSelect
            label="Role"
            name="role"
            register={register("role", {
              required: "Please select a role"
            })}
            error={errors.role}
            options={[
              { value: "user", label: "User" },
              { value: "owner", label: "Shop Owner" },
              { value: "deliveryBoy", label: "Delivery Boy" }
            ]}
            required
          />

          {/* Submit Button */}
          <ButtonSquare
            type="submit"
            styleType="default"
            loading={loading}
            loadingMessage="Creating Account..."
            disabled={loading}
            className="w-full py-3"
          >
            Sign Up
          </ButtonSquare>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <ButtonSquare
          type="button"
          styleType="outline"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3"
        >
          <FcGoogle size={20} />
          <span>Sign up with Google</span>
        </ButtonSquare>
        <p className="text-center mt-6">
          Already have an account ?{" "}
          <Link className="text-[#ff4d2d" to={"/signIn"}>
            <span className="text-[#ff4d2d]">Sign In</span>
          </Link>{" "}
        </p>
      </div>
    </div>
  );
}

export default SignUp;



