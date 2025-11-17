import express from "express"
import { signIn, signOut, signUp } from "../controllers/auth.controllers.js"

const userRouter = express.Router()

userRouter.post("/signUp",signUp)
userRouter.post("/signIn",signIn)
userRouter.post("/signOut",signOut)

export default userRouter