import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
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
import { styled } from '@mui/system';

const StyledContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '20px',
});

const StyledForm = styled('form')({
  width: '100%',
  maxWidth: '400px',
  marginTop: '1rem',
});

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Clear any stored sensitive data on component mount
  React.useEffect(() => {
    if (!localStorage.getItem('token')) {
      localStorage.clear();
      sessionStorage.clear();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError('');

      // Add rate limiting on client side
      const lastAttempt = sessionStorage.getItem('lastLoginAttempt');
      const now = Date.now();
      if (lastAttempt && now - parseInt(lastAttempt) < 2000) {
        throw new Error('Please wait before trying again');
      }
      sessionStorage.setItem('lastLoginAttempt', now.toString());

      const response = await api.login({ username, password });
      
      if (response.token && response.user) {
        // Store token securely
        localStorage.setItem('token', response.token);
        
        // Store minimal user data
        const safeUserData = {
          id: response.user.id,
          username: response.user.username,
          role: response.user.role,
        };
        localStorage.setItem('user', JSON.stringify(safeUserData));
        
        // Update auth context
        login(response.user);
        
        // Clear sensitive form data
        setUsername('');
        setPassword('');
        
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
      setError('Invalid credentials');
      // Clear password field on error
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <StyledContainer>
      <Typography component="h1" variant="h4" gutterBottom>
        Login
      </Typography>
      <StyledForm onSubmit={handleSubmit} autoComplete="off">
        <Box mb={2}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            autoComplete="username"
            inputProps={{
              maxLength: 50,
              autoCapitalize: 'none',
            }}
          />
        </Box>
        <Box mb={2}>
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
            inputProps={{
              maxLength: 100,
            }}
          />
        </Box>
        {error && (
          <Typography color="error" variant="body2" gutterBottom>
            {error}
          </Typography>
        )}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={isLoading || !username || !password}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </StyledForm>
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
    </StyledContainer>
  );
};

export default Login; 
