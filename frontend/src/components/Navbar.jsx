import { useNavigate } from "react-router-dom"; // For navigation
import "./Navbar.css"; // Importing CSS for styling

const Navbar = () => {
  const navigate = useNavigate(); // Hook for navigation

  const logout = () => {
    // Clear any authentication tokens or session data
    localStorage.removeItem("token"); // Uncomment if using localStorage for token
    // Or use cookies.remove('token'); for cookie-based auth
    alert("Logged out successfully!");
    navigate("/login"); // Redirect to login page using useNavigate
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <a href="#">NewsArticle</a>
      </div>
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
