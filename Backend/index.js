import express from "express";
import dotenv from "dotenv"
import dbConnect from "./config/db.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import cors from "cors"
dotenv.config()
const port  = process.env.PORT || 5000
const  app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials:true,
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth/user",userRouter)
app.get("/", async (req,res) =>{
    res.status(200).json("server running ")
})
app.listen(port,()=>{
    dbConnect()
    console.log(`Server started at ${port}`)
})