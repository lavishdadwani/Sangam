import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Admin from "../models/admin.model.js";

// Resolve .env relative to this script file, not process.cwd()
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const seed = async () => {
  if (!process.env.MONGO_URL) {
    console.error("❌ MONGO_URL not found. Check your Backend/.env file.");
    process.exit(1);
  }

  console.log("Connecting to:", process.env.MONGO_URL);
  await mongoose.connect(process.env.MONGO_URL, { dbName: "sangam" });

  const existing = await Admin.findOne({ role: "superadmin" });
  if (existing) {
    console.log("Superadmin already exists:", existing.email);
    process.exit(0);
  }

  const hash = await bcrypt.hash("Admin@123", 10);
  const admin = await Admin.create({
    fullName: "Super Admin",
    email: "admin@foodops.com",
    password: hash,
    role: "superadmin",
  });

  console.log("Superadmin created:");
  console.log("  Email   :", admin.email);
  console.log("  Password: Admin@123");
  console.log("  ⚠️  Change this password immediately after first login.");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
