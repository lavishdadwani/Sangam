import React, { useEffect, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import userAPI from "../../services/user/user"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { ClipLoader } from "react-spinners"
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
function SignUp() {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({});
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()
  const handleSignUp = async () =>{
    try{
      setLoading(true)
      const userData = {
        ...formData,
        role:role
      }
      const result = await userAPI.signUp(userData)
      if(result.ok){
        setErr("")
        dispatch(setUserData(result.data.data))
      }else{
        setErr(result.data.message)
      }
      console.log({result})
      setLoading(false)
      }catch(err){
        console.log(err)
        setLoading(false)

    }
  }

  const handleGoogleAuth = async () =>{
    try{
      setLoading(true)
      if(!formData.mobile || !role){
       return setErr('mobile number is required')
      }
      const provider  = new GoogleAuthProvider()
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider)
      console.log('Google auth success:', result)
      
      // Extract user information
      const user = result.user;
      console.log('User:', user.displayName, user.email);
      const userData = {
        fullName:user.displayName, 
        email:user.email,
        mobile:formData.mobile,
        role: role,
      }
      // You can send this to your backend API here
      const data = await userAPI.signUpWithGoogle(userData);
      if(data.ok){
        setErr("")
        dispatch(setUserData(result.data.data))
      }else{
        setErr(result.data.message)
      }
      setLoading(false)

    }catch(err){
      console.error('Google authentication error:', err);
      setLoading(false)

      // Handle specific error types
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
          Create your account to get instant groceries
        </p>
        {/* full name */}
        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-gray-700 font-medium mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Enter your Full Name"
            name="fullName"
            onChange={ e => onChange(e)}
            value={formData?.fullName}
            style={{ border: `1px solid ${borderColor}` }}
            required
          />
        </div>
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
            onChange={e => onChange(e)}
            value={formData?.email}
            required
            style={{ border: `1px solid ${borderColor}` }}
          />
        </div>
        {/* mobile */}
        <div className="mb-4">
          <label
            htmlFor="mobile"
            className="block text-gray-700 font-medium mb-1"
          >
            Mobile
          </label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none"
            placeholder="Enter your Number"
            name="mobile"
            onChange={e => onChange(e)}
            value={formData?.mobile}
            required
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
              value={formData?.password}
              required
              style={{ border: `1px solid ${borderColor}` }}
            />
            <button
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 cursor-pointer top-[14px] text-gray-500"
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>
        {/* role */}
        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-1"
          >
            Role
          </label>
          <div className="flex gap-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                onClick={() => setRole(r)}
                style={
                  role == r
                    ? { backgroundColor: primaryColor, color: "white" }
                    : {
                        border: `1px solid ${primaryColor}`,
                        color: primaryColor,
                      }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
          onClick={handleSignUp}
        >
          {loading && <ClipLoader size={20}  />}
          Sign Up
        </button>
        <p className="text-red-500 text-center my-[10px]">{err && `* ${err}`}</p>
        <button className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 border-gray-400 hover:bg-gray-100 cursor-pointer" onClick={handleGoogleAuth}>
          <FcGoogle /> <span>Sign in with Google</span>
        </button>
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
