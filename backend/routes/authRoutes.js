const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");

// placeholder route for authentication
router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" });
});

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
