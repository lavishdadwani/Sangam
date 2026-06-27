import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    photo: {
      type: String,
      default: null,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "owner", "deliveryBoy"],
      required: true,
    },
    reSetOtp: {
      type: String,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    otpExpires: {
      type: Date,
    },
    signInWith: {
      type: String,
      default: undefined,
    },
    socketId:{
        type: String
    },
    isOnline:{
        type: Boolean,
        default: false
    },
    status: {
      type: String,
      enum: ["active", "deactivated", "blocked", "banned"],
      default: "active",
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      address: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);
UserSchema.index({ location: "2dsphere" });
const User = mongoose.model("User", UserSchema);

export default User;
