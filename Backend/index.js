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

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

// CORS configuration - use environment variable if available
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.response.accessDenied = function () {
  console.log(chalk.cyan("Access Denied. Check the role of the User."));
  this.status(200).send(Response("error", "Access Denied", null, null, 500));
};

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
app.listen(port, async () => {
  try {
    await dbConnect();
    console.log(chalk.green(`✅ Server started at port ${port}`));
  } catch (error) {
    console.error(chalk.red("❌ Failed to start server:"), error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log(chalk.yellow("SIGTERM signal received: closing HTTP server"));
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log(chalk.yellow("SIGINT signal received: closing HTTP server"));
  process.exit(0);
});
