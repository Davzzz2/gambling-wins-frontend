import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Box,
  Dialog,
  DialogContent,
  Avatar,
  IconButton,
  DialogTitle,
  createTheme,
  ThemeProvider,
  CssBaseline,
  GlobalStyles,
  Tabs,
  Tab,
  TextField,
  DialogActions,
  Alert,
  Snackbar,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Chip,
  CircularProgress,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import Win from './Win';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import InboxIcon from '@mui/icons-material/Inbox';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { formatDistanceToNow, format } from 'date-fns';

// Backend URL for images
const BACKEND_URL = process.env.REACT_APP_API_URL;

// Helper function to get image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  return `${BACKEND_URL}${imageUrl}`;
};

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor to handle authorization silently
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Add response interceptor to handle errors silently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Create custom theme
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
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          opacity: 0,
          animation: 'fadeIn 0.5s ease-out forwards',
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
        '@keyframes fadeIn': {
          from: {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'hsla(220, 70%, 12%, 0.95)',
          borderColor: 'hsl(220, 51%, 36%)',
          borderWidth: 1,
          borderStyle: 'solid',
          backdropFilter: 'blur(20px)',
        },
      },
    },
  },
});

const Particles = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: i % 3 === 0 ? '8px' : '6px',
            height: i % 3 === 0 ? '8px' : '6px',
            background: 'radial-gradient(circle, hsla(220, 73%, 63%, 0.8) 0%, hsla(220, 73%, 63%, 0.4) 50%, transparent 100%)',
            borderRadius: '50%',
            opacity: 0.7,
            animation: `float ${7 + Math.random() * 3}s infinite ease-in-out`,
            '@keyframes float': {
              '0%': {
                transform: 'translateY(0px)',
                opacity: 1,
              },
              '50%': {
                transform: 'translateY(-500px)',
                opacity: 0.5,
              },
              '100%': {
                transform: 'translateY(0px)',
                opacity: 1,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

// Styled upload area component
const UploadArea = ({ onImageSelect, selectedImage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImageSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onImageSelect]);

  return (
    <Box
      sx={{
        width: '100%',
        height: 200,
        border: '2px dashed',
        borderColor: isDragging ? 'primary.main' : 'secondary.main',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: isDragging ? 'rgba(66, 133, 244, 0.1)' : 'transparent',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'rgba(66, 133, 244, 0.05)',
        }
      }}
      component="label"
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => onImageSelect(e.target.files[0])}
      />
      {selectedImage ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s',
              '&:hover': {
                opacity: 1,
              },
            }}
          >
            <Typography variant="body2" color="white">
              Click or drag to change image
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <CloudUploadIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
          <Typography variant="body1" color="textSecondary" align="center">
            Click or drag image to upload
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
            Supports: JPG, PNG, GIF (Max 5MB)
          </Typography>
        </>
      )}
    </Box>
  );
};

const Home = () => {
  const [wins, setWins] = useState([]);
  const [selectedWin, setSelectedWin] = useState(null);
  const [currentTab, setCurrentTab] = useState('enjayy');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    image: null,
    kickClipUrl: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [imagePreview, setImagePreview] = useState(null);
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  const menuOpen = Boolean(anchorEl);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/api/users/${authUser.username}`);
        setCurrentUser(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
        }
      }
    };

    if (authUser) {
      fetchUserData();
    }
  }, [authUser, logout]);

  const handleLogout = () => {
    logout();
    // No need to navigate since we're already on the home page
  };

  const fetchWins = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/wins', {
        params: { type: currentTab },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setWins(response.data);
    } catch (error) {
      showSnackbar('Error loading wins', 'error');
    }
  }, [currentTab]);

  useEffect(() => {
    fetchWins();
  }, [fetchWins]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (authUser && !authUser.isAdmin) {
        try {
          const token = localStorage.getItem('token');
          const response = await api.get('/api/notifications/unread/count', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUnreadCount(response.data.count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
    };

    fetchUnreadCount();
    // Poll for new notifications every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [authUser]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpenWin = (win) => {
    setSelectedWin(win);
  };

  const handleCloseWin = () => {
    setSelectedWin(null);
  };

  const handleOpenUploadDialog = () => {
    setIsUploadDialogOpen(true);
  };

  const handleCloseUploadDialog = () => {
    setIsUploadDialogOpen(false);
    setUploadForm({ title: '', description: '', image: null, kickClipUrl: '' });
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

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmitWin = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.image) {
      showSnackbar('Please select an image', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('image', uploadForm.image);
    formData.append('isEnjayyWin', 'false'); // Always false for community uploads
    formData.append('kickClipUrl', uploadForm.kickClipUrl);

    try {
      await api.post('/api/wins', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      handleCloseUploadDialog();
      showSnackbar('Win submitted successfully! Waiting for admin approval.');
      fetchWins();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error submitting win', 'error');
    }
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = async () => {
    handleMenuClose();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.username) {
        const response = await api.get(`/api/users/${user.username}`);
        setUserProfile(response.data);
        setUserProfileOpen(true);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleCloseUserProfile = () => {
    setUserProfileOpen(false);
    setUserProfile(null);
  };

  const handleOpenNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setNotifications(response.data);
      setNotificationsOpen(true);
      
      // Mark notifications as read
      if (response.data.length > 0) {
        const unreadIds = response.data
          .filter(n => !n.read)
          .map(n => n._id);
        
        if (unreadIds.length > 0) {
          await api.put('/api/notifications/read', 
            { notificationIds: unreadIds },
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          setUnreadCount(0);
        }
      }
    } catch (error) {
      showSnackbar('Error loading notifications', 'error');
    }
  };

  const handleCloseNotifications = () => {
    setNotificationsOpen(false);
  };

  const handleOpenUserProfile = async (username) => {
    try {
      setUserProfileLoading(true);
      const response = await api.get(`/api/users/${username}`);
      setUserProfile(response.data);
      setUserProfileOpen(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load user profile',
        severity: 'error'
      });
    } finally {
      setUserProfileLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '*': {
            boxSizing: 'border-box',
          },
        }}
      />
      <Box sx={{ minHeight: '100vh', position: 'relative' }}>
        <Particles />
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
                Gambling Wins
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center' }}>
              {authUser ? (
                <>
                  {authUser.isAdmin && (
                    <Button
                      color="inherit"
                      component={Link}
                      to="/dashboard"
                      startIcon={<AdminPanelSettingsIcon />}
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
                      Admin
                    </Button>
                  )}
                  {!authUser.isAdmin && (
                    <IconButton
                      onClick={handleOpenNotifications}
                      sx={{
                        p: 0.5,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 0 20px hsla(220, 73%, 63%, 0.5)',
                        },
                      }}
                    >
                      <Badge badgeContent={unreadCount} color="primary">
                        <InboxIcon />
                      </Badge>
                    </IconButton>
                  )}
                  <IconButton
                    onClick={handleProfileClick}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={menuOpen ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? 'true' : undefined}
                  >
                    <Avatar
                      src={currentUser?.profilePicture}
                      alt={currentUser?.username}
                      sx={{
                        width: 40,
                        height: 40,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        boxShadow: '0 0 10px hsla(220, 73%, 63%, 0.5)',
                        bgcolor: 'hsla(220, 73%, 63%, 0.2)',
                      }}
                    />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    PaperProps={{
                      sx: {
                        backgroundColor: 'background.paper',
                        backgroundImage: 'none',
                        boxShadow: '0 0 30px hsla(220, 73%, 63%, 0.3)',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        mt: 1.5,
                        '& .MuiMenuItem-root': {
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                          mx: 1,
                          my: 0.5,
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={handleViewProfile}>
                      <ListItemIcon>
                        <AccountCircleIcon sx={{ color: 'primary.contrastText' }} />
                      </ListItemIcon>
                      View Profile
                    </MenuItem>
                    <MenuItem component={Link} to="/settings">
                      <ListItemIcon>
                        <SettingsIcon sx={{ color: 'primary.contrastText' }} />
                      </ListItemIcon>
                      Settings
                    </MenuItem>
                    <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon sx={{ color: 'primary.contrastText' }} />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/login"
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
                    Login
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/register"
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
                    Register
                  </Button>
                </>
              )}
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
            <Tab value="enjayy" label="Enjayy's Wins" />
            <Tab value="community" label="Community Wins" />
          </Tabs>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{
                color: 'primary.contrastText',
                textShadow: '0 0 15px hsla(220, 73%, 63%, 0.8)',
                fontWeight: 800,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  textShadow: '0 0 25px hsla(220, 73%, 63%, 0.9)',
                },
              }}
            >
              {currentTab === 'enjayy' ? "Enjayy's Recent Wins" : "Community Wins"}
            </Typography>
            {currentTab === 'community' && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenUploadDialog}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 'var(--radius)',
                    px: 4,
                    py: 1.5,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: 'hsla(220, 73%, 63%, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'hsla(220, 73%, 63%, 0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 0 20px hsla(220, 73%, 63%, 0.5)',
                    },
                  }}
                >
                  Share Your Win
                </Button>
              </Box>
            )}
          </Box>
          <Grid container spacing={3}>
            {wins.map((win) => (
              <Grid item xs={12} sm={6} md={4} key={win._id}>
                <Win win={win} />
              </Grid>
            ))}
          </Grid>

          {/* Upload Dialog */}
          <Dialog 
            open={isUploadDialogOpen} 
            onClose={handleCloseUploadDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                background: 'linear-gradient(to bottom right, hsla(220, 70%, 12%, 0.95), hsla(220, 70%, 8%, 0.95))',
                backdropFilter: 'blur(20px)',
              }
            }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'secondary.main',
              pb: 2
            }}>
              <Typography variant="h6" component="div" sx={{ 
                color: 'primary.contrastText',
                fontWeight: 'bold'
              }}>
                Share Your Win
              </Typography>
              <IconButton
                aria-label="close"
                onClick={handleCloseUploadDialog}
                sx={{
                  color: 'primary.contrastText',
                  '&:hover': {
                    color: 'primary.main',
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Box component="form" onSubmit={handleSubmitWin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  name="title"
                  label="Title"
                  required
                  fullWidth
                  value={uploadForm.title}
                  onChange={handleUploadFormChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'secondary.main',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    }
                  }}
                />
                <TextField
                  name="description"
                  label="Description"
                  required
                  fullWidth
                  multiline
                  rows={4}
                  value={uploadForm.description}
                  onChange={handleUploadFormChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'secondary.main',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    }
                  }}
                />
                <TextField
                  name="kickClipUrl"
                  label="Kick Clip URL (Optional)"
                  fullWidth
                  value={uploadForm.kickClipUrl}
                  onChange={handleUploadFormChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'secondary.main',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    }
                  }}
                />
                <UploadArea 
                  onImageSelect={(file) => setUploadForm(prev => ({ ...prev, image: file }))}
                  selectedImage={uploadForm.image}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ 
              px: 3, 
              py: 2,
              borderTop: '1px solid',
              borderColor: 'secondary.main',
            }}>
              <Button 
                onClick={handleCloseUploadDialog}
                variant="outlined"
                sx={{
                  color: 'secondary.main',
                  borderColor: 'secondary.main',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitWin}
                variant="contained"
                disabled={!uploadForm.title || !uploadForm.description || !uploadForm.image}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&:disabled': {
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                  }
                }}
              >
                Submit
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={!!selectedWin}
            onClose={handleCloseWin}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: 'background.paper',
                backgroundImage: 'none',
                boxShadow: '0 0 30px hsla(220, 73%, 63%, 0.3)',
              }
            }}
          >
            {selectedWin && (
              <>
                <DialogTitle>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={selectedWin.userProfilePic}
                        alt={selectedWin.createdBy}
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          mr: 2,
                          border: '2px solid',
                          borderColor: 'primary.main',
                          boxShadow: '0 0 15px hsla(220, 73%, 63%, 0.5)',
                        }}
                      />
                      <Typography 
                        variant="h6"
                        sx={{
                          color: 'primary.contrastText',
                          textShadow: '0 0 10px hsla(220, 73%, 63%, 0.5)',
                        }}
                      >
                        {selectedWin.title}
                      </Typography>
                    </Box>
                    <IconButton 
                      onClick={handleCloseWin}
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
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        mb: 1,
                        color: 'primary.contrastText',
                        textShadow: '0 0 10px hsla(220, 73%, 63%, 0.5)',
                      }}
                    >
                      Posted by {selectedWin.createdBy}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 2,
                        color: 'text.secondary',
                        textShadow: '0 0 5px hsla(220, 73%, 63%, 0.3)',
                      }}
                    >
                      {selectedWin.description}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      boxShadow: '0 0 20px hsla(220, 73%, 63%, 0.3)',
                    }}
                  >
                    <img
                      src={`${BACKEND_URL}${selectedWin.imageUrl}`}
                      alt={selectedWin.title}
                      style={{
                        width: '100%',
                        maxHeight: '70vh',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </Box>
                </DialogContent>
              </>
            )}
          </Dialog>

          {/* User Profile Dialog */}
          <Dialog
            open={userProfileOpen}
            onClose={handleCloseUserProfile}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: 'background.paper',
                backgroundImage: 'none',
                borderRadius: '12px',
              },
            }}
          >
            {userProfile ? (
              <>
                <DialogTitle>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6">User Profile</Typography>
                    </Box>
                    <IconButton onClick={handleCloseUserProfile}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent>
                  {userProfile && (
                    <Box sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Avatar
                          src={userProfile.profilePicture}
                          alt={userProfile.username}
                          sx={{ 
                            width: 80, 
                            height: 80,
                            mr: 3,
                            border: '3px solid',
                            borderColor: 'primary.main',
                            boxShadow: '0 0 20px hsla(220, 73%, 63%, 0.5)',
                          }}
                        />
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                fontWeight: 700,
                                color: 'primary.contrastText',
                                textShadow: '0 0 15px hsla(220, 73%, 63%, 0.6)',
                              }}
                            >
                              {userProfile.username}
                            </Typography>
                            {userProfile.badges?.map((badge, index) => (
                              <Tooltip
                                key={`${badge.type}-${index}`}
                                title={badge.description}
                                placement="right"
                                arrow
                              >
                                <Chip
                                  label={badge.label}
                                  color="secondary"
                                  size="small"
                                  sx={{
                                    backgroundColor: 'hsla(220, 73%, 63%, 0.2)',
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '& .MuiChip-label': {
                                      textShadow: '0 0 10px hsla(220, 73%, 63%, 0.5)',
                                    },
                                  }}
                                />
                              </Tooltip>
                            ))}
                            {userProfile.role === 'admin' && (
                              <Chip
                                icon={<AdminPanelSettingsIcon />}
                                label="Admin"
                                color="primary"
                                size="small"
                              />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Joined {format(new Date(userProfile.joinDate), 'MMMM yyyy')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {userProfile.uploadCount} uploads
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        Recent Wins
                      </Typography>
                      <Grid container spacing={2}>
                        {userProfile.recentWins.map((recentWin) => (
                          <Grid item xs={12} sm={6} md={4} key={recentWin._id}>
                            <Paper
                              sx={{ 
                                p: 2,
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'primary.main',
                              }}
                            >
                              <img
                                src={getImageUrl(recentWin.imageUrl)}
                                alt={recentWin.title}
                                style={{
                                  width: '100%',
                                  height: '120px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  marginBottom: '8px',
                                }}
                              />
                              <Typography variant="subtitle2" gutterBottom>
                                {recentWin.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {formatDistanceToNow(new Date(recentWin.createdAt), { addSuffix: true })}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </DialogContent>
              </>
            ) : (
              <DialogContent>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress />
                </Box>
              </DialogContent>
            )}
          </Dialog>

          {/* Notifications Dialog */}
          <Dialog
            open={notificationsOpen}
            onClose={handleCloseNotifications}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: 'background.paper',
                backgroundImage: 'none',
              }
            }}
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Notifications
                </Typography>
                <IconButton onClick={handleCloseNotifications}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              {notifications.length === 0 ? (
                <Box sx={{ 
                  py: 4, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 2
                }}>
                  <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography color="text.secondary">
                    No notifications yet
                  </Typography>
                </Box>
              ) : (
                <List>
                  {notifications.map((notification) => (
                    <ListItem
                      key={notification._id}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: notification.read ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <ListItemIcon>
                        {notification.type === 'win_approved' ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1">
                            {notification.type === 'win_approved' 
                              ? 'Win Approved!' 
                              : 'Win Declined'}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" display="block">
                              {notification.winTitle}
                            </Typography>
                            {notification.message && (
                              <Typography 
                                variant="body2" 
                                component="span" 
                                display="block"
                                sx={{ mt: 0.5, color: 'text.secondary' }}
                              >
                                Admin comment: {notification.message}
                              </Typography>
                            )}
                            <Typography 
                              variant="caption" 
                              component="span" 
                              display="block"
                              sx={{ mt: 0.5 }}
                            >
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </DialogContent>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity}
              sx={{ 
                width: '100%',
                backgroundColor: snackbar.severity === 'success' ? 'hsla(120, 73%, 75%, 0.9)' : 'hsla(0, 73%, 75%, 0.9)',
                backdropFilter: 'blur(10px)',
                color: '#000',
                '& .MuiAlert-icon': {
                  color: '#000',
                },
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Home; 
