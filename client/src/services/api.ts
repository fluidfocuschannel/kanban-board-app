import axios from 'axios';
import type { AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = (email: string, password: string) => 
  api.post<AuthResponse>('/auth/login', { email, password });

export const register = (username: string, email: string, password: string, role?: 'admin' | 'developer') => 
  api.post<AuthResponse>('/auth/register', { username, email, password, role });

export const getCurrentUser = () => 
  api.get<{ user: any }>('/auth/me');

// Board API
export const getBoardById = (id: string) => api.get(`/boards/${id}`);
export const getAllBoards = () => api.get('/boards');
export const createBoard = (data: { name: string; description: string; swimlanes?: string[] }) => api.post('/boards', data);
export const updateBoard = (id: string, data: any) => api.put(`/boards/${id}`, data);
export const deleteBoard = (id: string) => api.delete(`/boards/${id}`);

// Task API
export const getTasks = (boardId: string) => api.get('/tasks', { params: { boardId } });
export const createTask = (data: any) => api.post('/tasks', data);
export const updateTask = (id: string, data: any) => api.put(`/tasks/${id}`, data);
export const moveTask = (id: string, data: { laneId: string; position: number }) => 
  api.put(`/tasks/${id}/move`, data);
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);
