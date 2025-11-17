import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [step, setStep] = useState(3);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [OTP, setOTP] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-4 mb-4 ">
          <IoIosArrowRoundBack
            size={30}
            className="text-[#ff4d2da] cursor-pointer"
            onClick={() => navigate("/signIn")}
          />
          <h1 className="text-2xl font-bold text-center text-[#ff4d2d]">
            Forgot Password
          </h1>
        </div>
        {step == 1 && (
          <div>
            {/* email */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                type="email"
                className="w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Enter your Email"
                name="email"
                onChange={(e) => setEmail(e)}
                value={email}
                style={{ border: `1px solid ${borderColor}` }}
              />
            </div>
            <button
              className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
              onClick={() => {}}
            >
              Send Otp
            </button>
          </div>
        )}
        {step == 2 && (
          <div>
            {/* OTP */}
            <div className="mb-6">
              <label
                htmlFor="OTP"
                className="block text-gray-700 font-medium mb-1"
              >
                OTP
              </label>
              <input
                type="OTP"
                className="w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Enter your OTP"
                name="OTP"
                onChange={(e) => setOTP(e.target.value)}
                value={OTP}
                style={{ border: `1px solid ${borderColor}` }}
              />
            </div>
            <button
              className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
              onClick={() => {}}
            >
              Verify Otp
            </button>
          </div>
        )}
        {step == 3 && (
          <div>
            {/* new password */}
            <div className="mb-6">
              <label
                htmlFor="newPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={`${showNewPassword ? "text" : "password"}`}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                  placeholder="Enter New Password"
                  name="newPassword"
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ border: `1px solid ${borderColor}` }}
                />
                <button
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 cursor-pointer top-[14px] text-gray-500"
                >
                  {showNewPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>
            {/* confirm password */}
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={`${showConfirmPassword ? "text" : "password"}`}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                  placeholder="Confirm Password"
                  name="newPassword"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ border: `1px solid ${borderColor}` }}
                />
                <button
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 cursor-pointer top-[14px] text-gray-500"
                >
                  {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>
            <button
              className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
              onClick={() => {}}
            >
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
