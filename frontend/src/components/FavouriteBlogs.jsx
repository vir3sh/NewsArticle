import React, { useEffect, useState } from "react";
import axios from "axios";
import "./favourite.css";

const FavouriteBlogs = () => {
  const [favouriteBlogs, setFavouriteBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the user's favourite blogs when the component mounts
    const fetchFavouriteBlogs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/blogs/user/favourites",
          { withCredentials: true },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setFavouriteBlogs(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching favourite blogs:", err);
        setError("Failed to load favourite blogs");
        setLoading(false);
      }
    };

    fetchFavouriteBlogs();
  }, []);

  if (loading) {
    return <p>Loading favourite blogs...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="favourite-blogs-page">
      <h2>Your Favourite Blogs</h2>
      {favouriteBlogs.length === 0 ? (
        <p>You have no favourite blogs.</p>
      ) : (
        <div className="favourite-blogs-list">
          {favouriteBlogs.map((blog) => (
            <div key={blog._id} className="blog-item">
              {/* Displaying Blog Image */}
              {blog.image && (
                <img src={blog.image} alt={blog.title} className="blog-image" />
              )}

              {/* Blog Title */}
              <h3>{blog.title}</h3>

              {/* Blog Category */}
              <p>Category: {blog.category}</p>

              {/* Blog Content */}
              <p>{blog.content.slice(0, 100)}...</p>

              {/* Read More Button */}
              <button
                onClick={() => (window.location.href = `/blog/${blog._id}`)}
              >
                Read More
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouriteBlogs;
