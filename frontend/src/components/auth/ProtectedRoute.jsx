import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Protected Route component that checks if user is authenticated
 * and has required role before rendering the child component
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children The component to render if access is granted
 * @param {string[]} [props.allowedRoles] List of roles allowed to access the route
 * @returns {React.ReactNode} The protected component or redirect
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // If still loading authentication state, show nothing (or could show a spinner)
  if (loading) {
    return null;
  }
  
  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is empty, allow any authenticated user
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has one of the allowed roles
  const userRole = currentUser.role?.toLowerCase();
  const hasRequiredRole = allowedRoles.some(role => role.toLowerCase() === userRole);

  if (!hasRequiredRole) {
    // Redirect to home or unauthorized page
    return <Navigate to="/" replace />;
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
