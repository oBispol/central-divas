import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FeedDoDia from './pages/FeedDoDia';
import MinhasTarefas from './pages/MinhasTarefas';
import Perfil from './pages/Perfil';
import Participantes from './pages/Participantes';
import Posts from './pages/Posts';
import Tarefas from './pages/Tarefas';
import Relatorios from './pages/Relatorios';
import Avisos from './pages/Avisos';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, requireAdmin = false, requireSuperAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && user.tipo !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && user.tipo === 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-nude-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/cadastro" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="feed-do-dia" element={<FeedDoDia />} />
        <Route path="minhas-tarefas" element={<MinhasTarefas />} />
        <Route path="perfil" element={<Perfil />} />

        <Route path="participantes" element={<ProtectedRoute requireAdmin><Participantes /></ProtectedRoute>} />
        <Route path="posts" element={<ProtectedRoute requireAdmin><Posts /></ProtectedRoute>} />
        <Route path="tarefas" element={<ProtectedRoute requireAdmin><Tarefas /></ProtectedRoute>} />
        <Route path="relatorios" element={<ProtectedRoute requireAdmin><Relatorios /></ProtectedRoute>} />
        <Route path="avisos" element={<ProtectedRoute requireAdmin><Avisos /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
