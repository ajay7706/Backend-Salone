const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "MONGO_URI=mongodb+srv://kumararya41285_db_user:P8ojWwAYHAuBFM9C@cluster0.at2e3tf.mongodb.net/salonDb?retryWrites=true&w=majority");
    console.log("✓ Connected to MongoDB");

    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@salon.com" });
    if (adminExists) {
      console.log("✗ Admin account already exists!");
      process.exit(0);
    }

    // Hash the password
    const passwordHash = await bcrypt.hash("admin123", 10);

    // Create admin user
    const admin = new User({
      name: "Admin User",
      email: "admin@salon.com",
      phone: "1234567890",
      password: passwordHash,
      role: "admin"
    });

    await admin.save();
    console.log("✓ Admin account created successfully!");
    console.log("\nAdmin Login Credentials:");
    console.log("─────────────────────────");
    console.log("Email/Phone: admin@salon.com");
    console.log("Password:    admin123");
    console.log("─────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("✗ Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
