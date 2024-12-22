const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  // const token = req.header("Authorization")?.replace("Bearer ", "");
  const token = req.cookies.token;
  console.log("Token received:", token);

  if (!token)
    return res.status(401).json({ message: "Not authorized, token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = decoded;
    // console.log("Decoded user:", req.user);

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

const admin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied, admin only" });
  }
  next();
};

module.exports = { protect, admin };
