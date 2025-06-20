import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext'; // Import AuthProvider and AuthContext
import { useContext } from 'react';
import './App.css';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import Dashboard from './components/Dashboard'; // Fixed typo in import (dashboard to Dashboard)

// ProtectedRoute for authenticated users only
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>; // Show loading state while checking auth
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// PublicRoute for non-authenticated users only
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <AuthContext.Consumer>
                {({ isAuthenticated, loading }) =>
                  loading ? (
                    <div>Loading...</div>
                  ) : isAuthenticated ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              </AuthContext.Consumer>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;