import apiConfig from "./config.js";

const sendMessage = (message) => apiConfig.client.post("chat/chat", { message });

const getChatHistory = () => apiConfig.client.get("chat/history");

const clearChatHistory = () => apiConfig.client.delete("chat/history");

export default {
  sendMessage,
  getChatHistory,
  clearChatHistory,
};

