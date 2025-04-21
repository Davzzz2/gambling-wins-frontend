import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  FormHelperText,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_API_URL;

const getImageUrl = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
};

function Settings() {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastUsernameChange, setLastUsernameChange] = useState(null);
  const [canChangeUsername, setCanChangeUsername] = useState(true);
  const [daysUntilChange, setDaysUntilChange] = useState(0);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setPreviewUrl(getImageUrl(user.profilePicture));
      if (user.lastUsernameChange) {
        const lastChange = new Date(user.lastUsernameChange);
        const daysSinceChange = Math.floor((new Date() - lastChange) / (1000 * 60 * 60 * 24));
        const canChange = daysSinceChange >= 30;
        setCanChangeUsername(canChange);
        setDaysUntilChange(30 - daysSinceChange);
        setLastUsernameChange(lastChange);
      }
    }
  }, [user]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      if (username !== user.username) {
        formData.append('username', username);
      }
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await axios.put(`${BACKEND_URL}/api/users/settings`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setUser(response.data.user);
      // Update token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 20%, hsla(220, 73%, 63%, 0.4) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, hsla(220, 73%, 63%, 0.4) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, hsla(220, 70%, 8%, 1) 0%, hsla(220, 70%, 12%, 1) 100%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            backgroundColor: 'hsla(220, 70%, 12%, 0.8)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'hsl(220, 73%, 63%)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 30px hsla(220, 73%, 63%, 0.3)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: 'hsl(220, 89%, 99%)',
              fontWeight: 700,
              textShadow: '0 0 15px hsla(220, 73%, 63%, 0.6)',
            }}
          >
            Settings
          </Typography>

          {(error || success) && (
            <Alert severity={error ? 'error' : 'success'} sx={{ width: '100%' }}>
              {error || success}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={previewUrl}
                alt={username}
                sx={{
                  width: 120,
                  height: 120,
                  border: '3px solid',
                  borderColor: 'hsl(220, 73%, 63%)',
                  boxShadow: '0 0 20px hsla(220, 73%, 63%, 0.5)',
                }}
              />
              <Button
                variant="outlined"
                component="label"
                sx={{
                  borderColor: 'hsl(220, 73%, 63%)',
                  color: 'hsl(220, 89%, 99%)',
                  '&:hover': {
                    borderColor: 'hsl(220, 73%, 73%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Change Profile Picture
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>

            <Box>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                variant="outlined"
                disabled={!canChangeUsername}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'hsl(220, 73%, 63%)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'hsl(220, 73%, 63%)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputBase-input': {
                    color: 'hsl(220, 89%, 99%)',
                  },
                }}
              />
              {lastUsernameChange && (
                <FormHelperText
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    mt: 1,
                    textAlign: 'left',
                  }}
                >
                  {canChangeUsername
                    ? 'You can change your username'
                    : `You can change your username again in ${daysUntilChange} days`}
                </FormHelperText>
              )}
            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                backgroundColor: 'hsl(220, 73%, 63%)',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'hsl(220, 73%, 53%)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Settings; 
