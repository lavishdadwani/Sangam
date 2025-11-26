import mongoose from "mongoose";

const Schema = mongoose.Schema

const UserSchema = new Schema({
    fullName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: false
    },
    photo: {
        type: String,
        default: null
    },
    mobile:{
        type: String,
        required: true,
        unique: true
    },
    emailVerified:{
        type: Boolean,
        default: false
    },
    role:{
        type: String,
        enum:["user","owner","deliveryBoy"],
        required: true
    },
    reSetOtp:{
        type: String
    },
    isOtpVerified:{
        type:Boolean,
        default:false
    },
    otpExpires:{
        type:Date
    },
    signInWith:{
        type:String,
        default: undefined
    }
},{timestamps:true})

const User = mongoose.model('User',UserSchema)

export default User