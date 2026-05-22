import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";

/**
 * Get user's recent orders formatted for chatbot context
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of order objects with relevant information
 */
export const getUserOrdersForChatbot = async (userId) => {
  try {
    const orders = await Order.find({ user: userId })
      .populate({
        path: "shopOrders.shop",
        select: "name address",
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("_id totalAmount payment paymentMethod createdAt shopOrders.status shopOrders.assignment")
      .lean();

    // Format orders for better readability
    return orders.map((order) => ({
      _id: order._id,
      totalAmount: order.totalAmount,
      payment: order.payment,
      paymentMethod: order.paymentMethod,
      status: order.shopOrders?.[0]?.status || "unknown",
      createdAt: order.createdAt,
      shopOrders: order.shopOrders?.map((so) => ({
        shop: so.shop,
        status: so.status,
        subTotal: so.subTotal,
      })) || [],
    }));
  } catch (error) {
    console.error("Error fetching user orders for chatbot:", error);
    return [];
  }
};

