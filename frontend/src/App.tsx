import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import Chat from './components/Chat';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectRoute from './components/RedirectRoute'; // Import the RedirectRoute
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <RedirectRoute>
                <Login />
              </RedirectRoute>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectRoute>
                <Register />
              </RedirectRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:conversationId?"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
