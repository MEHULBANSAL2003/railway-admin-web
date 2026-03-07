import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";
import MainLayout from "../layout/MainLayout.jsx";


const Login = lazy(() => import('../pages/LoginPage/Login.jsx'));
const Dashboard = lazy(() => import('../pages/DashBoard/DashBoard.jsx'));
const AdminManagement = lazy(() => import('../pages/AdminManagement/AdminManagement.jsx'));
const StatesCitiesManagement = lazy(() => import('../pages/StatesCitiesManagement/StatesCitiesPage.jsx'));
const StationsManagement = lazy(() => import('../pages/StationManagement/StationManagementPage.jsx'));
const TrainTypesPage = lazy(() => import('../pages/TrainTypesPage/TrainTypesPage.jsx'));
const CoachTypesPage = lazy(() => import('../pages/CoachTypePage/CoachTypesPage.jsx'));
const FareRulesPage = lazy(() => import('../pages/FareRulePage/FareRulesPage.jsx'));
const QuotasPage = lazy(() => import('../pages/QuotaPage/QuotasPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage/NotFoundPage.jsx'));
const TrainsPage = lazy(() => import('../pages/TrainPage/TrainsPage.jsx'));

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
        <Route path="/admins" element={<AdminManagement />} />
        <Route path="/states-cities" element={<StatesCitiesManagement />} />
        <Route path="/stations" element={<StationsManagement />} />
        <Route path="/train-types" element={<TrainTypesPage />} />
        <Route path="/coach-types" element={<CoachTypesPage />} />
        <Route path="/fare-rules" element={<FareRulesPage />} />
        <Route path="/quotas" element={<QuotasPage />} />
        <Route path="/trains" element={<TrainsPage />} />


        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
