import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts, triggerAlert, Alert } from '../api/alerts';

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [triggered, setTriggered] = useState(false);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => getAlerts(20),
    refetchInterval: 30_000,
  });

  const triggerMutation = useMutation({
    mutationFn: triggerAlert,
    onSuccess: () => {
      setTriggered(true);
      setTimeout(() => {
        setTriggered(false);
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
      }, 3000);
    },
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weather Alerts</h1>
          <p className="text-sm text-gray-500">Alerts are sent automatically every 6 hours</p>
        </div>
        <button
          onClick={() => triggerMutation.mutate()}
          disabled={triggerMutation.isPending}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {triggerMutation.isPending ? '⏳ Queuing…' : '🚀 Trigger Manual Alert'}
        </button>
      </div>

      {triggered && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          ✅ Alert queued! It will be sent to all approved Telegram users shortly.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="text-4xl mb-3">🌤</div>
          <p className="text-gray-500">No alerts sent yet. Trigger one above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard key={alert._id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🌍</span>
            <span className="font-semibold text-gray-900">{alert.city}</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
              {alert.temperature}°C
            </span>
          </div>
          <p className="text-sm text-gray-600 capitalize">{alert.description}</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>{new Date(alert.createdAt).toLocaleString()}</p>
          <p className="mt-1 font-medium text-gray-600">
            📤 {alert.recipientCount} recipient{alert.recipientCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
