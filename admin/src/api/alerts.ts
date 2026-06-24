import api from './client';

export interface Alert {
  _id: string;
  city: string;
  message: string;
  temperature: number;
  description: string;
  recipientCount: number;
  triggeredAt: string;
  createdAt: string;
}

export const getAlerts = (limit = 20) =>
  api.get<Alert[]>(`/alerts?limit=${limit}`).then((r) => r.data);

export const triggerAlert = () =>
  api.post<{ queued: boolean }>('/alerts/trigger').then((r) => r.data);
