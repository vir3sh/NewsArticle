import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import AdminPanel from "./components/AdminPanel"; // Admin Panel Component
import UserPage from "./components/UserPage"; // User Page Component
import BlogDetail from "./components/BlogDetail";
import Navbar from "./components/Navbar";
import UserProfile from "./components/UserProfile";
import FavouriteBlogs from "./components/FavouriteBlogs";
import CommentsPage from "./components/CommentsPage";
// import AllCommentsPage from "./components/AllCommentsPage";
function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/user-page" element={<UserPage />} />
          <Route path="/blog/:blogId" element={<BlogDetail />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/favourites" element={<FavouriteBlogs />} />
          {/* <Route path="/blogs/:blogId/comments" element={<CommentsPage />} /> */}
          <Route path="/comments" element={<CommentsPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
