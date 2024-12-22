const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const { protectBlogs } = require("../middleware/blog");

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
      { expiresIn: "7d" }
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
      { expiresIn: "7d" }
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

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user data", error: err.message });
  }
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(req.user.id, {
      username,
      email,
      password: hashedPassword,
    });

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Get a user's favourite blogs
router.get("/user/favourites", protectBlogs, async (req, res) => {
  const userId = req.user._id; // Extracted from the authentication middleware

  try {
    // Find the user and populate their favourites
    const user = await User.findById(userId).populate("favourites"); // Populate the favourite blogs
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.favourites); // Return the favourite blogs
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
