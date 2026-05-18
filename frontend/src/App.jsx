import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

const ProtectedRoute = ({ children, requireAdmin }) => {
    const { session } = useAuth();

    if (!session) {
        return <Navigate to="/" replace />;
    }

    if (requireAdmin) {
        const isAdmin = session.groups.includes('admin') || session.groups.includes('master_admin');
        if (!isAdmin) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

const AppRoutes = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute requireAdmin={false}><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </Router>
);

const App = () => {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
};

export default App;