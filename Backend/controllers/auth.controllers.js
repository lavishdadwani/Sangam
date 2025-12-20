import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

export const signUp = async (req, res) => {
  try {
    const { fullName, mobile, email, role, password } = req.body;

    // Validate required fields
    if (!fullName || !mobile || !email || !role || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists (email or mobile number)
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ message: "User already exists with this email." });
      }
      if (existingUser.mobile === mobile) {
        return res
          .status(400)
          .json({ message: "Mobile number already registered." });
      }
    }

    // Validate password length
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });

    // Validate mobile number
    if (mobile.length < 10)
      return res
        .status(400)
        .json({ message: "Mobile number must be at least 10 digits." });

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      mobile,
      email,
      password: hashPassword,
      role,
    });

    const token = await generateToken(user._id);
    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Convert to plain object and remove password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.success('Sign Up Successfully.',userResponse,201)
  } catch (err) {
    console.error("Signup error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password." });

    const token = await generateToken(user._id);
    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Convert to plain object and remove password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.success('Sign In Successfully.',userResponse)
  } catch (err) {
    console.error("SignIn error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("SignOut error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error. Please try again later." });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.reSetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();
    await sendOtpMail(email, otp);
    return res.status(200).json({ message: "Otp Sent Successfully" });
  } catch (err) {
    console.error("Send otp error:", err);
    return res.status(500).json({ message: "Send otp error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, OTP } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.reSetOtp != OTP || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid/ expired OTP" });
    }
    user.isOtpVerified = true;
    user.otpExpires = undefined;
    user.reSetOtp = undefined;
    await user.save();
    return res.status(200).json({ message: "Otp Verified Successfully" });
  } catch (err) {
    console.error("Verify otp error:", err);
    return res.status(500).json({ message: "Verify otp error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "Otp verification required." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ message: "Reset Password Error" });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { email, fullName, mobile, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName,
        email,
        mobile,
        role,
        signInWith: "Google",
      });
    }
    const token = await generateToken(user._id);
    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json(user);
  } catch (err) {
    console.error("Google Auth Error:", err);
    return res.status(500).json({ message: "Google Auth Error" });
  }
};

export const getCurrentUser = async (req,res) =>{
    try{
        const userId = req.userId
        if(!userId){
            return res.error('UserId not found')
        }
        const user = await User.findById(userId)
        if(!user){
            return res.error('User not found')
        }
        return res.success('User found successfully.',user)
    }catch(err){
        return res.error('got current user error',err)
    }
}

export const updateUserLocation = async (req, res) => {
  try {
    const {lat,lng} = req.body
    const userId = req.userId
    const user = await User.findByIdAndUpdate(userId,{
        location:{
            type: "Point",
            coordinates:[lng,lat]
        }
    },{new:true}) ;
    if(!user) return res.error("User not Found")
    return res.success("Location Updated Successfully")
  } catch (err) {
    return res.error('got error while updating location',err)
  }
}

 