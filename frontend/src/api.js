// Utility for API calls to backend
const API_URL = process.env.REACT_APP_API_URL || '/api';

console.log('API_URL configured as:', API_URL); // Debug log

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed');
  }
  return res.json();
}

export async function registerUser(username, email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Registration failed');
  }
  return res.json();
}

export async function forgotPassword(email) {
  console.log('Calling forgotPassword API with email:', email);
  console.log('API_URL:', API_URL);
  
  const url = `${API_URL}/auth/forgot-password`;
  console.log('Full URL:', url);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  console.log('Response status:', res.status);
  
  if (!res.ok) {
    const error = await res.json();
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to send OTP');
  }
  return res.json();
}

export async function verifyOTP(email, otp) {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'OTP verification failed');
  }
  return res.json();
}

export async function resetPassword(email, otp, newPassword) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Password reset failed');
  }
  return res.json();
}
