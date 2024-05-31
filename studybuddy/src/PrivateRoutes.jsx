// PrivateRoutes.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoutes = () => {
  const { auth } = useAuth();
  console.log(localStorage.getItem("userName"));
  if (localStorage.getItem("userName") === null) {
    
    return  <Navigate to="/login" />
  }


  console.log('Authentication token:', auth.token); // Log the auth status for debugging

  return <Outlet />;
};

export default PrivateRoutes;
