import express from "express"
import { getCurrentUser, googleAuth, resetPassword, sendOtp, signIn, signOut, signUp, verifyOtp } from "../controllers/auth.controllers.js"
import isAuth from "../middlewares/isAuth.js"

const userRouter = express.Router()

userRouter.post("/signUp",signUp)
userRouter.post("/signIn",signIn)
userRouter.get("/signOut",signOut)
userRouter.post("/send-otp",sendOtp)
userRouter.post("/verify-otp",verifyOtp)
userRouter.post("/reset-password",resetPassword)
userRouter.post("/google-auth",googleAuth)
userRouter.get("/current-user",isAuth,getCurrentUser)

export default userRouter