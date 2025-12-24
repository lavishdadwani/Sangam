import React, { useEffect, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import userAPI from "../../services/user/user"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { openSnackbar } from "../redux/snackbarSlice";

function SignIn() {

  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate()
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()
  const handleSignIn = async () =>{
    try{
      setLoading(true)
      const result = await userAPI.signIn(formData)
      if(result.ok){
        setErr("")
        dispatch(setUserData(result.data.data))
        console.log(result)
        dispatch(openSnackbar("Signed in successfully", "success"))
      }else{
        setErr(result.data.message)
        dispatch(openSnackbar(result.data?.message || "Failed to sign in", "error"))
      }
      setLoading(false)
    }catch(err){
      console.log(err)
      setLoading(false)
      dispatch(openSnackbar("Something went wrong. Please try again.", "error"))
    }
  }
  const handleGoogleAuth = async () =>{
    try{
      setLoading(true)
      const provider  = new GoogleAuthProvider()
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider)
      console.log('Google auth success:', result)
      
      const user = result.user;
      const data = await userAPI.signUpWithGoogle({email:user.email});
      if(data.ok){
        setErr("")
        dispatch(setUserData(result.data))
        dispatch(openSnackbar("Signed in with Google", "success"))
      }else{
        setErr(result.data.message)
        dispatch(openSnackbar(result.data?.message || "Failed to sign in with Google", "error"))
      }
      setLoading(false)
    }catch(err){
      console.error('Google authentication error:', err);
      setLoading(false)
      dispatch(openSnackbar("Google authentication failed", "error"))
      // specific error types
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup');
      } else if (err.code === 'auth/popup-blocked') {
        console.error('Popup was blocked by browser');
      } else if (err.code === 'auth/cancelled-popup-request') {
        console.log('Only one popup request is allowed at a time');
      } else {
        console.error('Authentication failed:', err.message);
      }
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
            required
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
              value={formData?.password}
              onChange={e => onChange(e)}
              style={{ border: `1px solid ${borderColor}` }}
              required
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
          {loading && <ClipLoader size={20} />}
          Sign In
        </button>
        <p className="text-red-500 text-center my-[10px]">{err && `* ${err}`}</p>
        <button className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 border-gray-400 hover:bg-gray-100 cursor-pointer" onClick={handleGoogleAuth}>
          <FcGoogle /> <span>Sign in with Google</span>
        </button>
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
