import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Decode token to get adminId
import "./commentsPage.css";

const CommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const token = document.cookie.split("=")[1]; // Get the token from cookies or local storage
        const decoded = jwtDecode(token); // Decode token to get adminId
        const adminId = decoded.id; // Assuming the token has the `id` field as `adminId`

        const response = await axios.get(
          `http://localhost:5000/api/blogs/comments/${adminId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        setComments(response.data.comments); // Set comments from the response
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Error fetching comments.");
      }
    };

    fetchComments();
  }, []);

  // Delete a comment
  const handleDelete = async (commentId) => {
    try {
      const token = document.cookie.split("=")[1]; // Get the token from cookies or local storage
      const decoded = jwtDecode(token); // Decode token to get adminId
      const adminId = decoded.id;

      await axios.delete(
        `http://localhost:5000/api/blogs/comments/${adminId}/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      // Remove the deleted comment from the state
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.commentId !== commentId)
      );
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Error deleting comment.");
    }
  };

  return (
    <div className="comments-page">
      <h2>Comments</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Blog Title</th>
            <th>Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr key={comment.commentId}>
              <td>{comment.blogTitle}</td>
              <td>{comment.content}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(comment.commentId)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommentsPage;
