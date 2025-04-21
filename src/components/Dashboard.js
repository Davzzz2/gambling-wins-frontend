import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tab,
  Tabs,
  AppBar,
  Toolbar,
  Avatar,
  createTheme,
  ThemeProvider,
  CssBaseline,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSnackbar } from 'notistack';
import Win from './Win';
import DeleteIcon from '@mui/icons-material/Delete';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor to handle authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const theme = createTheme({
  typography: {
    fontFamily: "'Montserrat', Arial, sans-serif",
    h4: {
      fontWeight: 800,
    },
    h6: {
      fontWeight: 600,
    }
  },
  palette: {
    mode: 'dark',
    background: {
      default: 'hsl(220, 100%, 1%)',
      paper: 'hsl(220, 70%, 12%)',
    },
    primary: {
      main: 'hsl(220, 73%, 63%)',
      contrastText: 'hsl(220, 89%, 99%)',
    },
    secondary: {
      main: 'hsl(220, 51%, 36%)',
      contrastText: 'hsl(220, 100%, 97%)',
    },
    text: {
      primary: 'hsl(220, 100%, 97%)',
      secondary: 'hsl(220, 51%, 36%)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 20%, hsla(220, 73%, 63%, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, hsla(220, 73%, 63%, 0.3) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
            zIndex: 0,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'hsla(220, 70%, 12%, 0.8)',
          borderColor: 'hsl(220, 51%, 36%)',
          borderWidth: 1,
          borderStyle: 'solid',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'hsla(220, 70%, 12%, 0.8)',
          borderBottom: '1px solid hsl(220, 51%, 36%)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [wins, setWins] = useState([]);
  const [communityWins, setCommunityWins] = useState([]);
  const [pendingWins, setPendingWins] = useState([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    image: null,
  });
  const [currentTab, setCurrentTab] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [isEnjayyWin, setIsEnjayyWin] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [kickClipUrl, setKickClipUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchWins();
    fetchCommunityWins();
    fetchPendingWins();
  }, [navigate]);

  const fetchWins = async () => {
    try {
      const response = await api.get('/api/wins', {
        params: { type: 'enjayy' }
      });
      setWins(response.data);
    } catch (error) {
      console.error('Error fetching wins:', error);
    }
  };

  const fetchCommunityWins = async () => {
    try {
      const response = await api.get('/api/wins', {
        params: { type: 'community' }
      });
      setCommunityWins(response.data);
    } catch (error) {
      console.error('Error fetching community wins:', error);
    }
  };

  const fetchPendingWins = async () => {
    try {
      const response = await api.get('/api/wins/pending');
      setPendingWins(response.data);
    } catch (error) {
      console.error('Error fetching pending wins:', error);
    }
  };

  const handleOpenUploadDialog = () => {
    setIsUploadDialogOpen(true);
  };

  const handleCloseUploadDialog = () => {
    setIsUploadDialogOpen(false);
    setUploadForm({ title: '', description: '', image: null });
    setImagePreview(null);
  };

  const handleUploadFormChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      setUploadForm({ ...uploadForm, image: file });
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      if (file) {
        reader.readAsDataURL(file);
      }
    } else {
      setUploadForm({ ...uploadForm, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      enqueueSnackbar('Please select an image', { variant: 'error' });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', selectedFile);
    formData.append('isEnjayyWin', isEnjayyWin.toString());
    formData.append('kickClipUrl', kickClipUrl);

    try {
      const response = await api.post('/api/wins', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setTitle('');
        setDescription('');
        setKickClipUrl('');
        setSelectedFile(null);
        setIsEnjayyWin(false);
        setIsUploadDialogOpen(false);
        // Refresh both wins and pending wins
        fetchWins();
        fetchCommunityWins();
        fetchPendingWins();
        enqueueSnackbar('Win uploaded successfully!', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error uploading win:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error uploading win', { variant: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (winId) => {
    try {
      const response = await api.delete(`/api/wins/${winId}`);
      if (response.status === 200) {
        enqueueSnackbar('Win deleted successfully', { variant: 'success' });
        fetchWins();
        fetchCommunityWins();
        fetchPendingWins();
      } else {
        throw new Error('Failed to delete win');
      }
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error deleting win', { variant: 'error' });
    }
  };

  const handleModerateWin = async (winId, status) => {
    try {
      await api.put(`/api/wins/${winId}/moderate`, {
        status,
        moderationComment: status === 'approved' ? 'Approved by admin' : 'Rejected by admin'
      });
      fetchPendingWins();
      fetchWins();
      fetchCommunityWins();
    } catch (error) {
      console.error('Error moderating win:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', position: 'relative' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }} /> {/* Spacer */}
            <Box sx={{ textAlign: 'center', flex: 2 }}>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  color: 'primary.contrastText',
                  fontWeight: 800,
                  textShadow: '0 0 15px hsla(220, 73%, 63%, 0.8)',
                }}
              >
                Admin Dashboard
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                color="inherit"
                component={Link}
                to="/"
                sx={{
                  fontWeight: 600,
                  borderRadius: 'var(--radius)',
                  border: '2px solid',
                  borderColor: 'secondary.main',
                  px: 2,
                  py: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 20px hsla(220, 73%, 63%, 0.5)',
                  },
                }}
              >
                Back to Home
              </Button>
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  fontWeight: 600,
                  borderRadius: 'var(--radius)',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  px: 2,
                  py: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 20px hsla(220, 73%, 63%, 0.5)',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            centered
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
                boxShadow: '0 0 10px hsla(220, 73%, 63%, 0.8)',
              },
              '& .MuiTab-root': {
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: 'primary.main',
                  textShadow: '0 0 10px hsla(220, 73%, 63%, 0.5)',
                },
                '&:hover': {
                  color: 'primary.main',
                  textShadow: '0 0 10px hsla(220, 73%, 63%, 0.5)',
                },
              },
            }}
          >
            <Tab label="Enjayy's Wins" />
            <Tab label="Community Wins" />
            <Tab label="Pending Approvals" />
          </Tabs>
        </AppBar>

        <Container sx={{ mt: 4, position: 'relative', zIndex: 1 }}>
          {currentTab === 0 && (
            <>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{
                    color: 'primary.contrastText',
                    textShadow: '0 0 15px hsla(220, 73%, 63%, 0.8)',
                    fontWeight: 800,
                  }}
                >
                  Enjayy's Wins
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenUploadDialog}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 'var(--radius)',
                    px: 3,
                    py: 1.5,
                    backgroundColor: 'hsla(220, 73%, 63%, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'hsla(220, 73%, 63%, 0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 0 20px hsla(220, 73%, 63%, 0.5)',
                    },
                  }}
                >
                  Add New Win
                </Button>
              </Box>
              <Grid container spacing={3}>
                {wins.map((win) => (
                  <Grid item xs={12} sm={6} md={4} key={win._id}>
                    <Box sx={{ position: 'relative' }}>
                      <IconButton
                        onClick={() => handleDelete(win._id)}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          zIndex: 1,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <Card 
                        sx={{ 
                          height: '100%',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 0 30px hsla(220, 73%, 63%, 0.3)',
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={`http://localhost:5000${win.imageUrl}`}
                          alt={win.title}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent>
                          <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{
                              color: 'primary.contrastText',
                              textShadow: '0 0 10px hsla(220, 73%, 63%, 0.5)',
                            }}
                          >
                            {win.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              textShadow: '0 0 5px hsla(220, 73%, 63%, 0.3)',
                            }}
                          >
                            {win.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          {currentTab === 1 && (
            <>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{
                    color: 'primary.contrastText',
                    textShadow: '0 0 15px hsla(220, 73%, 63%, 0.8)',
                    fontWeight: 800,
                  }}
                >
                  Community Wins
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenUploadDialog}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 'var(--radius)',
                    px: 3,
                    py: 1.5,
                    backgroundColor: 'hsla(220, 73%, 63%, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'hsla(220, 73%, 63%, 0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 0 20px hsla(220, 73%, 63%, 0.5)',
                    },
                  }}
                >
                  Add New Win
                </Button>
              </Box>
              <Grid container spacing={3}>
                {communityWins.map((win) => (
                  <Grid item xs={12} sm={6} md={4} key={win._id}>
                    <Box sx={{ position: 'relative' }}>
                      <IconButton
                        onClick={() => handleDelete(win._id)}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          zIndex: 1,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <Card 
                        sx={{ 
                          height: '100%',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 0 30px hsla(220, 73%, 63%, 0.3)',
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={`http://localhost:5000${win.imageUrl}`}
                          alt={win.title}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent>
                          <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{
                              color: 'primary.contrastText',
                              textShadow: '0 0 10px hsla(220, 73%, 63%, 0.5)',
                            }}
                          >
                            {win.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              textShadow: '0 0 5px hsla(220, 73%, 63%, 0.3)',
                            }}
                          >
                            {win.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          {currentTab === 2 && (
            <>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 4,
                  color: 'primary.contrastText',
                  textShadow: '0 0 15px hsla(220, 73%, 63%, 0.8)',
                  fontWeight: 800,
                }}
              >
                Pending Approvals
              </Typography>
              <Grid container spacing={3}>
                {pendingWins.map((win) => (
                  <Grid item xs={12} sm={6} md={4} key={win._id}>
                    <Win
                      win={win}
                      onApprove={() => handleModerateWin(win._id, 'approved')}
                      onReject={() => handleModerateWin(win._id, 'rejected')}
                      isPending
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Container>

        <Dialog
          open={isUploadDialogOpen}
          onClose={handleCloseUploadDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              boxShadow: '0 0 30px hsla(220, 73%, 63%, 0.3)',
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography 
                variant="h6"
                sx={{
                  color: 'primary.contrastText',
                  textShadow: '0 0 10px hsla(220, 73%, 63%, 0.5)',
                }}
              >
                Upload New Win
              </Typography>
              <IconButton 
                onClick={handleCloseUploadDialog}
                sx={{ 
                  color: 'primary.contrastText',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'primary.main',
                    transform: 'rotate(90deg)',
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isEnjayyWin}
                    onChange={(e) => setIsEnjayyWin(e.target.checked)}
                    color="primary"
                  />
                }
                label="Post to Enjayy's Wins"
                sx={{ mb: 2, color: theme.palette.text.primary }}
              />
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Kick Clip URL (Optional)"
                value={kickClipUrl}
                onChange={(e) => setKickClipUrl(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="https://kick.com/video/..."
              />
              <input
                accept="image/*"
                id="image-upload"
                type="file"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {selectedFile ? selectedFile.name : 'Select Image'}
                </Button>
              </label>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Uploading...
                  </>
                ) : (
                  'Upload Win'
                )}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard; 