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
  const [showEditModal, setShowEditModal] = useState(false); // To control the modal visibility
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/blogs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlogs(response.data);
      } catch (err) {
        setError("Error fetching blogs.");
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
    const token = localStorage.getItem("token");

    try {
      await axios.post("http://localhost:5000/api/blogs", newBlog, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewBlog({
        title: "",
        content: "",
        image: "",
        category: "",
        tags: "",
      });
      setShowAddBlogForm(false);
      const response = await axios.get("http://localhost:5000/api/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(response.data);
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
    setShowEditModal(true); // Show the modal when editing a blog
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:5000/api/blogs/${editingBlog._id}`,
        newBlog,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const response = await axios.get("http://localhost:5000/api/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(response.data);
      setShowEditModal(false); // Close the modal after updating
      setEditingBlog(null);
      setNewBlog({
        title: "",
        content: "",
        image: "",
        category: "",
        tags: "",
      });
    } catch (err) {
      setError("Error updating blog.");
    }
  };

  const handleDeleteBlog = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get("http://localhost:5000/api/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(response.data);
    } catch (err) {
      setError("Error deleting blog.");
    }
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

      {/* Form to Add or Edit Blog */}
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
          <button className="addbtnmodal" type="submit">
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

              {/* Display truncated content */}
              <p>
                {blog.content.split(" ").slice(0, 30).join(" ")}
                {blog.content.split(" ").length > 30 ? "..." : ""}
              </p>

              {/* Display image */}
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
            backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent background
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000, // Ensure modal is above other content
          }}
          className="modal"
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "500px", // Adjust width of modal as needed
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
                onClick={() => setShowEditModal(false)} // Close the modal
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
                style={{
                  width: "100%",
                  padding: "8px",
                  margin: "8px 0",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
              <textarea
                name="content"
                placeholder="Content"
                value={newBlog.content}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  margin: "8px 0",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  minHeight: "100px",
                }}
              />
              <input
                type="text"
                name="image"
                placeholder="Image URL"
                value={newBlog.image}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  margin: "8px 0",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={newBlog.category}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  margin: "8px 0",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
              <input
                type="text"
                name="tags"
                placeholder="Tags (comma separated)"
                value={newBlog.tags}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  margin: "8px 0",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
              <div className="modal-footer" style={{ marginTop: "20px" }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Update Blog
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)} // Close the modal
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "10px",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
