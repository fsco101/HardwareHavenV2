const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "config", ".env") });

// ─── CORS ───
app.use(cors());
app.options("*", cors());

// ─── Middleware ───
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Morgan request logging with response time
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Request tracking — attach start time and unique ID
app.use((req, res, next) => {
  req.startTime = Date.now();
  req.requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  res.setHeader('X-Request-Id', req.requestId);

  // Log slow responses (>3s)
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    if (duration > 3000) {
      console.warn(`[SLOW] ${req.method} ${req.originalUrl} took ${duration}ms (request: ${req.requestId})`);
    }
  });

  next();
});

app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

// ─── Health Check ───
const api = process.env.API_URL;
app.get(`${api}/health`, (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ─── Routes ───
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const reviewsRoutes = require("./routes/reviews");
const notificationsRoutes = require("./routes/notifications");
const promotionsRoutes = require("./routes/promotions");
const dashboardRoutes = require("./routes/dashboard");

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/reviews`, reviewsRoutes);
app.use(`${api}/notifications`, notificationsRoutes);
app.use(`${api}/promotions`, promotionsRoutes);
app.use(`${api}/dashboard`, dashboardRoutes);

// ─── Error Handler (must be after routes) ───
app.use(errorHandler);

// ─── Database ───
mongoose.connection.on('connected', () => console.log('MongoDB connected'));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

// ─── Server + Socket.IO ───
const PORT = process.env.PORT || 4000;
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Attach io to app so routes can access it
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // User joins their own room for targeted notifications
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined notification room`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

httpServer.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing backend process before starting a new one.`);
    console.error('Tip: close duplicate terminals running `npm run dev` or change PORT in backend/config/.env.');
    process.exit(1);
  }

  console.error('HTTP server error:', err);
  process.exit(1);
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`server is running on http://0.0.0.0:${PORT}`);
});

// ─── Graceful Shutdown ───
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  httpServer.close(() => {
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
  // Force exit after 10s if graceful shutdown fails
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Uncaught Error Handlers ───
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
