import express from "express";
import { chatController, getChatHistoryController, clearChatHistoryController } from "./chatbot.controller.js";
import rateLimiter from "../middlewares/rateLimiter.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/chat", isAuth, rateLimiter, chatController);
router.get("/history", isAuth, getChatHistoryController);
router.delete("/history", isAuth, clearChatHistoryController);

export default router;
