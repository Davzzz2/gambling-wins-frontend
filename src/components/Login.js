import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Paper,
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
  background: 'linear-gradient(135deg, hsla(220, 100%, 8%, 0.95) 0%, hsla(220, 100%, 2%, 0.95) 100%)',
});

const StyledPaper = styled(Paper)({
  padding: '2rem',
  width: '100%',
  maxWidth: '400px',
  background: 'linear-gradient(135deg, hsla(220, 70%, 15%, 0.95) 0%, hsla(220, 70%, 10%, 0.95) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid hsla(220, 73%, 63%, 0.2)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
});

const StyledForm = styled('form')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'hsla(220, 73%, 63%, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'hsla(220, 73%, 63%, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'hsl(220, 73%, 63%)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'hsla(220, 100%, 95%, 0.8)',
  },
  '& .MuiInputBase-input': {
    color: 'hsl(220, 100%, 95%)',
  },
});

const StyledButton = styled(Button)({
  marginTop: '1rem',
  padding: '0.8rem',
  background: 'linear-gradient(135deg, hsl(220, 73%, 63%) 0%, hsl(220, 73%, 56%) 100%)',
  '&:hover': {
    background: 'linear-gradient(135deg, hsl(220, 73%, 56%) 0%, hsl(220, 73%, 50%) 100%)',
  },
  '&:disabled': {
    background: 'hsla(220, 73%, 63%, 0.3)',
  },
});

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
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

      const response = await api.login(username, password);
      
      if (response.token && response.user) {
        // Store token securely
        localStorage.setItem('token', response.token);
        
        // Store minimal user data
        const safeUserData = {
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
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Invalid credentials');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper elevation={3}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <LoginIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, hsl(220, 100%, 90%), hsl(220, 73%, 63%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            Welcome Back
          </Typography>
        </Box>

        <StyledForm onSubmit={handleSubmit} autoComplete="off">
          <StyledTextField
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
          <StyledTextField
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

          {error && (
            <Typography 
              color="error" 
              variant="body2" 
              sx={{ 
                textAlign: 'center',
                padding: '0.5rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
              }}
            >
              {error}
            </Typography>
          )}

          <StyledButton
            fullWidth
            variant="contained"
            type="submit"
            disabled={isLoading || !username || !password}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </StyledButton>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: 'hsla(220, 100%, 95%, 0.7)',
                '& a': {
                  color: 'hsl(220, 73%, 63%)',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'hsl(220, 73%, 70%)',
                    textDecoration: 'underline',
                  },
                },
              }}
            >
              Don't have an account? <Link to="/register">Register here</Link>
            </Typography>
          </Box>
        </StyledForm>
      </StyledPaper>

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
            backgroundColor: 'hsla(120, 73%, 75%, 0.95)',
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
