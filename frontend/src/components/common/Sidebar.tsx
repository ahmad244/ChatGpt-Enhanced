import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Box,
  Divider,
} from "@mui/material";
import UserProfile from "./UserProfile";
import { IConversation } from "../../types/conversation";

interface SidebarProps {
  conversations: IConversation[];
  createNewConversation: () => void;
  closeSidebar: () => void; // Add closeSidebar prop
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  createNewConversation,
  closeSidebar,
}) => {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();

  const handleConversationClick = (convId: string) => {
    if (conversationId === convId) {
      navigate("/");
    } else {
      navigate(`/chat/${convId}`);
    }
    closeSidebar(); // Close the sidebar after navigation
  };

  return (
    <Box
      sx={{
        backgroundColor: "#1e1e1e",
        height: "100vh", // Ensures full height of the viewport
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      {/* Header Section */}
      <Box sx={{ padding: 2 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#ffffff", fontWeight: "bold" }}
        >
          Conversations
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            createNewConversation();
            closeSidebar(); // Optionally close after creating a conversation
          }}
          sx={{
            marginTop: "10px",
            width: "100%",
            backgroundColor: "#1db954", // Match button with dark theme
            "&:hover": {
              backgroundColor: "#17a74a",
            },
          }}
        >
          New Conversation
        </Button>
      </Box>

      {/* Conversation List */}
      <Box
        sx={{
          flex: 1, // Takes up remaining space
          overflowY: "auto", // Enables scrolling for overflow content
          paddingX: 2,
          paddingBottom: 2,
        }}
      >
        <List>
          {conversations.map((conv) => (
            <ListItem
              key={conv._id}
              onClick={() => handleConversationClick(conv._id)}
              sx={{
                cursor: "pointer",
                backgroundColor:
                  conversationId === conv._id ? "#333333" : "inherit",
                borderRadius: "5px",
                marginBottom: "5px",
                "&:hover": {
                  backgroundColor: "#444444",
                },
                "&.Mui-selected": {
                  backgroundColor: "#1db954",
                  color: "#ffffff",
                },
              }}
            >
              <ListItemText
                primary={conv.title || `Conversation ${conv._id}`}
                sx={{
                  color: conversationId === conv._id ? "#ffffff" : "#a6a6a6",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Divider and User Profile */}
      <Divider sx={{ borderColor: "#444" }} />
      <Box sx={{ padding: 2 }}>
        <UserProfile />
      </Box>
    </Box>
  );
};

export default Sidebar;
