import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./user.css";

const UserPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]); // Keep track of bookmarked blogs
  const navigate = useNavigate();

  // Function to fetch blogs
  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/blogs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  // Function to toggle bookmark
  const handleBookmark = async (blogId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${blogId}/bookmark`, // Post request to toggle bookmark
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token in the headers
          },
        }
      );

      const isBookmarked = bookmarkedBlogs.includes(blogId);
      if (isBookmarked) {
        // Remove from bookmarks
        setBookmarkedBlogs(bookmarkedBlogs.filter((id) => id !== blogId));
      } else {
        // Add to bookmarks
        setBookmarkedBlogs([...bookmarkedBlogs, blogId]);
      }

      console.log(response.data.message); // Log success message
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  // Function to fetch the list of bookmarked blogs
  const fetchBookmarkedBlogs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        "http://localhost:5000/api/blogs/bookmarks", // Endpoint for fetching bookmarked blogs
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token in the headers
          },
        }
      );

      setBookmarkedBlogs(response.data.bookmarks); // Set the list of bookmarked blogs
    } catch (error) {
      console.error("Error fetching bookmarked blogs:", error);
    }
  };

  const handleFavourite = async (blogId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${blogId}/favourite`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Optionally update UI after adding/removing from favourites
      setBookmarkedBlogs((prev) =>
        prev.includes(blogId)
          ? prev.filter((id) => id !== blogId)
          : [...prev, blogId]
      );
    } catch (err) {
      console.error("Failed to favourite blog", err);
    }
  };

  // Use useEffect to fetch blogs when the component mounts
  useEffect(() => {
    fetchBlogs();
    fetchBookmarkedBlogs();
  }, []);

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const goToFavourites = () => {
    navigate("/favourites");
  };

  return (
    <div className="user-page-container">
      <h2>Blogs</h2>
      <button className="favourites-button" onClick={goToFavourites}>
        View Favourite Blogs
      </button>
      <div className="blogs-list">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <div key={blog._id} className="blog-item">
              {/* Blog Image */}
              {blog.image && (
                <img src={blog.image} alt={blog.title} className="blog-image" />
              )}

              {/* Blog Title */}
              <h3 onClick={() => handleBlogClick(blog._id)}>{blog.title}</h3>

              {/* Truncated Blog Content */}
              <p onClick={() => handleBlogClick(blog._id)}>
                {blog.content.split(" ").slice(0, 30).join(" ")}...
              </p>

              {/* Tags Section */}
              <div className="blog-tags">
                {blog.tags && blog.tags.length > 0 ? (
                  blog.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag} {/* Ensure # is applied to every tag */}
                    </span>
                  ))
                ) : (
                  <span className="no-tags">No tags available</span>
                )}
              </div>

              {/* Category Section */}

              <div className="blog-category">
                <hr className="category-line" /> {/* Line above the category */}
                <span className="category-label">Category: </span>{" "}
                {/* Add the label before the category */}
                {blog.category ? (
                  <span className="category">{blog.category}</span>
                ) : (
                  <span className="no-category">No category available</span>
                )}
              </div>

              {/* Blog Actions */}
              <div className="blog-actions">
                {/* Read More Button */}
                <button onClick={() => handleBlogClick(blog._id)}>
                  Read More
                </button>

                {/* favourite Button */}
                <button
                  onClick={() => handleFavourite(blog._id)}
                  className={
                    bookmarkedBlogs.includes(blog._id)
                      ? "bookmark-button bookmarked"
                      : "bookmark-button"
                  }
                >
                  {bookmarkedBlogs.includes(blog._id)
                    ? "Unbookmark"
                    : "Bookmark"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state">No blogs available</p>
        )}
      </div>
    </div>
  );
};

export default UserPage;
