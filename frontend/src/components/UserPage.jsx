import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./user.css";

const UserPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query
  const [filteredBlogs, setFilteredBlogs] = useState([]); // State for filtered blogs
  const [searchOption, setSearchOption] = useState("title"); // Default search option (by title)
  const [currentPage, setCurrentPage] = useState(1); // State for the current page
  const [blogsPerPage] = useState(6); // Number of blogs per page
  const navigate = useNavigate();

  // Function to fetch blogs
  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/blogs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBlogs(response.data);
      setFilteredBlogs(response.data); // Initially, display all blogs
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  // Function to toggle bookmark
  const handleBookmark = async (blogId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/blogs/${blogId}/bookmark`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token in the headers
          },
        }
      );

      const isBookmarked = bookmarkedBlogs.includes(blogId);
      if (isBookmarked) {
        setBookmarkedBlogs(bookmarkedBlogs.filter((id) => id !== blogId));
      } else {
        setBookmarkedBlogs([...bookmarkedBlogs, blogId]);
      }

      console.log(response.data.message);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleFavourite = async (blogId) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/blogs/${blogId}/favourite`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setBookmarkedBlogs((prev) =>
        prev.includes(blogId)
          ? prev.filter((id) => id !== blogId)
          : [...prev, blogId]
      );
    } catch (err) {
      console.error("Failed to favourite blog", err);
    }
  };

  // Function to handle search input change
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    let filtered;
    if (searchOption === "category") {
      // Filter blogs based on category
      filtered = blogs.filter((blog) =>
        blog.category ? blog.category.toLowerCase().includes(query) : false
      );
    } else if (searchOption === "tags") {
      // Filter blogs based on tags
      filtered = blogs.filter((blog) =>
        blog.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    } else {
      // Default: Filter by title
      filtered = blogs.filter((blog) =>
        blog.title.toLowerCase().includes(query)
      );
    }

    setFilteredBlogs(filtered);
  };

  // Handle search option change (category or tags)
  const handleSearchOptionChange = (event) => {
    setSearchOption(event.target.value);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get current blogs for the current page
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // Pagination Controls
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredBlogs.length / blogsPerPage); i++) {
    pageNumbers.push(i);
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const goToFavourites = () => {
    navigate("/favourites");
  };

  return (
    <div className="user-page-container">
      <h2>News</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <select
          value={searchOption}
          onChange={handleSearchOptionChange} // Handle search option change (by title, category, or tags)
          className="search-option-select"
        >
          <option value="title">Search by Title</option>
          <option value="category">Search by Category</option>
          <option value="tags">Search by Tags</option>
        </select>
        <input
          type="text"
          placeholder={`Search by ${searchOption}...`}
          value={searchQuery}
          onChange={handleSearch} // Handle search input change
          className="search-input"
        />
      </div>

      <button className="favourites-button" onClick={goToFavourites}>
        View Favourite Blogs
      </button>

      <div className="blogs-list">
        {currentBlogs.length > 0 ? (
          currentBlogs.map((blog) => (
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
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="no-tags">No tags available</span>
                )}
              </div>

              {/* Category Section */}
              <div className="blog-category">
                <hr className="category-line" />
                <span className="category-label">Category: </span>
                {blog.category ? (
                  <span className="category">{blog.category}</span>
                ) : (
                  <span className="no-category">No category available</span>
                )}
              </div>

              {/* Blog Actions */}
              <div className="blog-actions">
                <button onClick={() => handleBlogClick(blog._id)}>
                  Read More
                </button>

                <button
                  onClick={() => handleFavourite(blog._id)}
                  className={
                    bookmarkedBlogs.includes(blog._id)
                      ? "bookmark-button bookmarked"
                      : "bookmark-button"
                  }
                >
                  {bookmarkedBlogs.includes(blog._id)
                    ? "already in Favourite"
                    : "Favourite"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-state">No blogs available</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={currentPage === number ? "active" : ""}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserPage;
