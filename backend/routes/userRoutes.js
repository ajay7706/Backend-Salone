const express = require("express");
const router = express.Router();
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

// user routes (requires authentication)
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post("/change-password", authenticate, changePassword);
router.delete("/account", authenticate, deleteAccount);

// admin routes (requires authentication + admin role)
router.get("/", authenticate, requireAdmin, getAllUsers);
router.get("/:id", authenticate, requireAdmin, getUserById);
router.put("/:id/role", authenticate, requireAdmin, updateUserRole);
router.delete("/:id", authenticate, requireAdmin, deleteUser);

module.exports = router;
