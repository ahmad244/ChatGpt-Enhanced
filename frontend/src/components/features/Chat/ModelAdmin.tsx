import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Delete, Edit, Refresh } from '@mui/icons-material';
import { 
  fetchModels, 
  fetchOpenAIModels, 
  createModel, 
  updateModel, 
  deleteModel 
} from '../../../api/modelService';
import { IModel, IOpenAIModel } from '../../../types/model';

const ModelAdmin: React.FC = () => {
  const [models, setModels] = useState<IModel[]>([]);
  const [openaiModels, setOpenaiModels] = useState<IOpenAIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [openaiLoading, setOpenaiLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<IModel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    description: '',
    endpoint: '/chat/completions',
    enabled: true,
    order: 0
  });
  const [alert, setAlert] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [importModelDialog, setImportModelDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await fetchModels();
      setModels(data);
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to load models',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOpenAIModels = async () => {
    setOpenaiLoading(true);
    try {
      const data = await fetchOpenAIModels();
      setOpenaiModels(data);
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to load OpenAI models',
        severity: 'error'
      });
    } finally {
      setOpenaiLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleOpenDialog = (model?: IModel) => {
    if (model) {
      setSelectedModel(model);
      setFormData({
        name: model.name,
        value: model.value,
        description: model.description || '',
        endpoint: model.endpoint,
        enabled: model.enabled,
        order: model.order || 0
      });
    } else {
      setSelectedModel(null);
      setFormData({
        name: '',
        value: '',
        description: '',
        endpoint: '/chat/completions',
        enabled: true,
        order: models.length
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSaveModel = async () => {
    try {
      if (selectedModel) {
        await updateModel(selectedModel._id, formData);
        setAlert({
          open: true,
          message: 'Model updated successfully',
          severity: 'success'
        });
      } else {
        await createModel(formData);
        setAlert({
          open: true,
          message: 'Model created successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
      loadModels();
    } catch (error) {
      setAlert({
        open: true,
        message: 'Failed to save model',
        severity: 'error'
      });
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        await deleteModel(id);
        setAlert({
          open: true,
          message: 'Model deleted successfully',
          severity: 'success'
        });
        loadModels();
      } catch (error) {
        setAlert({
          open: true,
          message: 'Failed to delete model',
          severity: 'error'
        });
      }
    }
  };

  const handleImportDialog = () => {
    loadOpenAIModels();
    setImportModelDialog(true);
  };

  const handleImportModel = (openaiModel: IOpenAIModel) => {
    setImportModelDialog(false);
    handleOpenDialog();
    setFormData({
      name: openaiModel.id,
      value: openaiModel.id,
      description: `Model: ${openaiModel.id}, Owned by: ${openaiModel.owned_by}`,
      endpoint: '/chat/completions',
      enabled: true,
      order: models.length
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Model Administration</Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Refresh />} 
            onClick={loadModels}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />} 
            onClick={() => handleOpenDialog()}
            sx={{ mr: 1 }}
          >
            Add Model
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<Add />} 
            onClick={handleImportDialog}
          >
            Import from OpenAI
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Value (ID)</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Endpoint</TableCell>
                <TableCell>Enabled</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model._id}>
                  <TableCell>{model.order || 0}</TableCell>
                  <TableCell>{model.name}</TableCell>
                  <TableCell>{model.value}</TableCell>
                  <TableCell>{model.description}</TableCell>
                  <TableCell>{model.endpoint}</TableCell>
                  <TableCell>
                    <Switch
                      checked={model.enabled}
                      onChange={(e) => {
                        updateModel(model._id, { enabled: e.target.checked })
                          .then(() => loadModels())
                          .catch((error) => {
                            setAlert({
                              open: true,
                              message: 'Failed to update model status',
                              severity: 'error'
                            });
                          });
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(model)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteModel(model._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Model Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedModel ? 'Edit Model' : 'Add New Model'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Value (ID)"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Endpoint"
              name="endpoint"
              value={formData.endpoint}
              onChange={handleInputChange}
              fullWidth
              required
              helperText="e.g. /chat/completions or /completions"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="Order"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleInputChange}
                sx={{ width: '100px' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    name="enabled"
                    checked={formData.enabled}
                    onChange={handleInputChange}
                  />
                }
                label="Enabled"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveModel} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import from OpenAI Dialog */}
      <Dialog open={importModelDialog} onClose={() => setImportModelDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Import Model from OpenAI</DialogTitle>
        <DialogContent>
          {openaiLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TextField
                label="Search Models"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Search by name or owner..."
              />
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {openaiModels
                    .filter(model => 
                      model.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      model.owned_by.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((model) => {
                    const isAlreadyImported = models.some(m => m.value === model.id);
                    return (
                      <TableRow 
                        key={model.id}
                        sx={{
                          backgroundColor: isAlreadyImported ? 'rgba(76, 175, 80, 0.08)' : 'inherit'
                        }}
                      >
                        <TableCell>{model.id}</TableCell>
                        <TableCell>{model.owned_by}</TableCell>
                        <TableCell>{new Date(model.created * 1000).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleImportModel(model)}
                            disabled={isAlreadyImported}
                            color={isAlreadyImported ? "success" : "primary"}
                          >
                            {isAlreadyImported ? "Imported" : "Import"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {openaiModels.filter(model => 
              model.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
              model.owned_by.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
                No models found matching your search criteria.
              </Typography>
            )}
          </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setSearchTerm('');
              setImportModelDialog(false);
            }} 
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModelAdmin;