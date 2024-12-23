import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import Sidebar from "../../common/Sidebar";
import ChatWindow from "./ChatWindow";
import api, {
  fetchMessages,
  addMessage,
  createConversation,
  deleteConversationAPI,
} from "../../../api/apiClient";
import { Box, Typography, Drawer, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { IMessage } from "../../../types/message";
import { IConversation } from "../../../types/conversation";

const Chat: React.FC = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [conversations, setConversations] = useState<IConversation[]>([]);
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
        (c) => c._id !== conversationId
      );
      setConversations(updatedConversations);

      if (updatedConversations.length > 0) {
        navigate(`/chat/${updatedConversations[0]._id}`);
      } else {
        navigate("/");
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#121212", // Dark background color
        color: "#ffffff", // White text color
      }}
    >
      {/* Drawer for mobile */}
      <Drawer
        variant="temporary"
        open={isSidebarOpen}
        onClose={closeSidebar}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: "300px",
            backgroundColor: "#1e1e1e", // Sidebar background
            color: "#ffffff", // Sidebar text color
          },
        }}
      >
        <Sidebar
          conversations={conversations}
          createNewConversation={createNewConversationHandler}
          closeSidebar={closeSidebar}
        />
      </Drawer>

      {/* Permanent sidebar for larger screens */}
      <Box
        sx={{
          display: { xs: "none", sm: "block" },
          width: "300px",
          borderRight: "1px solid #333", // Subtle border
          backgroundColor: "#1e1e1e", // Sidebar background
        }}
      >
        <Sidebar
          conversations={conversations}
          createNewConversation={createNewConversationHandler}
          closeSidebar={closeSidebar}
        />
      </Box>

      {/* Main Content Area */}
      {conversationId ? (
        <ChatWindow
          messages={messages}
          message={message}
          setMessage={setMessage}
          sendMessage={handleSendMessage}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          deleteConversation={deleteConversation}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <Typography variant="h6" color="textSecondary">
            Select a conversation or create a new one to start chatting.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Chat;