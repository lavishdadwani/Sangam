import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import userAPI from "../../services/user/user";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import InputText from "../components/InputText";
import InputPassword from "../components/InputPassword";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import ButtonSquare from "../components/ButtonSquare";
import BackButton from "../components/BackButton";
import { emailRegex, validatePassword } from "../../utils/helpers";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  // Form for Step 1: Email
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1 },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  // Form for Step 2: OTP
  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2 },
  } = useForm({
    defaultValues: {
      otp: "",
    },
  });

  // Form for Step 3: New Password
  const {
    register: registerStep3,
    handleSubmit: handleSubmitStep3,
    formState: { errors: errorsStep3 },
    watch: watchStep3,
  } = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watchStep3("newPassword");

  const handleSendOtp = async (data) => {
    try {
      setLoading(true);
      setEmail(data.email);
      const result = await userAPI.sendOtp({ email: data.email });

      if (result.ok) {
        dispatch(openSnackbar("OTP sent successfully to your email", "success"));
        setStep(2);
      } else {
        const errorMessage = result.data?.message || "Failed to send OTP";
        dispatch(openSnackbar(errorMessage, "error"));
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong. Please try again.";
      dispatch(openSnackbar(errorMessage, "error"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data) => {
    try {
      setLoading(true);
      const result = await userAPI.verifyOtp({ email, OTP: data.otp });

      if (result.ok) {
        dispatch(openSnackbar("OTP verified successfully", "success"));
        setStep(3);
      } else {
        const errorMessage = result.data?.message || "Invalid OTP";
        dispatch(openSnackbar(errorMessage, "error"));
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to verify OTP";
      dispatch(openSnackbar(errorMessage, "error"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    try {
      setLoading(true);

      if (data.newPassword !== data.confirmPassword) {
        dispatch(openSnackbar("Passwords do not match", "error"));
        setLoading(false);
        return;
      }

      const result = await userAPI.resetPassword({ email, password: data.newPassword });

      if (result.ok) {
        dispatch(openSnackbar("Password reset successfully", "success"));
        navigate("/signIn");
      } else {
        const errorMessage = result.data?.message || "Failed to reset password";
        dispatch(openSnackbar(errorMessage, "error"));
      }
    } catch (err) {
      console.error("Reset password error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong. Please try again.";
      dispatch(openSnackbar(errorMessage, "error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4" style={{ backgroundColor: bgColor }}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]" style={{ border: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-4 mb-8">
          <BackButton onClick={() => navigate("/signIn")} />
          <h1 className="text-2xl font-bold text-[#ff4d2d]">Forgot Password</h1>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmitStep1(handleSendOtp)} className="space-y-4">
            <InputText
              label="Email"
              labelIcon={FaEnvelope}
              type="email"
              name="email"
              placeholder="Enter your Email"
              register={registerStep1("email", {
                required: "Email is required",
                pattern: {
                  value: emailRegex,
                  message: "Please enter a valid email address",
                },
              })}
              error={errorsStep1.email}
              required
            />

            <ButtonSquare
              type="submit"
              styleType="default"
              loading={loading}
              loadingMessage="Sending OTP..."
              disabled={loading}
              className="w-full py-3"
            >
              Send OTP
            </ButtonSquare>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitStep2(handleVerifyOtp)} className="space-y-4">
            <InputText
              label="OTP"
              type="text"
              name="otp"
              placeholder="Enter 4-digit OTP"
              register={registerStep2("otp", {
                required: "OTP is required",
                pattern: {
                  value: /^[0-9]{4}$/,
                  message: "OTP must be exactly 4 digits",
                },
              })}
              error={errorsStep2.otp}
              required
            />

            <ButtonSquare
              type="submit"
              styleType="default"
              loading={loading}
              loadingMessage="Verifying OTP..."
              disabled={loading}
              className="w-full py-3"
            >
              Verify OTP
            </ButtonSquare>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-sm text-[#ff4d2d] hover:underline cursor-pointer"
            >
              Back to Email
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmitStep3(handleResetPassword)} className="space-y-4">
            <div className="space-y-2">
              <InputPassword
                label="New Password"
                labelIcon={FaLock}
                name="newPassword"
                placeholder="Enter New Password"
                register={registerStep3("newPassword", {
                  required: "Password is required",
                  pattern: {
                    value: validatePassword,
                    message: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (@$!%*?&)",
                  },
                })}
                error={errorsStep3.newPassword}
                required
              />

              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator password={newPassword} />
            </div>

            <InputPassword
              label="Confirm Password"
              labelIcon={FaLock}
              name="confirmPassword"
              placeholder="Confirm Password"
              register={registerStep3("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === newPassword || "Passwords do not match",
              })}
              error={errorsStep3.confirmPassword}
              required
            />

            <ButtonSquare
              type="submit"
              styleType="default"
              loading={loading}
              loadingMessage="Resetting Password..."
              disabled={loading}
              className="w-full py-3"
            >
              Reset Password
            </ButtonSquare>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full text-center text-sm text-[#ff4d2d] hover:underline cursor-pointer"
            >
              Back to OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
