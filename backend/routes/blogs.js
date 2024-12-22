const express = require("express");
const Blog = require("../models/Blog");
const User = require("../models/User");
const { protect, admin } = require("../middleware/auth"); // Import protect and admin middleware
const { protectBlogs, adminBlogs } = require("../middleware/blog"); // Import protect and admin middleware
const router = express.Router();

// Create Blog (Admin only)
router.post("/", protect, admin, async (req, res) => {
  const { title, content, image, category, tags } = req.body;

  try {
    // Create a new blog post
    const tagArray = tags.split(",").map((tag) => tag.trim());
    const blog = new Blog({
      title,
      content,
      image,
      category,
      tags: tagArray,
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

router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { title, content, image, category, tags } = req.body;

    // Find the blog by ID
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Handle tags: Ensure it's an array
    const processedTags = Array.isArray(tags)
      ? tags
      : tags.split(",").map((tag) => tag.trim());

    // Update the blog
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.image = image || blog.image;
    blog.category = category || blog.category;
    blog.tags = processedTags || blog.tags;

    await blog.save();

    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Error updating blog" });
  }
});

// Delete Blog (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    // Find the blog by ID and delete it
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Error deleting blog" });
  }
});

// Post a comment on a blog (normal users only)
router.post("/:blogId/comments", protectBlogs, async (req, res) => {
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

// router.get("/me", protect, async (req, res) => {
//   try {
//     // Find the user by the ID from the JWT token
//     const user = await Blog.findById(req.user.id); // Exclude password from the response

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Send the user details as response
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });

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

router.get("/adminBlogs", protect, admin, async (req, res) => {
  try {
    // Log the admin's user ID
    // console.log("Admin user ID:", req.user.id); // Log the admin's ID to verify it's correct

    // Ensure that req.user.id is a valid ObjectId and use it to query the blogs
    const blogs = await Blog.find({ author: req.user.id });

    if (blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found for this admin" });
    }

    res.status(200).json({ blogs });
  } catch (error) {
    console.error("Error fetching admin blogs:", error);
    res.status(500).json({ message: "Error fetching blogs", error });
  }
});

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

router.post("/:blogId/favourite", protectBlogs, async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user.id; // Extracted from the authentication middleware

  try {
    // Find the blog by ID
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Find the user and update their favourites
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User nosst found" });
    }

    // Check if the blog is already in the user's favourites
    if (user.favourites.includes(blogId)) {
      // If it's already a favourite, remove it
      user.favourites.pull(blogId);
    } else {
      // If it's not a favourite, add it
      user.favourites.push(blogId);
    }

    await user.save(); // Save the user after updating their favourites
    res.status(200).json({ message: "Favourite status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user/favourites", protect, async (req, res) => {
  const userId = req.user.id;

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

router.get("/comments/:adminId", protect, admin, async (req, res) => {
  try {
    const { adminId } = req.params;

    // Find all blogs authored by the given admin ID
    const blogs = await Blog.find({ author: adminId });

    // Extract comments along with blog title from all blogs
    const allComments = blogs.flatMap((blog) =>
      blog.comments.map((comment) => ({
        commentId: comment._id,
        content: comment.content,
        author: comment.author,
        blogTitle: blog.title, // Add the blog title to the comment object
      }))
    );

    res.status(200).json({ comments: allComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
});

// Delete a specific comment
router.delete(
  "/comments/:adminId/:commentId",
  protect,
  admin,
  async (req, res) => {
    try {
      const { adminId, commentId } = req.params;

      // Find the blog containing the comment posted by the admin
      const blog = await Blog.findOne({
        author: adminId,
        "comments._id": commentId,
      });

      if (!blog) {
        return res
          .status(404)
          .json({ message: "Comment not found or not authorized" });
      }

      // Remove the comment from the blog
      blog.comments = blog.comments.filter(
        (comment) => comment._id.toString() !== commentId
      );

      await blog.save();

      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Error deleting comment" });
    }
  }
);

module.exports = router;
