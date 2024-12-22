import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // Use useParams to get the blogId from URL
import "./blogdetail.css";
const BlogDetail = () => {
  const { blogId } = useParams(); // Get blogId from URL
  const [blog, setBlog] = useState(null); // To store the blog data
  const [comment, setComment] = useState(""); // To handle comment input
  const [comments, setComments] = useState([]); // To store the comments
  const [adminDetails, setAdminDetails] = useState(null); // To store admin details

  // Fetch the blog and comments based on blogId
  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/blogs/${blogId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBlog(response.data.blog);
        setComments(response.data.blog.comments); // Assuming the blog includes comments

        // Fetch admin details using the author._id
        const adminResponse = await axios.get(
          `http://localhost:5000/api/blogs/me/${response.data.blog.author._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAdminDetails(adminResponse.data); // Assuming the response contains admin details
      } catch (error) {
        console.error("Error fetching blog details:", error);
      }
    };

    fetchBlogDetails();
  }, [blogId]);

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${blogId}/comments`,
        { content: comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments([...comments, response.data.comment]); // Add new comment to the list
      setComment(""); // Reset comment input
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="blog-detail-container">
      {blog ? (
        <>
          <h2>{blog.title}</h2>
          {blog.image && (
            <img src={blog.image} alt={blog.title} className="blog-image" />
          )}
          <p>{blog.content}</p>

          {/* Show the blog creation date */}
          <p className="blog-date">
            <strong>Published on:</strong>{" "}
            {new Date(blog.createdAt).toLocaleDateString()}
          </p>

          {/* Show Admin details */}
          {adminDetails && (
            <div className="admin-details">
              <h4>Written by: {adminDetails.username}</h4>
              {adminDetails.image && (
                <img
                  src={adminDetails.image} // Assuming the admin image URL is in the 'image' field
                  alt={adminDetails.username}
                  className="admin-photo"
                />
              )}
            </div>
          )}

          {/* Comments Section */}
          <h3>Comments</h3>
          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="comment">
                  <p>{comment.content}</p>
                </div>
              ))
            ) : (
              <p>No comments yet</p>
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment"
              required
            />
            <button type="submit">Post Comment</button>
          </form>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default BlogDetail;
