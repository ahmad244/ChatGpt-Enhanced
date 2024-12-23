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
import RichTextRenderer from "../../common/RichTextRenderer";
import { fetchModels } from "../../../api/modelService";
import { IModel } from "../../../types/model";
import { IMessage } from "../../../types/message";
import ModelManagement from "./ModelManagement";

interface ChatWindowProps {
  messages: IMessage[];
  message: string;
  setMessage: (msg: string) => void;
  sendMessage: () => Promise<void>;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  deleteConversation: () => void;
  toggleSidebar: () => void; // Toggle sidebar callback
}
const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
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

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const getModels = async () => {
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
    if (e.key === "Enter" && !e.shiftKey) {
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
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
        p: 3,
        backgroundColor: "#121212", // Dark background
        color: "#ffffff", // White text color
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <Button
          variant="text"
          color="primary"
          sx={{
            display: { xs: "block", sm: "none" },
            minWidth: "auto",
            padding: "10px",
            justifyContent: "center",
          }}
          onClick={toggleSidebar}
        >
          <MenuIcon />
        </Button>

        <ModelManagement />

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
            Delete
          </Button>
        )}
      </Box>

      {/* Messages List */}
      <List
        sx={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: "#1e1e1e",
          borderRadius: "8px",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.length === 0 ? (
          <Typography
            variant="h6"
            sx={{ textAlign: "center", marginTop: "20px", color: "#a6a6a6" }}
          >
            Start your conversation by sending a message.
          </Typography>
        ) : (
          messages.map((msg, i) => (
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
                  backgroundColor: msg.role === "user" ? "#1db954" : "#333333",
                  borderRadius: "10px",
                  wordWrap: "break-word",
                  color: "#ffffff",
                }}
              >
                <Typography variant="body2" sx={{ color: "#a6a6a6" }}>
                  {msg.role}
                </Typography>
                <RichTextRenderer content={msg.content} />
                {msg.role === "assistant" && msg.modelType && (
                  <Typography
                    variant="caption"
                    sx={{
                      marginTop: "5px",
                      display: "block",
                      color: "#a6a6a6",
                    }}
                  >
                    Model: {msg.modelType}
                  </Typography>
                )}
              </Box>
            </Box>
          ))
        )}
        <div ref={bottomRef}></div>
      </List>

      {/* Message Input */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          inputRef={textFieldRef}
          sx={{
            marginRight: "10px",
            backgroundColor: "#1e1e1e",
            borderRadius: "5px",
            "& .MuiOutlinedInput-root": {
              color: "#ffffff",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#444",
            },
          }}
          multiline
          rows={Math.min(message.split("\n").length + 1, 5)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={loading || !message.trim()}
          sx={{
            display: "flex",
            alignItems: "center",
            minWidth: "100px",
            backgroundColor: "#1db954",
            "&:hover": {
              backgroundColor: "#17a74a",
            },
          }}
        >
          {loading ? <CircularProgress size={24} /> : "Send"}
        </Button>
      </Box>
    </Box>
  );
};

export default ChatWindow;
