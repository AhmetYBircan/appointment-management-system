import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Link, MenuItem, Alert, IconButton, InputAdornment } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const userTypes = [
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' },
  { value: 'management', label: 'Management' },
];

const Login: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const navigate = useNavigate();

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regMail, setRegMail] = useState('');
  const [regType, setRegType] = useState('admin');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegPassword2, setShowRegPassword2] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email || !password) {
      setLoginError('Email and password are required.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:3000/users/login', {
        keyword: email,
        password,
      });
      console.log("RES.DATA >>", res.data)
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else {
        setLoginError('Login failed');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setLoginError(err.response.data.message);
      } else {
        setLoginError('Login failed.');
      }
    }
  };

  const validatePassword = (pw: string) => {
    if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) {
      return 'Şifre en az 8 karakter olmalı ve en az 1 büyük harf, 1 sayı bulundurmalı';
    }
    return '';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    const pwError = validatePassword(regPassword);
    if (pwError) {
      setRegisterError(pwError);
      return;
    }
    if (regPassword !== regPassword2) {
      setRegisterError('Passwords do not match.');
      return;
    }
    try {
      await axios.post('http://localhost:3000/users/register', {
        name: regName,
        password: regPassword,
        phoneNumber: regPhone,
        mail: regMail,
        type: regType,
      });
      setRegisterSuccess('Registration successful! You can now log in.');
      setShowRegister(false);
      setRegName(''); setRegPassword(''); setRegPassword2(''); setRegPhone(''); setRegMail(''); setRegType('admin');
    } catch (err: any) {
      setRegisterError('Registration failed.');
    }
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafd' }}>
      <Paper elevation={3} sx={{ p: 5, width: 370, borderRadius: 3, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <CalendarMonthIcon sx={{ color: '#a259d9', fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight={700} color="#a259d9" gutterBottom>
            {showRegister ? (
              <>Registe<span style={{ color: '#a259d9', fontWeight: 700 }}>r</span></>
            ) : (
              <>Logi<span style={{ color: '#a259d9', fontWeight: 700 }}>n</span></>
            )}
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary" mb={3}>
          Access your appointments and schedule
        </Typography>
        {!showRegister ? (
          <form onSubmit={handleLogin}>
            <TextField
              label="Email or Username"
              type="text"
              fullWidth
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com or username"
              required
            />
            <TextField
              label="Password"
              type={showLoginPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowLoginPassword((v) => !v)} edge="end">
                      {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Link href="#" underline="hover" color="#a259d9" fontSize={14}>
                Şifremi Unuttum
              </Link>
            </Box>
            {loginError && <Alert severity="error" sx={{ mb: 1 }}>{loginError}</Alert>}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ bgcolor: '#a259d9', color: '#fff', fontWeight: 600, py: 1.2, borderRadius: 2, mb: 1, '&:hover': { bgcolor: '#8d3bbf' } }}
            >
              Sign In
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={regName}
              onChange={e => setRegName(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type={showRegPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowRegPassword((v) => !v)} edge="end">
                      {showRegPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Repeat Password"
              type={showRegPassword2 ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={regPassword2}
              onChange={e => setRegPassword2(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowRegPassword2((v) => !v)} edge="end">
                      {showRegPassword2 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Phone Number"
              fullWidth
              margin="normal"
              value={regPhone}
              onChange={e => setRegPhone(e.target.value)}
            />
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              value={regMail}
              onChange={e => setRegMail(e.target.value)}
            />
            <TextField
              select
              label="Type"
              fullWidth
              margin="normal"
              value={regType}
              onChange={e => setRegType(e.target.value)}
              required
            >
              {userTypes.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            {registerError && <Alert severity="error" sx={{ mb: 1 }}>{registerError}</Alert>}
            {registerSuccess && <Alert severity="success" sx={{ mb: 1 }}>{registerSuccess}</Alert>}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ bgcolor: '#a259d9', color: '#fff', fontWeight: 600, py: 1.2, borderRadius: 2, mb: 1, '&:hover': { bgcolor: '#8d3bbf' } }}
            >
              Register
            </Button>
          </form>
        )}
        <Typography variant="body2" mt={2}>
          {showRegister ? (
            <>
              Already have an account?{' '}
              <Link href="#" underline="hover" color="#a259d9" fontWeight={600} onClick={() => setShowRegister(false)}>
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <Link href="#" underline="hover" color="#a259d9" fontWeight={600} onClick={() => setShowRegister(true)}>
                Register now
              </Link>
            </>
          )}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login; 