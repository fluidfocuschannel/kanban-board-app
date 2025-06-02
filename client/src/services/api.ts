import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Board API
export const getBoardById = (id: string) => api.get(`/boards/${id}`);
export const getAllBoards = () => api.get('/boards');
export const createBoard = (data: { name: string; description: string }) => api.post('/boards', data);
export const updateBoard = (id: string, data: any) => api.put(`/boards/${id}`, data);

// Task API
export const getTasks = (boardId: string) => api.get('/tasks', { params: { boardId } });
export const createTask = (data: any) => api.post('/tasks', data);
export const updateTask = (id: string, data: any) => api.put(`/tasks/${id}`, data);
export const moveTask = (id: string, data: { laneId: string; position: number }) => 
  api.put(`/tasks/${id}/move`, data);
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);
