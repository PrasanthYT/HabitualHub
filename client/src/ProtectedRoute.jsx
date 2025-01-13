import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element }) => {
  // Check if the token exists in sessionStorage
  const token = sessionStorage.getItem('_token');

  // If token exists, redirect to dashboard, else allow access to the page
  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return element;
};

export default ProtectedRoute;
