import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';
import MainLayout from '../layout/MainLayout.jsx';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage.jsx';

const Login = lazy(() => import('../pages/LoginPage/Login.jsx'));
const Dashboard = lazy(() => import('../pages/DashBoard/DashBoard.jsx'));
const AdminManagement = lazy(() => import('../pages/AdminManagement/AdminManagement.jsx'));
const ProfilePage = lazy(() => import('../pages/ProfilePage/ProfilePage.jsx'));
const UserInfoPage = lazy(() => import('../pages/UserInfo/UserInfoPage.jsx'));

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
        <Route path="admins" element={<AdminManagement />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="userinfo/:id" element={<UserInfoPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
