const jwt = require("jsonwebtoken");
const User = require("../models/User");

// verify that a request contains a valid JWT token
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // optionally fetch user from DB to attach full record
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token: user not found" });
    }
    req.user = user; // attach for downstream handlers
    next();
  } catch (err) {
    console.error("Auth middleware error", err);
    return res.status(403).json({ message: "Token is not valid" });
  }
}

// additional helper to require admin role
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
