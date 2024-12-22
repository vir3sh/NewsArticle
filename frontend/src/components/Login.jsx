import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Ensure your CSS file is imported

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );
      const { token } = response.data;
      localStorage.setItem("token", token);

      // Store the token in cookies
      document.cookie = `token=${token}; path=/;`;

      // Decode the token to check the role (you can use a library like jwt-decode)
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decoding the JWT token to get the payload
      const userRole = decodedToken.role;

      // Redirect based on the user role
      if (userRole === "admin") {
        navigate("/admin-panel");
      } else {
        navigate("/user-page");
      }
    } catch (error) {
      setError("Invalid credentials or server error.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
