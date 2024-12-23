import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, Button, Avatar } from "@mui/material";
import api from "../../api/apiClient";
import { AuthContext } from "../../context/AuthContext";
import { IUser } from "../../types/user";

const UserProfile: React.FC = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [profile, setProfile] = useState<IUser | null>(null);

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
        backgroundColor: "#1e1e1e", // Dark background color
        marginTop: "auto",
        gap: "10px",
        flexWrap: "wrap",
        color: "#ffffff", // White text color
      }}
    >
      <Avatar
        sx={{
          bgcolor: "#3f51b5", // Avatar background color
          color: "#fff", // Avatar text color
        }}
      >
        {profile.email.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 500, color: "#ffffff" }}>
          {profile.email}
        </Typography>
        <Typography variant="body2" sx={{ color: "#a6a6a6" }}>
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
            backgroundColor: "rgba(244, 67, 54, 0.2)", // Slightly darker red hover
          },
        }}
      >
        Sign Out
      </Button>
    </Box>
  ) : null;
};

export default UserProfile;
