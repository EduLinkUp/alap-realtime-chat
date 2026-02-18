import api from './api';

// Authentication
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  localStorage.setItem('user', JSON.stringify(response.data));
  return response.data;
};

// Users
export const getUsers = async (search = '') => {
  const response = await api.get(`/users${search ? `?search=${search}` : ''}`);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const blockUser = async (userId) => {
  const response = await api.post(`/users/block/${userId}`);
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await api.post(`/users/unblock/${userId}`);
  return response.data;
};

export const getBlockedUsers = async () => {
  const response = await api.get('/users/blocked');
  return response.data;
};

// Messages
export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

export const getChatHistory = async (userId, page = 1, limit = 50) => {
  const response = await api.get(`/messages/${userId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const markMessagesAsRead = async (userId) => {
  const response = await api.put(`/messages/read/${userId}`);
  return response.data;
};

export const deleteMessage = async (messageId, deleteForEveryone = false) => {
  const response = await api.delete(`/messages/${messageId}`, {
    data: { deleteForEveryone }
  });
  return response.data;
};

export const searchMessages = async (query, userId) => {
  const response = await api.get(`/messages/search?query=${query}&userId=${userId}`);
  return response.data;
};

// Groups
export const createGroup = async (groupData) => {
  const response = await api.post('/groups', groupData);
  return response.data;
};

export const getGroups = async () => {
  const response = await api.get('/groups');
  return response.data;
};

export const getGroupById = async (groupId) => {
  const response = await api.get(`/groups/${groupId}`);
  return response.data;
};

export const updateGroup = async (groupId, groupData) => {
  const response = await api.put(`/groups/${groupId}`, groupData);
  return response.data;
};

export const addGroupMember = async (groupId, userId) => {
  const response = await api.post(`/groups/${groupId}/members`, { userId });
  return response.data;
};

export const removeGroupMember = async (groupId, userId) => {
  const response = await api.delete(`/groups/${groupId}/members/${userId}`);
  return response.data;
};

export const leaveGroup = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/leave`);
  return response.data;
};

export const getGroupMessages = async (groupId, page = 1, limit = 50) => {
  const response = await api.get(`/groups/${groupId}/messages?page=${page}&limit=${limit}`);
  return response.data;
};

// File upload
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
