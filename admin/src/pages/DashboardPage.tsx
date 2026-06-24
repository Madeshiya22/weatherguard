import { useAuth } from '../hooks/useAuth';
import TelegramIntegration from '../components/TelegramIntegration';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Account Info</h2>
          <div className="flex items-center gap-4">
            {user.avatar && (
              <img src={user.avatar} alt="avatar" className="h-16 w-16 rounded-full border-2 border-gray-200" />
            )}
            <div>
              <p className="text-xl font-bold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[user.status]}`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>

        <TelegramIntegration user={user} />
      </div>

      {user.status === 'pending' && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="font-semibold text-blue-900">What happens next?</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
            <li>An admin will review your access request</li>
            <li>Once approved, you'll receive a Telegram notification</li>
            <li>Link your Telegram account to start receiving weather alerts</li>
          </ul>
        </div>
      )}
    </div>
  );
}
