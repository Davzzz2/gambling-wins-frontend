import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

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
        },
      },
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App; 