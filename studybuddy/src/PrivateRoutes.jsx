// PrivateRoutes.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoutes = () => {
  const { auth } = useAuth();

  console.log('Authentication token:', auth.token); // Log the auth status for debugging

  return auth.token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
