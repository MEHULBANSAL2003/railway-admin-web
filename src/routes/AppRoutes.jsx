import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";
import MainLayout from "../layout/MainLayout.jsx";
import CreateAdmin from "../pages/createAdmin/CreateAdmin.jsx";


const Login = lazy(() => import('../pages/LoginPage/Login.jsx'));
const Dashboard = lazy(() => import('../pages/DashBoard/DashBoard.jsx'));
const StationManagement = lazy(() => import('../pages/stationManagement/StationList.jsx'));

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path='admin/create' element={<CreateAdmin/>}/>
        <Route path='/admin/stations' element={<StationManagement/>} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
