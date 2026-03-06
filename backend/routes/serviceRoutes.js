const express = require("express");
const router = express.Router();
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");
const serviceCtrl = require("../controllers/serviceController");

// public: list services
router.get("/", serviceCtrl.getAllServices);

// admin: create service (any authenticated user in this app)
router.post("/", authenticate, serviceCtrl.createService);

// admin: update service
router.put("/:id", authenticate, serviceCtrl.updateService);

// admin: delete service
router.delete("/:id", authenticate, serviceCtrl.deleteService);

// like/unlike a service
router.post("/:id/like", authenticate, serviceCtrl.toggleLike);

// check if current user can rate the specified service
router.get("/:id/can-rate", authenticate, serviceCtrl.canRate);

// rate a service (user must have completed booking)
router.post("/:id/rate", authenticate, serviceCtrl.rateService);

module.exports = router;
