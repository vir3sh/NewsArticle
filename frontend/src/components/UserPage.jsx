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

  // Use useEffect to fetch blogs when the component mounts
  useEffect(() => {
    fetchBlogs();
    fetchBookmarkedBlogs();
  }, []);

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  return (
    <div className="user-page-container">
      <h2>Blogs</h2>
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

              <div className="blog-actions">
                {/* Read More Button */}
                <button onClick={() => handleBlogClick(blog._id)}>
                  Read More
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={() => handleBookmark(blog._id)}
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
