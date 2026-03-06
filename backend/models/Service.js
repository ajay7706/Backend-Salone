const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  city: { type: String },
  address: { type: String },
});

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // minutes
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    location: { type: locationSchema, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    facilities: [{ type: String }], // Array of facilities for the service
    likesCount: { type: Number, default: 0 },
    likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
