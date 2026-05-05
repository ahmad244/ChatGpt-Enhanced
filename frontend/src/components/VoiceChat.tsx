import React, { useState, useEffect, useRef } from "react";

import { Socket } from "socket.io-client";
import io from "socket.io-client";

import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Fab,
  Tooltip,
  Zoom,
  Badge,
} from "@mui/material";

import MicIcon from "@mui/icons-material/Mic";

import StopIcon from "@mui/icons-material/Stop";

import VolumeUpIcon from "@mui/icons-material/VolumeUp";

import { VoiceResponseData, VoiceErrorData } from "../types";

interface VoiceChatProps {
  userId: string;

  conversationId: string;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ userId, conversationId }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [transcript, setTranscript] = useState<string>("");

  const [response, setResponse] = useState<string>("");

  const [audioResponse, setAudioResponse] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const audioChunksRef = useRef<Blob[]>([]);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Connect to the socket server

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    socketRef.current = io(`${apiUrl}/voice-chat`);

    // Set up socket event listeners

    socketRef.current.on("voice-response", handleVoiceResponse);

    socketRef.current.on("voice-error", handleVoiceError);

    // Cleanup on unmount

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleVoiceResponse = (data: VoiceResponseData) => {
    setIsProcessing(false);

    setTranscript(data.transcribedText);

    setResponse(data.responseText);

    setAudioResponse(data.audioResponse);

    // Auto-play the audio response

    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = data.audioResponse;

      audioPlayerRef.current
        .play()
        .catch((err) => console.error("Error playing audio:", err));
    }
  };

  const handleVoiceError = (error: VoiceErrorData) => {
    setIsProcessing(false);

    setError(error.message || "An error occurred during voice processing");

    console.error("Voice chat error:", error);
  };

  const startRecording = async (): Promise<void> => {
    try {
      setIsRecording(true);

      setError(null);

      // Reset previous data

      audioChunksRef.current = [];

      // Request microphone access

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create media recorder

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      // Set up event handlers

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Convert to base64

        const reader = new FileReader();

        reader.readAsDataURL(audioBlob);

        reader.onloadend = () => {
          const base64Audio = reader.result as string;

          // Send audio data to server via socket

          if (socketRef.current) {
            socketRef.current.emit("stream-start", { userId, conversationId });

            socketRef.current.emit("audio-chunk", {
              audioChunk: base64Audio,

              userId,

              conversationId,

              isLastChunk: true,
            });

            setIsProcessing(true);
          }
        };
      };

      // Start recording

      mediaRecorderRef.current.start();

      // Notify server that we're starting a stream

      if (socketRef.current) {
        socketRef.current.emit("stream-start", { userId, conversationId });
      }
    } catch (error) {
      console.error("Failed to start recording:", error);

      setError(
        "Could not access microphone. Please ensure you have granted permission."
      );

      setIsRecording(false);
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      setIsRecording(false);

      // Stop all audio tracks

      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getAudioTracks()
          .forEach((track) => track.stop());
      }
    }
  };

  const playResponse = (): void => {
    if (audioPlayerRef.current && audioResponse) {
      audioPlayerRef.current
        .play()
        .catch((err) => console.error("Error playing audio:", err));
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",

        bottom: 20,

        right: 20,

        display: "flex",

        flexDirection: "column",

        alignItems: "flex-end",

        gap: 2,

        zIndex: 1000,
      }}
    >
      {/* Error Message */}

      {error && (
        <Paper
          sx={{
            p: 1,

            backgroundColor: "error.main",

            color: "error.contrastText",

            maxWidth: 200,
          }}
        >
          <Typography variant="caption">{error}</Typography>
        </Paper>
      )}

      {/* Processing Status */}

      {isProcessing && (
        <Paper
          sx={{
            p: 1,

            backgroundColor: "primary.dark",

            color: "primary.contrastText",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={16} color="inherit" />

            <Typography variant="caption">Processing voice...</Typography>
          </Box>
        </Paper>
      )}

      {/* Last Transcript */}

      {transcript && !isProcessing && !isRecording && (
        <Zoom in={true}>
          <Paper
            sx={{
              p: 1,

              backgroundColor: "background.paper",

              maxWidth: 200,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Last transcript: {transcript}
            </Typography>
          </Paper>
        </Zoom>
      )}

      {/* Main Recording Button */}

      <Tooltip
        title={isRecording ? "Stop Recording" : "Start Voice Chat"}
        placement="left"
      >
        <Badge color="error" variant="dot" invisible={!isRecording}>
          <Fab
            color={isRecording ? "secondary" : "primary"}
            onClick={isRecording ? stopRecording : startRecording}
            sx={{
              width: 56,

              height: 56,

              boxShadow: 3,

              "&:hover": {
                transform: "scale(1.1)",

                transition: "transform 0.2s",
              },
            }}
          >
            {isRecording ? (
              <StopIcon />
            ) : isProcessing ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <MicIcon />
            )}
          </Fab>
        </Badge>
      </Tooltip>

      {/* Audio Player (hidden but functional) */}

      <audio ref={audioPlayerRef} style={{ display: "none" }} />
    </Box>
  );
};

export default VoiceChat;
