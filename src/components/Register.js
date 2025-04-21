import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Avatar,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      let submitData;
      if (profilePicture) {
        submitData = new FormData();
        submitData.append('username', formData.username);
        submitData.append('password', formData.password);
        submitData.append('profilePicture', profilePicture);
        
        await api.post('/api/register', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // If no profile picture selected, send as JSON
        await api.post('/api/register', {
          username: formData.username,
          password: formData.password
        });
      }

      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: 4,
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
            align="center"
            gutterBottom
            sx={{
              color: 'hsl(220, 89%, 99%)',
              fontWeight: 700,
              textShadow: '0 0 15px hsla(220, 73%, 63%, 0.6)',
              mb: 4,
            }}
          >
            Register
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Avatar
                src={previewUrl}
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  border: '3px solid',
                  borderColor: 'hsl(220, 73%, 63%)',
                  boxShadow: '0 0 20px hsla(220, 73%, 63%, 0.5)',
                }}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  borderColor: 'hsl(220, 73%, 63%)',
                  color: 'hsl(220, 89%, 99%)',
                  '&:hover': {
                    borderColor: 'hsl(220, 73%, 73%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Choose Profile Picture
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </Button>
            </Box>

            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
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
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Register'
              )}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'hsl(220, 89%, 99%)',
                  '& a': {
                    color: 'hsl(220, 73%, 63%)',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  },
                }}
              >
                Already have an account? <Link to="/login">Login here</Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 
