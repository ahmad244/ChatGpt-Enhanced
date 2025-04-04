import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/features/Authentication/Login";
import Register from "./components/features/Authentication/Register";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import Chat from "./components/features/Chat/Chat";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import RedirectRoute from "./components/routes/RedirectRoute";
import { AuthProvider } from "./context/AuthContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1db954" },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#fff",
      secondary: "#a6a6a6",
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
};

export default App;
