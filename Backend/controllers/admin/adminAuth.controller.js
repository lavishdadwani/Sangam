import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../../models/admin.model.js";

const generateAdminToken = (adminId, role) => {
  return jwt.sign({ adminId, role }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.error("Email and password are required");
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.error("Invalid credentials");
    }

    if (!admin.isActive) {
      return res.error("Your account has been deactivated. Contact a superadmin.");
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.error("Invalid credentials");
    }

    // Update login metadata
    admin.lastLoginAt = new Date();
    admin.lastLoginIp = req.ip || req.headers["x-forwarded-for"] || null;
    await admin.save();

    const token = generateAdminToken(admin._id, admin.role);

    return res.success("Login successful", {
      token,
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    return res.error("Admin login error", err);
  }
};

export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");
    if (!admin) {
      return res.unauthorized("Admin not found");
    }
    return res.success("Admin fetched", admin);
  } catch (err) {
    return res.error("getMe error", err);
  }
};

export const adminLogout = (req, res) => {
  return res.success("Logged out successfully");
};
