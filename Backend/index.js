dotenv.config();
import express from "express";
import dotenv from "dotenv";
import dbConnect from "./config/db.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import cors from "cors";
import chalk from "chalk";
import { Response } from "./models/response.model.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";
import http from "http"
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";
import { initRedis, closeRedis } from "./redis.js";
import chatbotRoutes from "./chatbot/chatbot.routes.js"
const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
      }
})
// CORS configuration - use environment variable if available
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.set("io", io)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Available for all routes via req.app.get('redis')
app.set("redis", null); // Will set after Redis connection

app.response.success = function (
  message,
  data,
  displayMessage,
  code = 200,
  additionalData
) {
  console.log(chalk.green(message));
  this.status(code).send(
    Response("success", message, data, displayMessage, code, additionalData)
  );
};
// global error handler
app.response.error = function (
  message,
  data,
  displayMessage,
  code,
  additionalData
) {
  console.log(chalk.red(message));
  if (data) {
    console.log(chalk.red(data));
  }
  const newMessage =
    typeof message != "string" ? "Something went wrong" : message;
  this.status(400).send(
    Response("error", newMessage, data, displayMessage, code, additionalData)
  );
};
// access denied
app.response.accessDenied = function () {
  console.log(chalk.cyan("Access Denied. Check the role of the User."));
  this.status(200).send(Response("error", "Access Denied", null, null, 500));
};
// unauthorized user
app.response.unauthorized = function (message) {
  console.log(chalk.yellow("Unauthorized User"));
  this.status(403).send(
    Response("Unauthorized User", message, null, null, 403)
  );
};
// Routes
app.use("/api/auth/user", userRouter);
app.use("/api/auth/shop", shopRouter);
app.use("/api/auth/item", itemRouter);
app.use("/api/auth/order", orderRouter);
app.use("/api/auth/chat", chatbotRoutes);
app.get("/", async (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(chalk.red("Error:"), err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
server.listen(port, async () => {
  try {
    await dbConnect();
    
    const redisClient = await initRedis();
    if (redisClient) {
      app.set("redis", redisClient);
      io.redis = redisClient;
    }
    
    socketHandler(io);
    
    console.log(chalk.green(`✅ Server started at port ${port}`));
  } catch (error) {
    console.error(chalk.red("❌ Failed to start server:"), error);
    process.exit(1);
  }
});

// ✅ GRACEFUL SHUTDOWN HANDLER
const gracefulShutdown = async (signal) => {
  console.log(chalk.yellow(`\n${signal} signal received: starting graceful shutdown...`));
  
  try {
    // 1. Stop accepting new connections
    server.close(async () => {
      console.log(chalk.blue("✅ HTTP server closed"));
      
      try {
        // 2. Disconnect all socket.io connections
        io.disconnectSockets();
        console.log(chalk.blue("✅ Socket.io connections closed"));
        
        // 3. Close Redis connection
        await closeRedis();
        console.log(chalk.blue("✅ Redis connection closed"));
        
        // 4. Close MongoDB connection
        await import("mongoose").then((m) => m.default.connection.close());
        console.log(chalk.blue("✅ MongoDB connection closed"));
        
        console.log(chalk.green("✅ Graceful shutdown completed"));
        process.exit(0);
      } catch (err) {
        console.error(chalk.red("Error during shutdown:"), err);
        process.exit(1);
      }
    });

    // If server doesn't close after 30 seconds, force exit
    setTimeout(() => {
      console.error(chalk.red("❌ Forced shutdown after 30 seconds timeout"));
      process.exit(1);
    }, 30000);
  } catch (err) {
    console.error(chalk.red("Error in graceful shutdown:"), err);
    process.exit(1);
  }
};

//  ✅ SHUTDOWN HANDLERS
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
