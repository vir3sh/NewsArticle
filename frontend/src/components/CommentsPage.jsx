import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Correct import for jwtDecode
import "./commentsPage.css";

const CommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);

  const getTokenFromCookies = () => {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? match[2] : null;
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const token = getTokenFromCookies();
        if (!token) {
          setError("User is not authenticated.");
          return;
        }

        const decoded = jwtDecode(token);
        const adminId = decoded.id;

        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/api/blogs/comments/${adminId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        setComments(response.data.comments || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Error fetching comments.");
      }
    };

    fetchComments();
  }, []);

  const handleDelete = async (commentId) => {
    try {
      const token = getTokenFromCookies();
      if (!token) {
        setError("User is not authenticated.");
        return;
      }

      const decoded = jwtDecode(token);
      const adminId = decoded.id;

      await axios.delete(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/blogs/comments/${adminId}/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

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
