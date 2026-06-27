import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";


const invalidateUserCache = async (req, userId) => {
  const redis = req.app.get('redis');
  if (redis && userId) {
    try {
      await redis.del(`user:${userId}`);
      await redis.del(`user:location:${userId}`);
    } catch (err) {
      console.error('Error invalidating user cache:', err);
    }
  }
};

export const signUp = async (req, res) => {
  try {
    const { fullName, mobile, email, role, password } = req.body;

    if (!fullName || !mobile || !email || !role || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.success('Sign up successfully.', userResponse, 201);
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

    // Block sign-in for non-active accounts
    const statusMessages = {
      deactivated: "Your account has been temporarily deactivated. Please contact support.",
      blocked: "Your account has been blocked. Please contact support.",
      banned: "Your account has been permanently banned.",
    };
    if (user.status && statusMessages[user.status]) {
      return res.status(403).json({ message: statusMessages[user.status] });
    }

    const token = await generateToken(user._id);
    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.success('Sign in successfully.', userResponse);
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
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
    return res.status(200).json({ message: "OTP sent successfully" });
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
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.isOtpVerified = true;
    user.otpExpires = undefined;
    user.reSetOtp = undefined;
    await user.save();
    return res.status(200).json({ message: "OTP verified successfully" });
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
      return res.status(400).json({ message: "OTP verification required." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();
    
    // Invalidate user cache after password change
    await invalidateUserCache(req, user._id.toString());
    
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
    } else {
      const statusMessages = {
        deactivated: "Your account has been temporarily deactivated. Please contact support.",
        blocked: "Your account has been blocked. Please contact support.",
        banned: "Your account has been permanently banned.",
      };
      if (user.status && statusMessages[user.status]) {
        return res.status(403).json({ message: statusMessages[user.status] });
      }
    }
    const token = await generateToken(user._id);
    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
            return res.error('User ID not found');
        }
        
        // Check Redis cache first
        const redis = req.app.get('redis');
        if (redis) {
          try {
            const cacheKey = `user:${userId}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
              const userData = JSON.parse(cached);
              return res.success('User retrieved successfully.', userData);
            }
          } catch (redisErr) {
            console.error('Redis cache read error:', redisErr);
          }
        }
        
        const user = await User.findById(userId)
        if(!user){
            return res.error('User not found');
        }
        
        if (redis) {
          try {
            const cacheKey = `user:${userId}`;
            const userObject = user.toObject ? user.toObject() : user;
            await redis.set(cacheKey, JSON.stringify(userObject), { EX: 1800 }); // 30 min TTL
          } catch (redisErr) {
            console.error('Redis cache write error:', redisErr);
          }
        }
        
        return res.success('User retrieved successfully.', user);
    }catch(err){
        return res.error('Error while retrieving current user', err);
    }
}

export const updateUserLocation = async (req, res) => {
  try {
    const { lat, lng, address, city, state } = req.body;
    const userId = req.userId;
    
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.error("User not Found");
    }
    const locationUpdate = {
      ...currentUser.location?.toObject?.() || currentUser.location || {},
      type: "Point",
      coordinates: [lng, lat],
    };

    if (address !== undefined && address !== null && address !== "") {
      locationUpdate.address = address;
    }

    if (city !== undefined && city !== null && city !== "") {
      locationUpdate.city = city;
    }

    if (state !== undefined && state !== null && state !== "") {
      locationUpdate.state = state;
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      { location: locationUpdate }, 
      { new: true }
    );
    // Redis Code
    // Cache location in Redis
    const redis = req.app.get('redis');
    if (redis) {
      try {
        const redisKey = `user:location:${userId}`;
        const cacheData = {
          lat,
          lng,
          address: locationUpdate.address,
          city: locationUpdate.city,
          state: locationUpdate.state,
          coordinates: locationUpdate.coordinates,
        };
        await redis.set(redisKey, JSON.stringify(cacheData), { EX: 3600 }); // 1 hour TTL
        
        const userCacheKey = `user:${userId}`;
        const userObject = user.toObject ? user.toObject() : user;
        await redis.set(userCacheKey, JSON.stringify(userObject), { EX: 1800 }); // 30 min TTL
      } catch (redisErr) {
        console.error('Redis cache write error:', redisErr);
      }
    }
    
    return res.success("Location Updated Successfully", user);
  } catch (err) {
    return res.error('Error while updating user location', err);
  }
}

 
