// API configuration and utility functions
const API_BASE_URL = 'https://campus-task-collab-board-gqd5.onrender.com/api';

// helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// auth API calls
const authAPI = {
  register: async (name, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },
  
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }
};

// tasks API calls
const tasksAPI = {
  getAll: async () => {
    return apiRequest('/tasks');
  },
  
  create: async (task) => {
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
  },
  
  update: async (id, updates) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }
};

