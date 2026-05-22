import { processChat } from "./chatbot.service.js";
import { getChatHistory, clearChatHistory } from "./chatbot.memory.js";

export const chatController = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    if (!message || typeof message !== "string") {
      return res.error("Message is required and must be a string");
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.error("Message cannot be empty");
    }
    if (trimmedMessage.length > 2000) {
      return res.error("Message is too long (max 2000 characters)");
    }

    const reply = await processChat(userId, trimmedMessage);

    res.success("Chat processed successfully", { reply });
  } catch (err) {
    console.error("Chatbot Error:", err);
    res.error("Failed to process chat message", err);
  }
};

export const getChatHistoryController = async (req, res) => {
  try {
    const userId = req.userId;
    const history = await getChatHistory(userId);
    res.success("Chat history retrieved", { history });
  } catch (err) {
    console.error("Get Chat History Error:", err);
    res.error("Failed to retrieve chat history", err);
  }
};

export const clearChatHistoryController = async (req, res) => {
  try {
    const userId = req.userId;
    await clearChatHistory(userId);
    res.success("Chat history cleared successfully");
  } catch (err) {
    console.error("Clear Chat History Error:", err);
    res.error("Failed to clear chat history", err);
  }
};
