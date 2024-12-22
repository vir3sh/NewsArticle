import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./comments.css";

const AllCommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/blogs/comments/all`,
          { withCredentials: true }
        );
        setComments(response.data.comments);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Error fetching comments.");
      }
    };

    fetchAllComments();
  }, []);

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/blogs/comments/delete/${commentId}`,
        { withCredentials: true }
      );
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Error deleting comment.");
    }
  };

  return (
    <div className="all-comments-page">
      <h3>All Comments</h3>
      <button onClick={() => navigate(-1)} className="back-btn">
        Back to Admin Panel
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {comments.length > 0 ? (
        <table className="comments-table">
          <thead>
            <tr>
              <th>Comment ID</th>
              <th>Blog Title</th>
              <th>Content</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment._id}>
                <td>{comment._id}</td>
                <td>{comment.blogTitle}</td>
                <td>{comment.content}</td>
                <td>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="delete-comment-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No comments available.</p>
      )}
    </div>
  );
};

export default AllCommentsPage;
