const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// helper to create token
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, password: hashed });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, name, email, phone, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailORphone, password } = req.body;
    if (!emailORphone || !password) {
      return res.status(400).json({ message: "Email/Phone and password required" });
    }

    const user = await User.findOne({ $or: [{ email: emailORphone }, { phone: emailORphone }] });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// REGISTER
// exports.register = async (req, res) => {
//   try {
    // const { name, email, phone, password } = req.body;
// 
    // const hashedPassword = await bcrypt.hash(password, 10);
// 
    // const user = await User.create({
    //   name,
    //   email,
    //   phone,
    //   password: hashedPassword,
    // });
// 
    // res.status(201).json({
    //   message: "User registered successfully",
    // });
//   } catch (error) {
    // res.status(400).json({ message: error.message });
//   }
// };
// 
// LOGIN
// exports.login = async (req, res) => {
//   try {
    // const { emailOrPhone, password } = req.body;
// 
    // const user = await User.findOne({
    //   $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    // });
// 
    // if (!user) {
    //   return res.status(400).json({ message: "Invalid credentials" });
    // }
// 
    // const isMatch = await bcrypt.compare(password, user.password);
// 
    // if (!isMatch) {
    //   return res.status(400).json({ message: "Invalid credentials" });
    // }
// 
    // const token = jwt.sign(
    //   { id: user._id, role: user.role },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "7d" }
    // );
// 
    // res.json({
    //   token,
    //   role: user.role,
    //   name: user.name,
    // });
//   } catch (error) {
    // res.status(500).json({ message: error.message });
//   }
// };