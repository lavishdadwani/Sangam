import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import generateToken from "../utils/token.js"

export const signUp = async (req,res) =>{
    try{
        const {fullName,mobile,email,role,password} = req.body
        
        // Validate required fields
        if(!fullName || !mobile || !email || !role || !password){
            return res.status(400).json({message:"All fields are required."})
        }

        // Check if user already exists (email or mobile number)
        const existingUser = await User.findOne({
            $or: [{ email }, { mobile }]
        })
        if(existingUser) {
            if(existingUser.email === email) {
                return res.status(400).json({message:"User already exists with this email."})
            }
            if(existingUser.mobile === mobile){
                return res.status(400).json({message:"Mobile number already registered."})
            }
        }
        
        // Validate password length
        if (password.length < 6) return res.status(400).json({message:"Password must be at least 6 characters."})
        
        // Validate mobile number
        if (mobile.length < 10) return res.status(400).json({message:"Mobile number must be at least 10 digits."})

        const hashPassword = await bcrypt.hash(password,10)

        const user = await User.create({
            fullName,
            mobile,
            email,
            password:hashPassword,
            role
        })
        
        const token = await generateToken(user._id)
        res.cookie("token",token,{
            secure:process.env.NODE_ENV === "production",
            httpOnly:true,
            sameSite:"strict",
            maxAge: 7*24*60*60*1000
        })
        
        // Convert to plain object and remove password
        const userResponse = user.toObject()
        delete userResponse.password
        
        return res.status(201).json(userResponse)
    }catch(err){
        console.error("Signup error:", err)
        return res.status(500).json({message:"Internal server error. Please try again later."})
    }
}

export const signIn = async (req,res) =>{
    try{
        const {email,password} = req.body
        
        // Validate required fields
        if(!email || !password){
            return res.status(400).json({message:"Email and password are required."})
        }
        
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message:"Invalid email or password."})

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch) return res.status(400).json({message:"Invalid password."})

        const token = await generateToken(user._id)
        res.cookie("token",token,{
            secure:process.env.NODE_ENV === "production",
            httpOnly:true,
            sameSite:"strict",
            maxAge: 7*24*60*60*1000
        })
        
        // Convert to plain object and remove password
        const userResponse = user.toObject()
        delete userResponse.password
        
        return res.status(200).json(userResponse)
    }catch(err){
        console.error("Signin error:", err)
        return res.status(500).json({message:"Internal server error. Please try again later."})
    }
}

export const signOut = async (req,res) =>{
    try{
        res.clearCookie("token",{
            httpOnly:true,
            sameSite:"strict"
        })
        return res.status(200).json({message:"Logged out successfully"})
    }catch(err){
        console.error("Signout error:", err)
        return res.status(500).json({message:"Internal server error. Please try again later."})
    }
}

