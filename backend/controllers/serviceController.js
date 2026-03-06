const Service = require("../models/Service");
const Booking = require("../models/Booking");
const Rating = require("../models/Rating");

// GET /api/services
async function getAllServices(req, res, next) {
  try {
    const services = await Service.find().sort({ createdAt: -1 }).lean();
    // map to frontend-friendly shape
    const out = services.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      image: s.image,
      price: s.price,
      duration: s.duration,
      averageRating: s.averageRating || 0,
      totalRatings: s.totalRatings || 0,
      location: s.location || {},
      likesCount: s.likesCount || 0,
      facilities: Array.isArray(s.facilities)
        ? s.facilities
        : s.facilities
        ? [s.facilities]
        : [],
    }));
    res.json({ services: out });
  } catch (err) {
    next(err);
  }
}

// POST /api/services (admin)
async function createService(req, res, next) {
  try {
    const { name, image, price, duration, location, facilities } = req.body;

    if (!name || !image || !price || !duration) {
      return res.status(400).json({ message: "Missing required fields (name, image, price, duration)" });
    }

    const service = new Service({
      name,
      image,
      price,
      duration,
      location,
      facilities,
      createdBy: req.user?._id,
    });

    await service.save();
    res.status(201).json({ service });
  } catch (err) {
    next(err);
  }
}

// GET /api/services/:id/can-rate
async function canRate(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user && req.user._id;
    if (!userId) return res.json({ canRate: false });

    // find a completed booking for this user and service
    const booking = await Booking.findOne({ userId, serviceId: id, status: "Completed" });
    if (!booking) return res.json({ canRate: false });

    // check if rating exists for this booking
    const rated = await Rating.findOne({ bookingId: booking._id });
    return res.json({ canRate: !rated });
  } catch (err) {
    next(err);
  }
}

// POST /api/services/:id/rate
async function rateService(req, res, next) {
  try {
    const { id } = req.params; // service id
    const { rating, review } = req.body;
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Invalid rating" });

    // locate a completed booking for user and service that hasn't been rated
    const booking = await Booking.findOne({ userId, serviceId: id, status: "Completed" }).sort({ completedAt: -1 });
    if (!booking) return res.status(400).json({ message: "No completed booking found for this service" });

    const existing = await Rating.findOne({ bookingId: booking._id });
    if (existing) return res.status(400).json({ message: "Already rated" });

    const newRating = new Rating({ bookingId: booking._id, userId, rating, review });
    await newRating.save();

    // update service aggregate
    const service = await Service.findById(id);
    if (service) {
      const prevTotal = service.totalRatings || 0;
      const prevAvg = service.averageRating || 0;
      const newTotal = prevTotal + 1;
      const newAvg = Math.round(((prevAvg * prevTotal + rating) / newTotal) * 10) / 10;
      service.totalRatings = newTotal;
      service.averageRating = newAvg;
      await service.save();

      return res.json({ averageRating: newAvg, totalRatings: newTotal, userCanRate: false });
    }

    // service not found, still return rating created
    return res.json({ message: "Rating saved" });
  } catch (err) {
    next(err);
  }
}

// PUT /api/services/:id (admin) - update service
async function updateService(req, res, next) {
  try {
    const { id } = req.params;
    const updates = {};
    const allowed = ["name", "image", "price", "duration", "location", "facilities"];
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    const svc = await Service.findByIdAndUpdate(id, updates, { new: true });
    if (!svc) return res.status(404).json({ message: "Service not found" });
    res.json({ service: {
      id: svc._id.toString(), name: svc.name, image: svc.image, price: svc.price, duration: svc.duration, averageRating: svc.averageRating, totalRatings: svc.totalRatings, location: svc.location
    } });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/services/:id (admin)
async function deleteService(req, res, next) {
  try {
    const { id } = req.params;
    const svc = await Service.findByIdAndDelete(id);
    if (!svc) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
}

// POST /api/services/:id/like (toggle like)
async function toggleLike(req, res, next) {
  try {
    const { id } = req.params;
    const userId = (req.user && req.user._id && req.user._id.toString()) || req.body.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const likedUsers = service.likedUsers || [];
    const alreadyLiked = likedUsers.some((u) => u.toString() === userId);

    if (alreadyLiked) {
      service.likedUsers = likedUsers.filter((u) => u.toString() !== userId);
      service.likesCount = Math.max(0, (service.likesCount || 0) - 1);
    } else {
      service.likedUsers = [...likedUsers, userId];
      service.likesCount = (service.likesCount || 0) + 1;
    }

    await service.save();

    return res.json({
      likesCount: service.likesCount,
      liked: !alreadyLiked,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllServices, createService, canRate, rateService, updateService, deleteService, toggleLike };