import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js'; // 👈 we will create this
import adminRoutes from './routes/adminRoutes.js'
import connectDB from './config/db.js'; // 👈 database connection

dotenv.config();

// === Connect to DB ===
// connectDB();

const app = express();

// === Middleware ===

// Security Headers
app.use(helmet());

// CORS Config
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// Cookie Parser
app.use(cookieParser());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 100, // limit per IP
  message: 'Too many requests from this IP, please try again after 10 minutes',
});
app.use('/api', limiter);

// JSON & Form Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Dev Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// === Routes ===
app.use('/api/auth', authRoutes); // 👈 Auth API
app.use('/api/admin', adminRoutes); // 👈 Admin API

// === Error Handlers ===
app.use(notFound);
app.use(errorHandler);

// === Start Server ===
const PORT = process.env.PORT || 5000;

connectDB()
.then( () => {
          
    console.log("MongoDB connected Successfully")

    app.listen(PORT, () => {
      console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

})
