import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./admin.css";

const AdminPanel = () => {
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({
    title: "",
    content: "",
    image: "",
    category: "",
    tags: "",
  });
  const [editingBlog, setEditingBlog] = useState(null);
  const [error, setError] = useState(null);
  const [showAddBlogForm, setShowAddBlogForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  // Fetch blogs on component mount
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/api/blogs/adminBlogs`,
          {
            withCredentials: true,
          }
        );
        console.log("Blogs fetched:", response.data);
        setBlogs(response.data.blogs); // Assuming response has a `blogs` key
      } catch (err) {
        console.error("Error fetching blogs:", err);
        // setError("Error fetching blogs.");
      }
    };

    fetchBlogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBlog((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/blogs`,
        newBlog,
        {
          withCredentials: true,
        }
      );
      setNewBlog({
        title: "",
        content: "",
        image: "",
        category: "",
        tags: "",
      });
      setShowAddBlogForm(false);
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/blogs/adminBlogs`,
        {
          withCredentials: true,
        }
      );
      setBlogs(response.data.blogs);
    } catch (err) {
      setError("Error adding blog.");
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setNewBlog({
      title: blog.title,
      content: blog.content,
      image: blog.image,
      category: blog.category,
      tags: blog.tags,
    });
    setShowEditModal(true);
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/blogs/${
          editingBlog._id
        }`,
        newBlog,
        {
          withCredentials: true,
        }
      );
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/blogs/adminBlogs`,
        {
          withCredentials: true,
        }
      );
      setBlogs(response.data.blogs);
      setShowEditModal(false);
      setEditingBlog(null);
      setNewBlog({
        title: "",
        content: "",
        image: "",
        category: "",
        tags: "",
      });
    } catch (err) {
      setError("Error updating blog.", err);
    }
  };

  const handleDeleteBlog = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/blogs/${id}`,
        {
          withCredentials: true,
        }
      );
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/blogs/adminBlogs`,
        {
          withCredentials: true,
        }
      );
      setBlogs(response.data.blogs);
    } catch (err) {
      setError("Error deleting blog.");
    }
  };
  const handleViewAllComments = () => {
    navigate("/comments");
  };

  return (
    <div className="admin-panel">
      <h2 style={{ textAlign: "center" }}>Admin Panel</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Button to Toggle Add Blog Form */}
      <button
        className="add-blog-btn"
        onClick={() => setShowAddBlogForm(!showAddBlogForm)}
      >
        {showAddBlogForm ? "Cancel" : "Add New Blog"}
      </button>
      <button className="view-comments-btn" onClick={handleViewAllComments}>
        View All Comments
      </button>

      {/* Add Blog Form */}
      {showAddBlogForm && (
        <form
          onSubmit={editingBlog ? handleUpdateBlog : handleAddBlog}
          className="blog-form"
        >
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newBlog.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="content"
            placeholder="Content"
            value={newBlog.content}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={newBlog.image}
            onChange={handleChange}
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={newBlog.category}
            onChange={handleChange}
          />
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={newBlog.tags}
            onChange={handleChange}
          />
          <button type="submit" className="addbtnmodal">
            {editingBlog ? "Update Blog" : "Add Blog"}
          </button>
        </form>
      )}

      {/* List of Blogs */}
      <h3 style={{ textAlign: "center" }}>My Blogs</h3>
      <div className="blogs-list">
        {blogs.map((blog) => (
          <div key={blog._id} className="blog-card">
            <div className="blog-card-content">
              <h4>{blog.title}</h4>
              <p>
                {blog.content.split(" ").slice(0, 30).join(" ")}
                {blog.content.split(" ").length > 30 ? "..." : ""}
              </p>
              {blog.image && (
                <img src={blog.image} alt={blog.title} className="blog-image" />
              )}
              <div className="blog-card-footer">
                <p>
                  <strong>Category:</strong> {blog.category}
                </p>
                <p>
                  <strong>Tags:</strong> {blog.tags}
                </p>
              </div>
            </div>
            <div className="blog-card-actions">
              <button onClick={() => handleEditBlog(blog)} className="edit-btn">
                Edit
              </button>
              <button
                onClick={() => handleDeleteBlog(blog._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Blog Modal */}
      {showEditModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          className="modal"
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "500px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
            className="modal-content"
          >
            <div className="modal-header" style={{ marginBottom: "10px" }}>
              <h2>Edit Blog</h2>
              <button
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
                onClick={() => setShowEditModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateBlog} className="blog-form">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={newBlog.title}
                onChange={handleChange}
                required
              />
              <textarea
                name="content"
                placeholder="Content"
                value={newBlog.content}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="image"
                placeholder="Image URL"
                value={newBlog.image}
                onChange={handleChange}
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={newBlog.category}
                onChange={handleChange}
              />
              <input
                type="text"
                name="tags"
                placeholder="Tags (comma separated)"
                value={newBlog.tags}
                onChange={handleChange}
              />
              <button type="submit" className="addbtnmodal">
                Update Blog
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
