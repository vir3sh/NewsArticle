import { useNavigate } from "react-router-dom"; // For navigation
import { useEffect, useState } from "react"; // For checking the user role
import "./Navbar.css"; // Importing CSS for styling

const Navbar = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [role, setRole] = useState(null); // Store user's role (user/admin)

  useEffect(() => {
    // Get the token from localStorage or cookies and decode it to get the user's role
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decoding the JWT token
        setRole(decodedToken.role); // Assuming the role is in the decoded token
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const logout = () => {
    // Clear any authentication tokens or session data
    localStorage.removeItem("token"); // If using localStorage for token
    alert("Logged out successfully!");
    navigate("/login"); // Redirect to login page using useNavigate
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <a href="#">NewsArticle</a>
      </div>

      {/* Search bar only visible if the user is not an admin */}
      {role === "user" && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search articles..."
            className="search-input"
          />
        </div>
      )}

      <div className="nav-links">
        <button
          className="profile-btn"
          onClick={() => navigate("/profile")} // Navigate to user profile page
        >
          User Profile
        </button>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
