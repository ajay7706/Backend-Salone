const Booking = require("../models/Booking");
const User = require("../models/User");
const Rating = require("../models/Rating");
const Service = require("../models/Service");
const pdfService = require("../services/pdfService");
const notificationService = require("../services/notificationService");

// create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, serviceName, servicePrice, date, time } = req.body;
    const userId = req.user._id;

    if (!serviceId || !serviceName || !servicePrice || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if booking already exists for same date/time
    const existingBooking = await Booking.findOne({
      serviceId,
      date,
      time,
      status: { $ne: "Cancelled" },
    });

    if (existingBooking) {
      return res
        .status(409)
        .json({ message: "This time slot is already booked" });
    }

    const booking = new Booking({
      userId,
      serviceId,
      serviceName,
      servicePrice,
      date,
      time,
      status: "Pending",
    });

    await booking.save();

    // try to generate receipt and notify user immediately
    try {
      const pdfResult = await pdfService.generateReceiptPDF(booking, req.user);
      const pdfPath = pdfResult.filePath || pdfResult;
      const pdfPublicUrl = pdfResult.publicUrl || null;

      // email
      await notificationService.sendBookingConfirmationEmail(
        req.user.email,
        req.user.name,
        booking,
        pdfPath
      );
      // whatsapp (may not reach when developing locally)
      await notificationService.sendWhatsAppNotification(
        req.user.phone,
        req.user.name,
        booking,
        true,
        pdfPublicUrl
      );

      booking.emailSent = true;
      booking.whatsappSent = true;
      booking.pdfSentAt = new Date();
      await booking.save();
    } catch (notifyErr) {
      console.error("Error generating receipt or sending notifications:", notifyErr.message || notifyErr);
      // don't fail the original request, user booking is created regardless
    }

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get all bookings for the current user
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ userId })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN: get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email phone")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get a single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("userId", "name email phone")
      .populate("approvedBy", "name");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // check if user owns this booking (unless admin)
    if (
      req.user.role !== "admin" &&
      booking.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN: approve booking
exports.approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findById(id).populate("userId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only pending bookings can be approved" });
    }

    // Update booking
    booking.status = "Approved";
    booking.approvedBy = req.user._id;
    booking.approvedAt = new Date();
    booking.notes = notes || "";
    await booking.save();

    // Generate PDF receipt (returns filePath and publicUrl)
    const pdfResult = await pdfService.generateReceiptPDF(booking, booking.userId);
    const pdfPath = pdfResult.filePath || pdfResult;
    const pdfPublicUrl = pdfResult.publicUrl || null;

    // Send email with PDF
    await notificationService.sendBookingConfirmationEmail(
      booking.userId.email,
      booking.userId.name,
      booking,
      pdfPath
    );

    // Send WhatsApp notification including mediaUrl (if available)
    await notificationService.sendWhatsAppNotification(
      booking.userId.phone,
      booking.userId.name,
      booking,
      true,
      pdfPublicUrl
    );

    booking.emailSent = true;
    booking.whatsappSent = true;
    booking.pdfSentAt = new Date();
    await booking.save();

    res.json({
      message: "Booking approved and notifications sent",
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// ADMIN: reject booking
exports.rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ message: "Rejection reason is required" });
    }

    const booking = await Booking.findById(id).populate("userId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only pending bookings can be rejected" });
    }

    // Update booking
    booking.status = "Rejected";
    booking.rejectionReason = reason;
    booking.approvedBy = req.user._id;
    booking.approvedAt = new Date();
    await booking.save();

    // Send rejection email
    await notificationService.sendRejectionEmail(
      booking.userId.email,
      booking.userId.name,
      booking,
      reason
    );

    res.json({
      message: "Booking rejected and user notified",
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// ADMIN: mark booking as completed
exports.completeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("userId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Approved") {
      return res
        .status(400)
        .json({ message: "Only approved bookings can be marked as completed" });
    }

    booking.status = "Completed";
    booking.completedAt = new Date();
    await booking.save();

    // Send completion notification asking for rating
    await notificationService.sendCompletionNotification(
      booking.userId.email,
      booking.userId.name,
      booking
    );

    res.json({
      message: "Booking marked as completed",
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// update booking status (user only - for cancelling)
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Users can only cancel pending/approved bookings
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (
      !["Pending", "Approved", "Completed", "Cancelled"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (status === "Cancelled" && !["Pending", "Approved"].includes(booking.status)) {
      return res
        .status(400)
        .json({ message: "This booking cannot be cancelled" });
    }

    booking.status = status;
    await booking.save();
    res.json({ message: "Booking updated", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["Pending", "Approved"].includes(booking.status)) {
      return res
        .status(400)
        .json({
          message:
            "Only pending or approved bookings can be cancelled",
        });
    }

    booking.status = "Cancelled";
    await booking.save();
    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// USER: create a rating
exports.createRating = async (req, res) => {
  try {
    const { bookingId, rating, review, cleanliness, service, professionalism, value } =
      req.body;
    const userId = req.user._id;

    if (!bookingId || !rating) {
      return res
        .status(400)
        .json({ message: "Booking ID and rating are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status !== "Completed") {
      return res
        .status(400)
        .json({
          message:
            "You can only rate completed bookings",
        });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({ bookingId });
    if (existingRating) {
      return res.status(409).json({ message: "You have already rated this booking" });
    }

    const newRating = new Rating({
      bookingId,
      userId,
      rating: Math.min(5, Math.max(1, rating)),
      review: review || "",
      cleanliness: cleanliness || Math.max(1, Math.min(5, rating)),
      service: service || Math.max(1, Math.min(5, rating)),
      professionalism: professionalism || Math.max(1, Math.min(5, rating)),
      value: value || Math.max(1, Math.min(5, rating)),
    });

    await newRating.save();

    // also update service aggregates so cards reflect this rating
    const bookingForService = await Booking.findById(bookingId);
    if (bookingForService && bookingForService.serviceId) {
      const service = await Service.findById(bookingForService.serviceId);
      if (service) {
        const prevTotal = service.totalRatings || 0;
        const prevAvg = service.averageRating || 0;
        const newTotal = prevTotal + 1;
        const newAvg =
          Math.round(((prevAvg * prevTotal + rating) / newTotal) * 10) / 10;
        service.totalRatings = newTotal;
        service.averageRating = newAvg;
        await service.save();
      }
    }

    res.status(201).json({ message: "Rating created", rating: newRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get ratings for a booking
exports.getBookingRating = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const rating = await Rating.findOne({ bookingId }).populate(
      "userId",
      "name avatar"
    );

    if (!rating) {
      return res.status(404).json({ message: "No rating found" });
    }

    res.json(rating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get all ratings
exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate("userId", "name avatar")
      .populate("bookingId")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
