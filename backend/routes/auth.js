const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");

// Register Route
// Register Route
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({ username, email, password, role });
    await user.save();

    // Set token in the cookie
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Make sure cookies are only sent over HTTPS in production
      sameSite: "None", // Important for cross-site cookies (especially for third-party cookies)
    });

    // res.status(201).json({ message: "User registered successfully" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set token in the cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure it's only secure in production
      sameSite: "None", // For cross-site requests
    });

    // res.json({ message: "User logged in successfully" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    // Find the user by the ID from the JWT token
    const user = await User.findById(req.user.id); // Exclude password from the response

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user details as response
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
