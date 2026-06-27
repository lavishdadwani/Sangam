import React from "react";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import userAPI from "../../services/user/user"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { openSnackbar } from "../redux/snackbarSlice";
import InputText from "../components/InputText";
import InputPassword from "../components/InputPassword";
import ButtonSquare from "../components/ButtonSquare";
import { emailRegex } from "../../utils/helpers";

const ACCOUNT_STATUS_MESSAGES = ["deactivated", "blocked", "banned", "contact support"];

function SignIn() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = React.useState(false);
  const [accountAlert, setAccountAlert] = React.useState("");
  
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      clearErrors()
      
      const result = await userAPI.signIn(data)
      
      if (result.ok) {
        const userData = result.data.data
        dispatch(setUserData(userData))
        dispatch(openSnackbar("Signed in successfully", "success"))
        navigate("/")
      } else {
        const errorMessage = result.data?.message || "Failed to sign in"

        // Show persistent alert for account status issues
        const isStatusIssue = ACCOUNT_STATUS_MESSAGES.some((kw) =>
          errorMessage.toLowerCase().includes(kw)
        );
        if (isStatusIssue) {
          setAccountAlert(errorMessage);
        } else if (errorMessage.toLowerCase().includes("email")) {
          setError("email", { type: "server", message: errorMessage })
        } else if (errorMessage.toLowerCase().includes("password")) {
          setError("password", { type: "server", message: errorMessage })
        } else {
          dispatch(openSnackbar(errorMessage, "error"))
        }
      }
    } catch (err) {
      console.error("SignIn error:", err)
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong. Please try again."
      dispatch(openSnackbar(errorMessage, "error"))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      provider.addScope('profile')
      provider.addScope('email')
      
      const result = await signInWithPopup(auth, provider)
      
      const user = result.user
      const data = await userAPI.signUpWithGoogle({ email: user.email })
      
      if (data.ok) {
        const responseData = data.data || data
        dispatch(setUserData(responseData))
        dispatch(openSnackbar("Signed in with Google successfully", "success"))
        navigate("/")
      } else {
        const errorMessage = data.data?.message || "Failed to sign in with Google"
        const isStatusIssue = ACCOUNT_STATUS_MESSAGES.some((kw) =>
          errorMessage.toLowerCase().includes(kw)
        );
        if (isStatusIssue) {
          setAccountAlert(errorMessage);
        } else {
          dispatch(openSnackbar(errorMessage, "error"))
        }
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
        
        // Check if user already exists in error message
        if (errorMessage.toLowerCase().includes("already exists") || 
            errorMessage.toLowerCase().includes("user exists") ||
            errorMessage.toLowerCase().includes("already registered")) {
          dispatch(openSnackbar("User already exists. Please login with your email and password.", "warning"))
        } else {
          dispatch(openSnackbar(errorMessage, "error"))
        }
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
          Sign in to get instant groceries
        </p>

        {accountAlert && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
            <p className="text-sm text-red-700 font-medium">{accountAlert}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {/* Password */}
          <InputPassword
            label="Password"
            labelIcon={FaLock}
            name="password"
            placeholder="Enter your Password"
            register={register("password", {
              required: "Password is required"
            })}
            error={errors.password}
            required
          />

          <div className="text-right font-medium text-[#ff4d2d] mb-4 cursor-pointer hover:underline" onClick={() => navigate("/forgot-password")}>
            Forgot Password ?
          </div>

          {/* Submit Button */}
          <ButtonSquare
            type="submit"
            styleType="default"
            loading={loading}
            loadingMessage="Signing in..."
            disabled={loading}
            className="w-full py-3"
          >
            Sign In
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
          loading={loading}
          loadingMessage="Signing in with Google..."
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 cursor-pointer"
        >
          <FcGoogle size={20} />
          <span>Sign in with Google</span>
        </ButtonSquare>
        <p className="text-center mt-6">
          Want to create a new account?{" "}
          <Link className="text-[#ff4d2d" to={"/signUp"}>
            <span className="text-[#ff4d2d]">Sign Up</span>
          </Link>{" "}
        </p>
      </div>
    </div>
  );
}

export default SignIn;
