const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// auth middleware helpers
const { authenticate, requireAdmin } = require("./middleware/authMiddleware");

// app.use(
  // cors({
    // origin: true,
    // credentials: true,
  // })
// );
// Express 5 compatible preflight handler for all routes
// 
// --- START OF CORRECTED CORS CONFIGURATION ---

// Define your allowed origins
// It's crucial to list the exact domain of your frontend application.
// For development, you might include 'http://localhost:3000' or whatever your frontend dev server runs on.
// const allowedOrigins = ['https://gilded-appointments.vercel.app'];
// const vercelRegex = /\.vercel\.app$/;
// const corsOptions = {
  // origin: function (origin, callback) {
    // if (!origin) return callback(null, true);
    // if (allowedOrigins.includes(origin) || vercelRegex.test(origin)) return callback(null, true);
    // return callback(null, false);
  // },
  // credentials: true,
// };
// app.use(cors(corsOptions));
// app.options(/^\/.*/, cors(corsOptions));


const allowedOrigins = [
  'http://localhost:5174', // Local development
  'http://localhost:3000', // Alternative local port
  'https://backend-salone.vercel.app/', // Production frontend
  process.env.FRONTEND_URL, // Dynamic frontend URL from env
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// --- END OF CORRECTED CORS CONFIGURATION ---

app.use(express.json());

// Serve generated receipts as static files so they are accessible via URL
// 

// 

// Serve generated receipts as static files so they are accessible via URL
app.use(
  "/receipts",
  express.static(path.join(__dirname, "receipts"), { maxAge: "1h" })
);

/* ==============================
   MONGODB CONNECTION
   - use MONGO_URI env var, fallback to local
============================== */

if (process.env.NODE_ENV === "production" && !process.env.MONGO_URI) {
  console.error("Missing MONGO_URI in production environment");
}

const mongoUri = process.env.MONGO_URI || "mongodb+srv://kumararya41285_db_user:P8ojWwAYHAuBFM9C@cluster0.at2e3tf.mongodb.net/salonDb?retryWrites=true&w=majority";

let mongoState = "disconnected";

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    mongoState = "connected";
    try {
      const redacted = mongoUri.replace(/\/\/.*@/, "//***:***@");
      console.log("MongoDB Connected Successfully", { uri: redacted });
    } catch {
      console.log("MongoDB Connected Successfully");
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err?.message || err);
    mongoState = "error";
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error event:", err?.message || err);
});
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
  mongoState = "disconnected";
});

// simple health route
app.get("/", (req, res) => {
  res.json({ message: "Backend Running", status: "ok" });
});

// detailed API status check
app.get("/api/status", (req, res) => {
  let state = mongoState;
  const rs = mongoose.connection.readyState;
  if (rs === 1) state = "connected";
  else if (rs === 2) state = "connecting";
  else if (rs === 0) state = "disconnected";
  else if (rs === 3) state = "disconnecting";
  res.json({ status: "ok", server: "running", mongodb: state, timestamp: new Date().toISOString() });
});

// example protected route
app.get("/api/protected", authenticate, (req, res) => {
  res.json({ message: "You reached a protected endpoint", user: req.user });
});

// admin-only route
app.get("/api/admin", authenticate, requireAdmin, (req, res) => {
  res.json({ message: "Admin content only", user: req.user });
});

/* ==============================
   JWT SECRET
   - loaded from env
============================== */

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not defined in environment, using default");
  process.env.JWT_SECRET = "supersecretkey123";
}

/* ==============================
   ROUTES
============================== */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
// app.use("/api/bookings", require("./routes/bookingRoutes"));
// services (public + admin + rating endpoints)
app.use("/api/services", require("./routes/serviceRoutes"));
// 
/* ==============================
   404 HANDLER
============================== */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.path });
});

/* ==============================
   ERROR HANDLER
============================== */

app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

/* ==============================
   SERVER START
============================== */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
