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

// Excel file upload functions
export async function uploadExcelFile(file) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Please log in to upload files');
  }

  const formData = new FormData();
  formData.append('excelFile', file);

  const res = await fetch(`${API_URL}/excel/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    if (res.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }
    const error = await res.json();
    throw new Error(error.message || 'Upload failed');
  }
  return res.json();
}

export async function getFileStatus(fileId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Please log in to check file status');
  }

  const res = await fetch(`${API_URL}/excel/status/${fileId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }
    const error = await res.json();
    throw new Error(error.message || 'Failed to get file status');
  }
  return res.json();
}

export async function getUserFiles() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Please log in to view your files');
  }

  try {
    const res = await fetch(`${API_URL}/excel/files`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please log in again.');
      }
      if (res.status === 503) {
        throw new Error('Service temporarily unavailable. Please try again in a moment.');
      }
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch files');
    }
    return res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network connection error. Please check your internet connection.');
    }
    throw error;
  }
}

export async function getFileData(fileId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Please log in to view file data');
  }

  try {
    const res = await fetch(`${API_URL}/excel/data/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please log in again.');
      }
      if (res.status === 503) {
        throw new Error('Service temporarily unavailable. Please try again in a moment.');
      }
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch file data');
    }
    return res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network connection error. Please check your internet connection.');
    }
    throw error;
  }
}

export async function deleteFile(fileId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Please log in to delete files');
  }

  const res = await fetch(`${API_URL}/excel/file/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete file');
  }
  return res.json();
}
