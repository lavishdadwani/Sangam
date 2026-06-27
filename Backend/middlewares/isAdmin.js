import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

const isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.unauthorized("Admin token not found");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.adminId) {
      return res.unauthorized("Invalid admin token");
    }

    const admin = await Admin.findById(decoded.adminId).select("-password");
    if (!admin) {
      return res.unauthorized("Admin not found");
    }
    if (!admin.isActive) {
      return res.unauthorized("Admin account is deactivated");
    }

    req.adminId = admin._id;
    req.adminRole = admin.role;
    next();
  } catch (err) {
    return res.error("isAdmin error", err);
  }
};

// Use on routes that only superadmin can access (e.g. creating other admins)
export const requireSuperAdmin = (req, res, next) => {
  if (req.adminRole !== "superadmin") {
    return res.accessDenied();
  }
  next();
};

export default isAdmin;
