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

interface SidebarProps {
  conversations: any[];
  createNewConversation: () => void;
  closeSidebar: () => void; // Add closeSidebar prop
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  createNewConversation,
  closeSidebar, // Destructure closeSidebar
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
        width: { sm: "300px" },
        height: "100%",
        borderRight: "1px solid #ccc",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography variant="h6" gutterBottom>
          Conversations
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            createNewConversation();
            closeSidebar(); // Optionally close after creating a conversation
          }}
          sx={{ marginTop: "10px", width: "100%" }}
        >
          New Conversation
        </Button>
        <List>
          {conversations.map((conv) => (
            <ListItem
              key={conv._id}
              onClick={() => handleConversationClick(conv._id)}
              sx={{
                cursor: "pointer",
                backgroundColor:
                  conversationId === conv._id ? "#f0f0f0" : "inherit",
                borderRadius: "5px",
                marginBottom: "5px",
              }}
            >
              <ListItemText primary={`Conversation ${conv.title}`} />
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ marginY: 2 }} />
      <UserProfile />
    </Box>
  );
};

export default Sidebar;
