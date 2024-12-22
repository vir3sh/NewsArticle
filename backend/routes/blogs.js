const express = require("express");
const Blog = require("../models/Blog");
const { protect, admin } = require("../middleware/auth"); // Import protect and admin middleware
const router = express.Router();

// Create Blog (Admin only)
router.post("/", protect, admin, async (req, res) => {
  const { title, content, image, category, tags } = req.body;

  try {
    // Create a new blog post
    const blog = new Blog({
      title,
      content,
      image,
      category,
      tags,
      author: req.user.id, // Set the author to the logged-in admin's user ID
    });

    await blog.save();
    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Error creating blog" });
  }
});

// router.get("/", protect, admin, async (req, res) => {
//   try {
//     // Debugging: Check if req.user.id is set correctly
//     console.log("Logged in admin's ID:", req.user.id);

//     // Fetch blogs created by the logged-in admin (filter by the admin's user ID)
//     const blogs = await Blog.find({ author: req.user.id }).populate(
//       "author",
//       "username email"
//     );

//     // Log the fetched blogs for debugging
//     // console.log("Blogs fetched:", blogs);

//     if (blogs.length === 0) {
//       return res.status(404).json({ message: "No blogs found" });
//     }

//     res.json(blogs);
//   } catch (error) {
//     console.error("Error fetching blogs:", error); // Log the error for debugging
//     res.status(500).json({ message: "Error fetching blogs" });
//   }
// });
router.get("/", async (req, res) => {
  try {
    // Fetch all blogs, no authentication required
    const blogs = await Blog.find().populate("author", "username email");

    if (blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found" });
    }

    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error); // Log the error for debugging
    res.status(500).json({ message: "Error fetching blogs" });
  }
});

// Get all Blogs (visible to normal users)
router.get("/getallblogs", protect, async (req, res) => {
  try {
    // Fetch blogs created by the admin (exclude admin blogs from this route)
    const blogs = await Blog.find({ author: { $ne: req.user.id } }).populate(
      "author",
      "username email"
    );

    if (blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found" });
    }

    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Error fetching blogs" });
  }
});

// Update Blog (Admin only)
router.put("/:id", protect, admin, async (req, res) => {
  const { title, content, image, category, tags } = req.body;
  const { id } = req.params;

  try {
    // Find the blog post by ID
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Update the blog fields
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.image = image || blog.image;
    blog.category = category || blog.category;
    blog.tags = tags || blog.tags;

    // Save the updated blog
    await blog.save();
    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Error updating blog" });
  }
});

// Delete Blog (Admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  const { id } = req.params;

  try {
    // Find the blog post by ID
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting blog", error });
  }
});

// Post a comment on a blog (normal users only)
router.post("/:blogId/comments", protect, async (req, res) => {
  const { blogId } = req.params;
  const { content } = req.body;

  try {
    // Find the blog by ID
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Create a new comment and push it to the blog's comments array
    const newComment = {
      user: req.user.id, // The comment author (normal user)
      content,
    };

    blog.comments.push(newComment);
    await blog.save();

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).json({ message: "Error posting comment" });
  }
});

// Get blog details along with comments
router.get("/:blogId", async (req, res) => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId).populate(
      "comments.user",
      "username"
    ); // Populate user details in comments
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ blog }); // Send back the blog data with comments
  } catch (error) {
    console.error("Error fetching blog details:", error);
    res.status(500).json({ message: "Error fetching blog details" });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    // Find the user by the ID from the JWT token
    const user = await Blog.findById(req.user.id); // Exclude password from the response

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user details as response
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/:blogId/bookmark", protect, async (req, res) => {
  try {
    const { blogId } = req.params;
    const userId = req.user.id; // Extracting user ID from the decoded token in protect middleware

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Check if already bookmarked
    const isBookmarked = blog.bookmarks.includes(userId);
    if (isBookmarked) {
      // Remove bookmark
      blog.bookmarks.pull(userId);
    } else {
      // Add bookmark
      blog.bookmarks.push(userId);
    }

    await blog.save();
    res.json({
      message: isBookmarked ? "Bookmark removed" : "Blog bookmarked",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/blogs/bookmarks", protect, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the token
    const blogs = await Blog.find({ bookmarks: userId });

    const bookmarkedBlogIds = blogs.map((blog) => blog._id);
    res.json({ bookmarks: bookmarkedBlogIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
