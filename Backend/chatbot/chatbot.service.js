import { ai, DEFAULT_MODEL } from "../config/gemini.js";
import { getSystemPrompt } from "./chatbot.prompt.js";
import { getChatHistory, saveChatMessage } from "./chatbot.memory.js";
import { getUserOrdersForChatbot } from "./chatbot.data.js";

export const processChat = async (userId, message) => {
  try {
    const history = await getChatHistory(userId);
    const userOrders = await getUserOrdersForChatbot(userId);
    
    const systemPrompt = getSystemPrompt(userOrders);

    const contents = [];
    
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }]
    });
    
    contents.push({
      role: "model",
      parts: [{ text: "I understand. I'm ready to help you with your food delivery questions." }]
    });
    
    history.forEach(msg => {
      if (msg.parts && Array.isArray(msg.parts)) {
        contents.push({
          role: msg.role === "model" ? "model" : "user",
          parts: msg.parts
        });
      } else if (msg.text) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.text }]
        });
      }
    });
    
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: contents,
    });

    const reply = response.text;

    await saveChatMessage(userId, "user", message);
    await saveChatMessage(userId, "model", reply);

    return reply;
  } catch (error) {
    console.error("Error in processChat:", error);
    throw new Error(`Failed to process chat: ${error.message}`);
  }
};
