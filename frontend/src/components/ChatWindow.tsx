import React, { useEffect, useRef, useState, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  CircularProgress,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import RichTextRenderer from "./RichTextRenderer";
import { fetchModels } from "../api/modelService";
import { IModel } from "../types/model";
import { AuthContext } from "../context/AuthContext";

interface ChatWindowProps {
  conversation: any[];
  message: string;
  setMessage: (msg: string) => void;
  sendMessage: () => Promise<void>;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  deleteConversation: () => void;
  toggleSidebar: () => void; // Toggle sidebar callback
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  message,
  setMessage,
  sendMessage,
  selectedModel,
  setSelectedModel,
  deleteConversation,
  toggleSidebar,
}) => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<IModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textFieldRef = useRef<HTMLInputElement | null>(null);
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  useEffect(() => {
    const getModels = async () => {
      console.log("Fetching models...");
      try {
        const fetchedModels = await fetchModels();
        const enabledModels = fetchedModels.filter((model) => model.enabled);
        setModels(enabledModels);
        if (!selectedModel && enabledModels.length > 0) {
          setSelectedModel(enabledModels[0].value);
        }
      } catch (error) {
        setModelsError("Failed to load models.");
      } finally {
        setModelsLoading(false);
      }
    };

    getModels();
  }, [selectedModel, setSelectedModel]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (message.trim() && !loading) {
        setLoading(true);
        await sendMessage();
        setLoading(false);
        textFieldRef.current?.focus();
      }
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() && !loading) {
      setLoading(true);
      await sendMessage();
      setLoading(false);
      textFieldRef.current?.focus();
    }
  };

  return (
    <Box
      sx={{
      overflowY: "auto",
      height: "100%",
      flex: 1,
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      maxHeight: "97vh", // Ensure the component does not stretch the screen
      boxSizing: "border-box", // Include padding and border in the element's total width and height
      }}
    >
      <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
      }}
      >
      {/* Menu button for mobile */}
      <Button
        variant="text"
        color="primary"
        sx={{
        display: { xs: "block", sm: "none" }, // Show only on small screens
        minWidth: "auto", // Minimal width for the icon
        padding: "10px", // Add padding around the icon
        justifyContent: "center", // Center the icon
        }}
        onClick={toggleSidebar}
      >
        <MenuIcon />
      </Button>

      <Typography
        variant="h5"
        sx={{
        display: { xs: "none", sm: "block" }, // Hide on small screens
        }}
      >
        Chat
      </Typography>
      <Box sx={{ minWidth: "200px" }}>
        {modelsLoading ? (
        <CircularProgress size={24} />
        ) : modelsError ? (
        <Typography color="error">{modelsError}</Typography>
        ) : models.length === 0 ? (
        <Typography color="textSecondary">No models available.</Typography>
        ) : (
        <Select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          sx={{ minWidth: "200px" }}
        >
          {models.map((model) => (
          <MenuItem key={model._id} value={model.value}>
            <Tooltip
            title={model.description || "No description available."}
            arrow
            >
            <span>{model.name}</span>
            </Tooltip>
          </MenuItem>
          ))}
        </Select>
        )}
      </Box>
      {deleteConversation && (
        <Button
        variant="text"
        size="small"
        onClick={deleteConversation}
        sx={{
          textTransform: "none",
          color: "#f44336",
          p: 1,
          fontWeight: 500,
          "&:hover": {
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          },
        }}
        >
        Delete Conversation
        </Button>
      )}
      </Box>

      <List
    sx={{
    flex: 1,
    overflowY: "auto",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    marginBottom: "10px",
    display: "flex",
    flexDirection: "column",
    }}
  >
    {conversation.length === 0 ? (
    <Typography
      variant="h6"
      sx={{ textAlign: "center", marginTop: "20px" }}
    >
      Start your conversation by sending a message.
    </Typography>
    ) : (
    conversation.map((msg, i) =>
      msg && msg.role && msg.content ? (
      <Box
        key={i}
        sx={{
        display: "flex",
        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
        marginBottom: "8px",
        }}
      >
        <Box
        sx={{
          maxWidth: "75%",
          padding: "10px",
          backgroundColor:
          msg.role === "user" ? "#e0f7fa" : "#f9f9f9",
          borderRadius: "10px",
          wordWrap: "break-word",
        }}
        >
        <Typography variant="body2" color="textSecondary">
          {msg.role}
        </Typography>
        <RichTextRenderer content={msg.content} />
        {msg.role === "assistant" && msg.modelType && (
          <Typography
          variant="caption"
          color="textSecondary"
          sx={{ marginTop: "5px", display: "block" }}
          >
          {msg.modelType}
          </Typography>
        )}
        </Box>
      </Box>
      ) : null
    )
    )}
    <div ref={bottomRef}></div>
  </List>

      <Box sx={{ display: "flex", alignItems: "center" }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        inputRef={textFieldRef}
        sx={{ marginRight: "10px" }}
        disabled={loading}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSendMessage}
        disabled={loading || !message.trim()}
        sx={{ display: "flex", alignItems: "center", minWidth: "100px" }}
      >
        {loading ? <CircularProgress size={24} /> : "Send"}
      </Button>
      </Box>
    </Box>
  );
};

export default ChatWindow;
