import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import PrivateRoute from "./PrivateRoute";
import Habits from "./pages/Habits";
import GitGoals from "./pages/GitGoals";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import Home from "./pages/Home";

function AllRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute element={<Home />} />} />
      <Route
        path="/auth/signup"
        element={<ProtectedRoute element={<Signup />} />}
      />
      <Route
        path="/auth/signin"
        element={<ProtectedRoute element={<Signin />} />}
      />
      <Route
        path="/dashboard"
        element={<PrivateRoute element={<Dashboard />} />}
      />
      <Route path="/habits" element={<PrivateRoute element={<Habits />} />} />
      <Route
        path="/git-goals"
        element={<PrivateRoute element={<GitGoals />} />}
      />
      <Route
        path="/journals"
        element={<PrivateRoute element={<Journal />} />}
      />
      <Route
        path="/settings"
        element={<PrivateRoute element={<Settings />} />}
      />
    </Routes>
  );
}

export default AllRoutes;
