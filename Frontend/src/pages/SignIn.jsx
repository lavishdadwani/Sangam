import React, { useEffect, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import userAPI from "../../services/user/user"

function SignIn() {

  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate()

  const handleSignIn = async () =>{
    try{
      const result = await userAPI.signIn(formData)
      console.log(result)
    }catch(err){
      console.log(err)
    }
  }

  const onChange = (e) =>{
    setFormData({ ...formData, [e.target.name]: e.target.value })
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
        {/* email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Enter your Email"
            name="email"
            onChange={ e => onChange(e)}
            value={formData?.email}
            style={{ border: `1px solid ${borderColor}` }}
          />
        </div>

        {/* password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={`${showPassword ? "text" : "password"}`}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Enter your Password"
              name="password"
              onChange={e => onChange(e)}
              style={{ border: `1px solid ${borderColor}` }}
            />
            <button
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 cursor-pointer top-[14px] text-gray-500"
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash/>}
            </button>
          </div>
        </div>
        <div className="text-right font-medium text-[#ff4d2d] mb-4 cursor-pointer" onClick={ () => navigate("/forgot-password")}>
          Forgot Password ?
        </div>
        <button
          className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
          onClick={handleSignIn}
        >
          Sign In
        </button>
        <button className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 border-gray-400 hover:bg-gray-100 cursor-pointer">
          <FcGoogle /> <span>Sign in with Google</span>
        </button>
        <p className="text-center mt-6">
          Want to create a new account?{" "}
          <Link className="text-[#ff4d2d" to={"/signUp"}>
            <span className="text-[#ff4d2d]">Sign In</span>
          </Link>{" "}
        </p>
      </div>
    </div>
  );
}

export default SignIn;
