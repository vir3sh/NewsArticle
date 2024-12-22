const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const { protect, admin } = require("./middleware/auth");
const blogRoutes = require("./routes/blogs");
const cookieParser = require("cookie-parser");
dotenv.config();
const app = express();

const cors = require("cors");

app.use(cors());

app.use(cookieParser());
app.use(express.json()); // to parse JSON request bodies

mongoose
  .connect("mongodb://localhost:27017/finalblog", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
