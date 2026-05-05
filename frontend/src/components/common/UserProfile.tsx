import React, { useContext } from "react";
import { Box, Typography, Button, Avatar, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../api/apiClient";
import { AuthContext } from "../../context/AuthContext";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';

const UserProfile: React.FC = () => {
  const { isLoggedIn, userInfo, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle sign-out
  const handleSignOut = async () => {
    try {
      await api.post("/auth/logout"); // Call logout endpoint
      window.location.href = "/login"; // Redirect to login
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  };

  const navigateToAdmin = () => {
    navigate('/admin');
  };

  const navigateToHome = () => {
    navigate('/');
  };

  return userInfo ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        borderRadius: "8px",
        backgroundColor: "#1e1e1e", // Dark background color
        marginTop: "auto",
        gap: "10px",
        color: "#ffffff", // White text color
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Avatar
          sx={{
            bgcolor: "#3f51b5", // Avatar background color
            color: "#fff", // Avatar text color
          }}
        >
          {userInfo.email.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 500, color: "#ffffff" }}>
            {userInfo.email}
          </Typography>
          <Typography variant="body2" sx={{ color: "#a6a6a6" }}>
            {userInfo.role}
          </Typography>
        </Box>
      </Box>
      
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {isAdmin && (
          window.location.pathname.includes('/admin') ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={navigateToHome}
              sx={{
                textTransform: "none",
                borderColor: "#1db954",
                color: "#1db954",
                "&:hover": {
                  backgroundColor: "rgba(29, 185, 84, 0.1)",
                  borderColor: "#1db954",
                },
              }}
            >
              Back to Chat
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={navigateToAdmin}
              sx={{
                textTransform: "none",
                borderColor: "#1db954",
                color: "#1db954",
                "&:hover": {
                  backgroundColor: "rgba(29, 185, 84, 0.1)",
                  borderColor: "#1db954",
                },
              }}
            >
              Admin Panel
            </Button>
          )
        )}
        <Button
          variant="outlined"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={handleSignOut}
          sx={{
            textTransform: "none",
            borderColor: "#f44336",
            color: "#f44336",
            "&:hover": {
              backgroundColor: "rgba(244, 67, 54, 0.1)",
              borderColor: "#f44336",
            },
          }}
        >
          Sign Out
        </Button>
      </Stack>
    </Box>
  ) : null;
};

export default UserProfile;