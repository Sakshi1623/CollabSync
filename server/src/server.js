const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const channelRoutes = require("./routes/channelRoutes");
const messageRoutes = require("./routes/messageRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const { getWorkspaceAnnouncements } = require("./controllers/announcementController");
const { protect } = require("./middleware/authMiddleware");
const { checkWorkspaceMembership } = require("./middleware/accessMiddleware");
const initializeSocket = require("./sockets");

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);

app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api", messageRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

// Additional workspace routes
app.get(
  "/api/workspaces/:id/announcements",
  protect,
  checkWorkspaceMembership,
  getWorkspaceAnnouncements
);

// Central error handler
app.use(errorMiddleware);

// Start server after database connects
const startServer = async () => {
  try {
    await connectDB();

    // Initialize Socket.IO and attach to app for access in routes
    const io = initializeSocket(httpServer);
    app.set('io', io);

    httpServer.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
