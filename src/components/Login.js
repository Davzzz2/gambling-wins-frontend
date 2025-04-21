import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Slide,
  Snackbar,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username: formData.username,
        password: formData.password
      }, {
        withCredentials: true
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        await login(response.data.user);
        setSnackbar({
          open: true,
          message: 'Login successful!',
          severity: 'success'
        });
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'An error occurred during login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LoginIcon
              sx={{
                fontSize: 48,
                color: 'hsl(220, 73%, 63%)',
                mb: 2,
                filter: 'drop-shadow(0 0 10px hsla(220, 73%, 63%, 0.5))',
              }}
            />
            <Typography
              variant="h4"
              sx={{
                color: 'hsl(220, 89%, 99%)',
                fontWeight: 700,
                textShadow: '0 0 15px hsla(220, 73%, 63%, 0.6)',
              }}
            >
              Login
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
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
                'Login'
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
                Don't have an account? <Link to="/register">Register here</Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            backgroundColor: 'hsla(120, 73%, 75%, 0.9)',
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
    </Box>
  );
};

export default Login; 