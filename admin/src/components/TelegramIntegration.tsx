import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, updateUser, unlinkTelegram } from '../api/users';

interface TelegramIntegrationProps {
  user: User;
}

export default function TelegramIntegration({ user }: TelegramIntegrationProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [chatId, setChatId] = useState(user.telegramChatId || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (newChatId: string) => updateUser(user._id, { telegramChatId: newChatId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditing(false);
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save Telegram Chat ID');
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: () => unlinkTelegram(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setChatId('');
      setIsEditing(false);
      setError('');
    },
  });

  const handleSave = () => {
    if (!/^\d{5,}$/.test(chatId)) {
      setError('Please enter a valid numeric Telegram Chat ID.');
      return;
    }
    setError('');
    updateMutation.mutate(chatId);
  };

  if (user.status !== 'approved') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">Telegram Integration</h2>
        <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          ⏳ Your account is <strong>{user.status}</strong>. You can link Telegram once approved.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-gray-800">Telegram Integration</h2>
      <p className="mb-4 text-sm text-gray-500">
        Start the bot, send <code className="rounded bg-gray-100 px-1">/start</code>, then paste your Chat ID here.
      </p>

      {user.telegramChatId && !isEditing ? (
        <div className="space-y-3">
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
            ✅ Linked — Chat ID: <strong>{user.telegramChatId}</strong>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setChatId(user.telegramChatId || '');
                setIsEditing(true);
                setError('');
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit Chat ID
            </button>
            <button
              onClick={() => unlinkMutation.mutate()}
              disabled={unlinkMutation.isPending}
              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {unlinkMutation.isPending ? 'Unlinking…' : 'Unlink'}
            </button>
          </div>
          {saved && <p className="text-sm text-green-600">✅ Chat ID saved!</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatId}
              onChange={(e) => {
                setChatId(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 123456789"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleSave}
              disabled={!chatId || updateMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save'}
            </button>
            {user.telegramChatId && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setChatId(user.telegramChatId || '');
                  setError('');
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
