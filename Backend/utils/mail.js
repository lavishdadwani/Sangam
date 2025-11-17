import nodemailer from "nodemailer"


// Create a test account or replace with real credentials.
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