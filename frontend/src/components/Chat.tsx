import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import api, {
  fetchMessages,
  addMessage,
  createConversation,
  deleteConversationAPI,
} from "../api/apiClient";
import { Box, Typography, Drawer, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Chat: React.FC = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      if (!isLoggedIn) return;
      try {
        const { data } = await api.get("/conversations");
        setConversations(data);

        if (
          !conversationId &&
          data.length > 0 &&
          window.location.pathname.startsWith("/chat")
        ) {
          navigate(`/chat/${data[0].conversationId}`);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    };

    fetchConversations();
  }, [isLoggedIn, conversationId, navigate]);

  useEffect(() => {
    const fetchConversationMessages = async () => {
      if (!conversationId || !isLoggedIn) return;
      try {
        const { data } = await fetchMessages(conversationId);
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchConversationMessages();
  }, [conversationId, isLoggedIn]);

  const handleSendMessage = async () => {
    if (!isLoggedIn || !conversationId) return;
    try {
      const { data } = await addMessage(conversationId, message, selectedModel);
      setMessages([...messages, data.userMessage, data.assistantMessage]);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const createNewConversationHandler = async () => {
    try {
      const { data } = await createConversation();
      setConversations([...conversations, data]);

      // Navigate using the correct `conversationId`
      navigate(`/chat/${data.conversationId}`);
    } catch (error) {
      console.error("Failed to create new conversation:", error);
    }
  };

  const deleteConversation = async () => {
    if (!conversationId || !isLoggedIn) return;
    try {
      await deleteConversationAPI(conversationId);
      const updatedConversations = conversations.filter(
        (c) => c.conversationId !== conversationId
      );
      setConversations(updatedConversations);

      if (updatedConversations.length > 0) {
        navigate(`/chat/${updatedConversations[0].conversationId}`);
      } else {
        navigate("/");
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  // Find the current conversation's title
  const currentConversation = conversations.find(
    (c) => c.conversationId === conversationId
  );
  const conversationTitle = currentConversation?.title || "Chat";

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "96vh" }}>
      {/* Header for mobile */}
      {!conversationId && (
        <Box
          sx={{
            display: { xs: "flex", sm: "none" }, // Show only on small screens
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            padding: "10px",
            borderBottom: "1px solid #ccc",
          }}
        >
          <Button
            variant="text"
            color="primary"
            onClick={() => setIsSidebarOpen(true)}
            sx={{
              minWidth: "auto", // Minimal width for the icon
              padding: "10px", // Add padding around the icon
              justifyContent: "center", // Center the icon
            }}
          >
            <MenuIcon />
          </Button>
       
        </Box>
      )}

      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Drawer for mobile */}
        <Drawer
          variant="temporary"
          open={isSidebarOpen}
          onClose={closeSidebar}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: "340px" },
          }}
        >
          <Sidebar
            conversations={conversations}
            createNewConversation={createNewConversationHandler}
            closeSidebar={closeSidebar} // Pass the closeSidebar prop
          />
        </Drawer>

        {/* Permanent sidebar for larger screens */}
        <Box
          sx={{
            display: { xs: "none", sm: "block" },
          }}
        >
          <Sidebar
            conversations={conversations}
            createNewConversation={createNewConversationHandler}
            closeSidebar={closeSidebar} // Pass the closeSidebar prop
          />
        </Box>

        {conversationId ? (
          <ChatWindow
            conversation={messages}
            message={message}
            setMessage={setMessage}
            sendMessage={handleSendMessage}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            deleteConversation={deleteConversation}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} // Pass toggle handler
          />
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" color="textSecondary" sx={{ marginTop: "20px",p:4 }}>
              Select a conversation or create a new one to start chatting.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chat;
