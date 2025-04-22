import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Avatar,
  Chip,
  useTheme,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { formatDistanceToNow, format } from 'date-fns';
import { api } from '../services/api';

const Win = ({ win, onApprove, onReject, isPending = false }) => {
  const [open, setOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fullImageOpen, setFullImageOpen] = useState(false);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    return imageUrl; // Return the URL as is since it's already a full URL from the database
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleWatchClip = (e) => {
    e.stopPropagation();
    window.open(win.kickClipUrl, '_blank');
  };

  const handleOpenUserProfile = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const response = await api.getUserProfile(win.createdBy);
      console.log('User profile response:', response);
      setUserProfile(response);
      setUserProfileOpen(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseUserProfile = () => {
    setUserProfileOpen(false);
  };

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleOpenFullImage = (e) => {
    e.stopPropagation();
    setFullImageOpen(true);
  };
  const handleCloseFullImage = () => setFullImageOpen(false);

  const renderContent = (isPopup = false) => (
    <>
      <CardMedia
        component="img"
        image={getImageUrl(win.imageUrl)}
        alt={win.title}
        onClick={handleOpenFullImage}
        sx={{
          height: isPopup ? 400 : 200,
          objectFit: 'cover',
          cursor: 'pointer',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        }}
      />
      <CardContent sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                '& .username': {
                  textDecoration: 'underline',
                },
              },
            }}
            onClick={handleOpenUserProfile}
          >
            <Avatar
              src={win.userProfilePic}
              alt={win.createdBy}
              sx={{ 
                width: 40, 
                height: 40, 
                mr: 2,
                border: '2px solid',
                borderColor: 'primary.main',
                boxShadow: '0 0 10px hsla(220, 73%, 63%, 0.5)',
                bgcolor: 'hsla(220, 73%, 63%, 0.2)',
              }}
            />
            <Box>
              <Typography 
                variant="subtitle1" 
                component="div"
                className="username"
                sx={{ 
                  fontWeight: 800,
                  color: 'primary.contrastText',
                  textShadow: '0 0 12px hsla(220, 73%, 63%, 0.6)',
                  fontSize: '1.1rem',
                  letterSpacing: '0.02em',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    textShadow: '0 0 16px hsla(220, 73%, 63%, 0.8)',
                    color: theme => theme.palette.primary.light,
                  }
                }}
              >
                {win.createdBy}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  opacity: 0.85,
                  transition: 'opacity 0.2s ease',
                  '&:hover': {
                    opacity: 1
                  }
                }}
              >
                {formatDistanceToNow(new Date(win.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>
          {win.isEnjayyWin && (
            <Chip
              label="Enjayy's Win"
              color="primary"
              size="small"
              sx={{ ml: 'auto' }}
            />
          )}
        </Box>
        <Typography 
          variant="h6" 
          component="div" 
          gutterBottom
          sx={{
            color: 'primary.contrastText',
            textShadow: '0 0 15px hsla(220, 73%, 63%, 0.6)',
            fontWeight: 600,
          }}
        >
          {win.title}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            mb: 2,
          }}
        >
          {win.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          {win.kickClipUrl && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayCircleOutlineIcon />}
              onClick={handleWatchClip}
              sx={{
                fontWeight: 600,
                borderRadius: 'var(--radius)',
                px: 2,
                py: 1,
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
              Watch Clip
            </Button>
          )}
          {isPending && (
            <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
              <IconButton onClick={() => onApprove(win._id)} color="success">
                <CheckCircleIcon />
              </IconButton>
              <IconButton onClick={() => onReject(win._id)} color="error">
                <CancelIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </CardContent>
    </>
  );

  return (
    <>
      <Card
        onClick={handleOpenDialog}
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 0 30px hsla(220, 73%, 63%, 0.3)',
          },
        }}
      >
        {renderContent()}
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
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
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {renderContent(true)}
        </DialogContent>
      </Dialog>

      <Dialog
        open={fullImageOpen}
        onClose={handleCloseFullImage}
        maxWidth={false}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleCloseFullImage}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <img
            src={getImageUrl(win.imageUrl)}
            alt={win.title}
            style={{
              maxWidth: '95vw',
              maxHeight: '90vh',
              objectFit: 'contain',
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={userProfileOpen}
        onClose={handleCloseUserProfile}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6">
                User Profile
              </Typography>
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
                  src={userProfile?.profilePicture}
                  alt={userProfile?.username}
                  sx={{ 
                    width: 80, 
                    height: 80,
                    mr: 3,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    boxShadow: '0 0 20px hsla(220, 73%, 63%, 0.5)',
                    bgcolor: 'hsla(220, 73%, 63%, 0.2)',
                  }}
                />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 600,
                      color: 'primary.contrastText',
                      textShadow: '0 0 15px hsla(220, 73%, 63%, 0.6)',
                    }}>
                      {userProfile.username}
                    </Typography>
                    {userProfile.role === 'admin' && (
                      <Chip
                        icon={
                          <svg 
                            className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiChip-icon MuiChip-iconSmall MuiChip-iconColorPrimary" 
                            focusable="false" 
                            aria-hidden="true" 
                            viewBox="0 0 24 24" 
                            data-testid="AdminPanelSettingsIcon"
                            style={{ color: 'white' }}
                          >
                            <path d="M17 11c.34 0 .67.04 1 .09V6.27L10.5 3 3 6.27v4.91c0 4.54 3.2 8.79 7.5 9.82.55-.13 1.08-.32 1.6-.55-.69-.98-1.1-2.17-1.1-3.45 0-3.31 2.69-6 6-6" />
                            <path d="M17 13c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 1.38c.62 0 1.12.51 1.12 1.12s-.51 1.12-1.12 1.12-1.12-.51-1.12-1.12.5-1.12 1.12-1.12m0 5.37c-.93 0-1.74-.46-2.24-1.17.05-.72 1.51-1.08 2.24-1.08s2.19.36 2.24 1.08c-.5.71-1.31 1.17-2.24 1.17" />
                          </svg>
                        }
                        label="Admin"
                        size="small"
                        color="primary"
                        sx={{
                          backgroundColor: 'hsla(220, 73%, 63%, 0.2)',
                          border: '1px solid',
                          borderColor: 'primary.main',
                          '& .MuiChip-label': {
                            textShadow: '0 0 10px hsla(220, 73%, 63%, 0.5)',
                            color: 'white',
                            fontWeight: 600,
                            letterSpacing: '0.05em'
                          },
                          '& .MuiSvgIcon-root': {
                            color: 'white',
                          },
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Joined {format(new Date(userProfile.joinDate), 'MMMM yyyy')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {userProfile.uploadCount} uploads
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom sx={{
                color: 'primary.contrastText',
                textShadow: '0 0 12px hsla(220, 73%, 63%, 0.4)',
                fontWeight: 600,
                mb: 2,
              }}>
                Recent Wins
              </Typography>
              <Grid container spacing={2}>
                {userProfile.recentWins.map((recentWin) => (
                  <Grid item xs={12} sm={6} md={4} key={recentWin._id}>
                    <Paper sx={{
                      p: 1,
                      backgroundColor: 'hsla(220, 70%, 15%, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid hsla(220, 73%, 63%, 0.2)',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                      },
                    }}>
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
                      <Typography variant="subtitle2" gutterBottom sx={{
                        color: 'primary.contrastText',
                        fontWeight: 600,
                      }}>
                        {recentWin.title}
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: 'text.secondary',
                        display: 'block',
                      }}>
                        {formatDistanceToNow(new Date(recentWin.createdAt), { addSuffix: true })}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Win; 
