import User from "../../models/user.model.js";
import Order from "../../models/order.model.js";

export const getUsers = async (req, res) => {
  try {
    const { search = "", role = "", status = "", page = 1, limit = 10 } = req.query;

    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -reSetOtp -socketId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return res.success("Users fetched", {
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    return res.error("getUsers error", err);
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const [user, orderCount] = await Promise.all([
      User.findById(userId).select("-password -reSetOtp -socketId"),
      Order.countDocuments({ user: userId }),
    ]);

    if (!user) return res.error("User not found");

    return res.success("User fetched", { user, orderCount });
  } catch (err) {
    return res.error("getUserById error", err);
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const allowed = ["active", "deactivated", "blocked", "banned"];
    if (!allowed.includes(status)) {
      return res.error("Invalid status value");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, select: "-password -reSetOtp -socketId" }
    );

    if (!user) return res.error("User not found");

    return res.success(`User status updated to ${status}`, user);
  } catch (err) {
    return res.error("updateUserStatus error", err);
  }
};
