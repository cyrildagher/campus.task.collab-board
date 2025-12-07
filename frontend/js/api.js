// figure out if we're running locally or on render
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://campus-task-collab-board-gqd5.onrender.com/api';

console.log('API Base URL:', API_BASE_URL);

// helper to make api calls, handles errors and stuff
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
    console.log(`Making API request to: ${API_BASE_URL}${endpoint}`, config);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // check if response is json, sometimes it isnt
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server returned non-JSON response: ${text}`);
    }
    
    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    console.error('Endpoint:', endpoint);
    console.error('Config:', config);
    throw error;
  }
}

// auth stuff - login and register
const authAPI = {
  register: async (name, email, password, student_id) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, student_id })
    });
  },
  
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }
};

// task api calls
const tasksAPI = {
  getAll: async (userId) => {
    if (!userId) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      userId = user.id;
    }
    if (!userId) {
      throw new Error('User ID is required to fetch tasks');
    }
    return apiRequest(`/tasks?user_id=${userId}`);
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

// teams api - create, join, leave, etc
const teamsAPI = {
  create: async (team) => {
    return apiRequest('/teams', {
      method: 'POST',
      body: JSON.stringify(team)
    });
  },
  
  getAll: async () => {
    return apiRequest('/teams');
  },
  
  getById: async (id) => {
    return apiRequest(`/teams/${id}`);
  },
  
  join: async (teamId, userId) => {
    return apiRequest(`/teams/${teamId}/join`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    });
  },
  
  joinByCode: async (teamCode, userId) => {
    return apiRequest('/teams/join-by-code', {
      method: 'POST',
      body: JSON.stringify({ team_code: teamCode, user_id: userId })
    });
  },
  
  getUserTeams: async (userId) => {
    return apiRequest(`/users/${userId}/teams`);
  },
  
  getMembers: async (teamId) => {
    return apiRequest(`/teams/${teamId}/members`);
  },
  
  leave: async (teamId, userId) => {
    return apiRequest(`/teams/${teamId}/leave`, {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId })
    });
  }
};

// get all users (for dropdowns when assigning tasks)
const usersAPI = {
  getAll: async () => {
    return apiRequest('/users');
  }
};

