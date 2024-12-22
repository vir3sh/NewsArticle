import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import AdminPanel from "./components/AdminPanel"; // Admin Panel Component
import UserPage from "./components/UserPage"; // User Page Component
import BlogDetail from "./components/BlogDetail";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/user-page" element={<UserPage />} />
          <Route path="/user-page" element={<UserPage />} />
          <Route path="/blog/:blogId" element={<BlogDetail />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
