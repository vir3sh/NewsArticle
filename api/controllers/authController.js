const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Register User or Admin
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, username } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const normalizedRole = role
      ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      : "User";
    if (!["Admin", "User"].includes(normalizedRole)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const normalizedUsername = username || email.split("@")[0]; // Use email prefix as default username

    const existingUser = await User.findOne({ email });
    const existingUsername = await User.findOne({
      username: normalizedUsername,
    });
    if (existingUser || existingUsername) {
      return res
        .status(400)
        .json({ error: "Email or username already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
      username: normalizedUsername,
    });
    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error" });
  }
};

// Login User or Admin
const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid email/username or password" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Invalid email/username or password" });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { registerUser, loginUser };
