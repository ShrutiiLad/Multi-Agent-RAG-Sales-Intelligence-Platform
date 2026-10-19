import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RedirectIfAuthenticated = () => {
  const toeken = localStorage.getItem("token");
  return toeken ? <Navigate to="/dashboard" /> : <Outlet />;
};

export default RedirectIfAuthenticated;
