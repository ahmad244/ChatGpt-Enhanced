import React, { useState, useContext } from 'react';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import api, { refreshToken } from '../../../api/apiClient';
import { AuthContext } from '../../../context/AuthContext';

const Login: React.FC = () => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await api.post('/auth/login', { email, password });
     const success = await refreshToken(); // Remove this unnecessary call
     if (success) {
       setIsLoggedIn(true);
       navigate('/'); 
     } else {
       setIsLoggedIn(false);
       navigate('/login');
     }
     // Once login is successful, tokens are already set in cookies.
     setIsLoggedIn(true);
     navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Invalid credentials');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          Login
        </Button>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Don't have an account? <Link to="/register">Register here</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
