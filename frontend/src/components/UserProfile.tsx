import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, Button, Avatar } from "@mui/material";
import api from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";

const UserProfile: React.FC = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [profile, setProfile] = useState<any>(null);

  // Fetch user profile
  useEffect(() => {
    if (isLoggedIn) {
      api
        .get("/users/me")
        .then((res) => setProfile(res.data))
        .catch((error) => console.error("Fetching profile failed:", error));
    }
  }, [isLoggedIn]);

  // Handle sign-out
  const handleSignOut = async () => {
    try {
      await api.post("/auth/logout"); // Call logout endpoint
      window.location.href = "/login"; // Redirect to login
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  };

  return profile ? (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "10px",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
        marginTop: "auto",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <Avatar sx={{ bgcolor: "#3f51b5", color: "#fff" }}>
        {profile.email.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {profile.email}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {profile.role}
        </Typography>
      </Box>
      <Button
        variant="text"
        size="small"
        onClick={handleSignOut}
        sx={{
          textTransform: "none",
          color: "#f44336",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "rgba(244, 67, 54, 0.1)",
          },
        }}
      >
        Sign Out
      </Button>
    </Box>
  ) : null;
};

export default UserProfile;
