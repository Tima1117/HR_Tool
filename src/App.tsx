import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import CompanySelectPage from './pages/CompanySelectPage';
import WhiteboardPage from './pages/WhiteboardPage';
import TeamPage from './pages/TeamPage';
import ArtifactPage from './pages/ArtifactPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import OBSBuilderPage from './pages/admin/OBSBuilderPage';
import AdminTeamPage from './pages/admin/AdminTeamPage';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'consultant' | 'manager' }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RoleRedirect() {
  const { currentUser, currentCompanyId } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'consultant') {
    // Consultant with multiple companies and no selected one → pick
    const hasMultiple = (currentUser.companyIds?.length ?? 0) > 1;
    if (hasMultiple && !currentCompanyId) return <Navigate to="/select-company" replace />;
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/portal" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RoleRedirect />} />

      <Route
        path="/select-company"
        element={<ProtectedRoute role="consultant"><CompanySelectPage /></ProtectedRoute>}
      />
      <Route
        path="/portal"
        element={<ProtectedRoute><WhiteboardPage /></ProtectedRoute>}
      />
      <Route
        path="/portal/:teamId"
        element={<ProtectedRoute><TeamPage /></ProtectedRoute>}
      />
      <Route
        path="/portal/:teamId/artifact/:artifactType"
        element={<ProtectedRoute><ArtifactPage /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
      />

      <Route
        path="/admin"
        element={<ProtectedRoute role="consultant"><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/admin/obs"
        element={<ProtectedRoute role="consultant"><OBSBuilderPage /></ProtectedRoute>}
      />
      <Route
        path="/admin/team/:teamId"
        element={<ProtectedRoute role="consultant"><AdminTeamPage /></ProtectedRoute>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
