import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import api from "../../../api/apiClient";
import { AuthContext } from "../../../context/AuthContext";
import { IModel } from "../../../types/model";
const ModelManagement: React.FC<{ selectedModel: string; setSelectedModel: (model: string) => void }> = ({
  selectedModel,
  setSelectedModel,
}) => {
  const { isLoggedIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<IModel[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      api
        .get("/models")
        .then((res) => {
          setModels(res.data);
          if (res.data.length > 0) {
            setSelectedModel(res.data[0].value); // Set the first model as default
          }
        })
        .catch((error) => setError("Failed to fetch models."))
        .finally(() => setLoading(false));
    }
  }, [isLoggedIn]);

  return (
    <Box
    id="model-management"
      sx={{
        minWidth:"170px",
        borderRadius: "8px",
        maxWidth: "600px",
      }}
    >
      {loading ? (
        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="body1" color="error" sx={{ textAlign: "center" }}>
          {error}
        </Typography>
      ) : models.length > 0 ? (
        <Box>
         
          <Select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            sx={{
              width: "100%",
              backgroundColor: "#1e1e1e", // Dark background color
              color: "#ffffff", // White text color
              borderRadius: "5px", // Rounded corners
              px:2,
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none", // Remove the border
              },
              "& .MuiSelect-icon": {
                color: "#ffffff", // Dropdown icon color
              },
              "&:hover": {
                backgroundColor: "#333333", // Slightly lighter background on hover
              },
              "& .MuiMenuItem-root": {
                backgroundColor: "#1e1e1e", // Dark background for dropdown items
                "&:hover": {
                  backgroundColor: "#333333", // Highlight color on hover
                },
              },
            }}
          >
            {models.map((model) => (
              <MenuItem
                key={model._id}
                value={model.value}
                sx={{
                  color: "#ffffff", // Text color
                  backgroundColor: "#1e1e1e", // Background for items
                  "&:hover": {
                    backgroundColor: "#333333", // Highlight on hover
                  },
                }}
              >
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      ) : (
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ textAlign: "center", marginTop: "20px" }}
        >
          No models available.
        </Typography>
      )}
    </Box>
  );
};

export default ModelManagement;
