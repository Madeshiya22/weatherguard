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

// Function: getMe
// Kya kar raha hai: Logged-in user ki details fetch karta hai.
// Relation / Backend: Backend ke 'UsersController.getMe' (GET /api/users/me) endpoint ko hit karta hai. Frontend ke 'useAuth' hook mein use hota hai.
export const getMe = () => api.get<User>('/users/me').then((r) => r.data);

// Function: getPendingUsers
// Kya kar raha hai: Pending requests ki list lata hai.
// Relation / Backend: Backend ke 'UsersController.findPending' (GET /api/users/pending) endpoint ko hit karta hai. 'PendingUsersPage.tsx' mein use hota hai.
export const getPendingUsers = () => api.get<User[]>('/users/pending').then((r) => r.data);

// Function: getApprovedUsers
// Kya kar raha hai: Approved users ki list fetch karta hai.
// Relation / Backend: Backend ke 'UsersController.findApproved' (GET /api/users/approved) endpoint ko hit karta hai.
export const getApprovedUsers = () => api.get<User[]>('/users/approved').then((r) => r.data);

// Function: getAllUsers
// Kya kar raha hai: Saare users ki list lata hai.
// Relation / Backend: Backend ke 'UsersController.findAll' (GET /api/users) endpoint ko hit karta hai. 'AllUsersPage.tsx' mein use hota hai.
export const getAllUsers = () => api.get<User[]>('/users').then((r) => r.data);

// Function: approveUser
// Kya kar raha hai: User ko approve karne ki request bhejta hai.
// Relation / Backend: Backend ke 'UsersController.approve' (PATCH /api/users/:id/approve) endpoint ko hit karta hai. 'PendingUsersPage.tsx' mein use hota hai.
export const approveUser = (id: string) => api.patch<User>(`/users/${id}/approve`).then((r) => r.data);

// Function: rejectUser
// Kya kar raha hai: User ko reject karne ki request bhejta hai.
// Relation / Backend: Backend ke 'UsersController.reject' (PATCH /api/users/:id/reject) endpoint ko hit karta hai. 'PendingUsersPage.tsx' mein use hota hai.
export const rejectUser = (id: string) => api.patch<User>(`/users/${id}/reject`).then((r) => r.data);

// Function: updateUser
// Kya kar raha hai: User details (jaise Telegram Chat ID) update karta hai.
// Relation / Backend: Backend ke 'UsersController.update' (PATCH /api/users/:id) endpoint ko hit karta hai. 'TelegramIntegration.tsx' mein use hota hai.
export const updateUser = (id: string, data: Partial<User>) =>
  api.patch<User>(`/users/${id}`, data).then((r) => r.data);

// Function: unlinkTelegram
// Kya kar raha hai: Telegram ID unlink karta hai.
// Relation / Backend: Backend ke 'UsersController.unlinkTelegram' (DELETE /api/users/me/telegram) endpoint ko hit karta hai. 'TelegramIntegration.tsx' mein use hota hai.
export const unlinkTelegram = () => api.delete<User>('/users/me/telegram').then((r) => r.data);

