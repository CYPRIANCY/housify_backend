import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import reviewsRoutes from "./routes/reviewsRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

/**
 * ============================================
 * SECURITY MIDDLEWARE
 * ============================================
 */

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * ============================================
 * REQUEST MIDDLEWARE
 * ============================================
 */

app.use(cookieParser());

app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);

/**
 * ============================================
 * LOGGING
 * ============================================
 */

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/**
 * ============================================
 * RATE LIMITING
 * ============================================
 */

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

/**
 * ============================================
 * HEALTH CHECK
 * ============================================
 */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hosify API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/**
 * ============================================
 * API ROUTES
 * ============================================
 */

app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/property", propertyRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/reviews", reviewsRoutes);

/**
 * ============================================
 * ERROR HANDLING
 * ============================================
 */

app.use(notFound);
app.use(errorHandler);

/**
 * ============================================
 * SERVER STARTUP
 * ============================================
 */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(
        `🚀 Hosify API running in ${
          process.env.NODE_ENV || "development"
        } mode on port ${PORT}`
      );
    });

    /**
     * Graceful shutdown
     */
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        console.log("HTTP server closed.");

        try {
          await import("mongoose").then(({ default: mongoose }) =>
            mongoose.connection.close()
          );

          console.log("MongoDB connection closed.");
          process.exit(0);
        } catch (error) {
          console.error("Error during shutdown:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();