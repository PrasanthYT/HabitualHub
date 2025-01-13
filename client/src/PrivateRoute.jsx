import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element }) => {
  // Check if the token exists in sessionStorage
  const token = sessionStorage.getItem("_token");

  // If no token exists, redirect to the signin page
  if (!token) {
    return <Navigate to="/auth/signin" />;
  }

  return element;
};

export default PrivateRoute;
