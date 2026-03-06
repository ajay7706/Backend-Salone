const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, maxlength: 500 },
  cleanliness: { type: Number, min: 1, max: 5 },
  service: { type: Number, min: 1, max: 5 },
  professionalism: { type: Number, min: 1, max: 5 },
  value: { type: Number, min: 1, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model("Rating", ratingSchema);
