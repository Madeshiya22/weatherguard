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

// Function: getAlerts
// Kya kar raha hai: Purane saare weather alerts fetch karta hai.
// Relation / Backend: Backend ke 'AlertsController.getRecent' (GET /api/alerts) endpoint ko hit karta hai. Frontend ke 'AlertsPage.tsx' mein use hota hai.
export const getAlerts = (limit = 20) =>
  api.get<Alert[]>(`/alerts?limit=${limit}`).then((r) => r.data);

// Function: triggerAlert
// Kya kar raha hai: Manual weather alert broadcast execute karta hai.
// Relation / Backend: Backend ke 'AlertsController.triggerManual' (POST /api/alerts/trigger) endpoint ko hit karta hai. Frontend ke 'AlertsPage.tsx' mein 'Trigger Manual Alert' button dabane par call hota hai.
export const triggerAlert = () =>
  api.post<{ queued: boolean }>('/alerts/trigger').then((r) => r.data);

