const express = require("express");
const router = express.Router();
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  approveBooking,
  rejectBooking,
  completeBooking,
  createRating,
  getBookingRating,
  getAllRatings,
} = require("../controllers/bookingController");

// USER: Create and view bookings
router.post("/", authenticate, createBooking);
router.get("/", authenticate, getUserBookings);
router.get("/:id", authenticate, getBookingById);
router.put("/:id", authenticate, updateBooking);
router.delete("/:id", authenticate, cancelBooking);

// ADMIN: View all bookings
router.get("/admin/all", authenticate, requireAdmin, getAllBookings);

// ADMIN: Approve booking
router.post("/:id/approve", authenticate, requireAdmin, approveBooking);

// ADMIN: Reject booking
router.post("/:id/reject", authenticate, requireAdmin, rejectBooking);

// ADMIN: Mark as completed
router.post("/:id/complete", authenticate, requireAdmin, completeBooking);

// RATINGS: Create and view ratings
router.post("/:id/rating", authenticate, createRating);
router.get("/:bookingId/rating", getBookingRating);
router.get("/ratings", getAllRatings);

module.exports = router;
