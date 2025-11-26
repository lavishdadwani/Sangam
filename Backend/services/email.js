import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const transporter = nodemailer.createTransport({
    service:"Gmail", 
  host: "smtp.ethereal.email",
  port: 485,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});


export const sendEmail = async (sendTo,subject,body) => {
    try{
        const mailOptions = {
            from: process.env.EMAIL,
            to: sendTo,
            subject,
            text: " ",
            html: body
        }
        await transporter.sendMail(mailOptions, (error,result) => result)
    }catch(err){
        return err.message
    }
}