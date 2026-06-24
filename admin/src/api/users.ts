import api from './client';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'github';
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  telegramChatId?: string;
  telegramUsername?: string;
  approvedAt?: string;
  createdAt: string;
}

export const getMe = () => api.get<User>('/users/me').then((r) => r.data);
export const getPendingUsers = () => api.get<User[]>('/users/pending').then((r) => r.data);
export const getApprovedUsers = () => api.get<User[]>('/users/approved').then((r) => r.data);
export const getAllUsers = () => api.get<User[]>('/users').then((r) => r.data);
export const approveUser = (id: string) => api.patch<User>(`/users/${id}/approve`).then((r) => r.data);
export const rejectUser = (id: string) => api.patch<User>(`/users/${id}/reject`).then((r) => r.data);
export const updateUser = (id: string, data: Partial<User>) =>
  api.patch<User>(`/users/${id}`, data).then((r) => r.data);
export const unlinkTelegram = () => api.delete<User>('/users/me/telegram').then((r) => r.data);
