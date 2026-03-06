const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  servicePrice: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Completed", "Cancelled"], default: "Pending" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  completedAt: { type: Date },
  pdfSentAt: { type: Date },
  emailSent: { type: Boolean, default: false },
  whatsappSent: { type: Boolean, default: false },
  // URL returned from Cloudinary after uploading the PDF
  receiptUrl: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
