import express from "express"
import { getCurrentUser, googleAuth, resetPassword, sendOtp, signIn, signOut, signUp, updateUserLocation, verifyOtp } from "../controllers/auth.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { getUserNotifications, getPublicSettings } from "../controllers/userNotifications.controller.js"

const userRouter = express.Router()

userRouter.post("/signUp",signUp)
userRouter.post("/signIn",signIn)
userRouter.get("/signOut",signOut)
userRouter.post("/send-otp",sendOtp)
userRouter.post("/verify-otp",verifyOtp)
userRouter.post("/reset-password",resetPassword)
userRouter.post("/google-auth",googleAuth)
userRouter.get("/current-user",isAuth,getCurrentUser)
userRouter.post("/update-location",isAuth,updateUserLocation)
userRouter.get("/notifications",isAuth,getUserNotifications)
userRouter.get("/settings",getPublicSettings)          // public — no auth required

export default userRouter
