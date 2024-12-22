const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String }, // URL to the image
  category: { type: String, required: true },
  tags: [{ type: String }], // Array of tags
  createdAt: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user (admin) who created the blog
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who bookmarked this blog
  readHistory: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who read the blog
      readAt: { type: Date, default: Date.now }, // Timestamp of when the blog was read
    },
  ],
  favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }]
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
