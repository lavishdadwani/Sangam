import { getRedis } from "../redis.js";

export const getChatHistory = async (userId) => {
  try {
    const redis = getRedis();
    if (!redis) return [];

    const data = await redis.lRange(`chat:${userId}`, 0, -1);
    return data.map((item) => {
      try {
        return JSON.parse(item);
      } catch (err) {
        console.error("Error parsing chat history item:", err);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error("Error getting chat history:", error);
    return [];
  }
};

export const saveChatMessage = async (userId, role, text) => {
  try {
    const redis = getRedis();
    if (!redis) {
      console.warn("Redis not available, chat message not saved");
      return;
    }

    await redis.rPush(
      `chat:${userId}`,
      JSON.stringify({ role, parts: [{ text }] })
    );

    // Keep last 20 messages only (10 user + 10 model = 20 total)
    await redis.lTrim(`chat:${userId}`, -20, -1);
  } catch (error) {
    console.error("Error saving chat message:", error);
    // Don't throw - allow chat to continue even if saving fails
  }
};

export const clearChatHistory = async (userId) => {
  try {
    const redis = getRedis();
    if (!redis) return;

    await redis.del(`chat:${userId}`);
  } catch (error) {
    console.error("Error clearing chat history:", error);
    throw error;
  }
};
