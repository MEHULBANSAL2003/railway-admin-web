import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';


const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          // <PublicRoute>
          //   <Login />
          // </PublicRoute>
        }
      />
    </Routes>
  )
}
