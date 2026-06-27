import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingUsers, approveUser, rejectUser, User } from '../api/users';

// Function: UserCard (Helper Component)
// Kya kar raha hai: Single pending user ka profile info aur Approve/Reject buttons display karta hai.
function UserCard({ user, onApprove, onReject, isPending }: {
  user: User;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-4">
        {user.avatar ? (
          <img src={user.avatar} alt="avatar" className="h-12 w-12 rounded-full" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-600">
            {user.name[0]}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            via {user.provider}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          disabled={isPending}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          ✓ Approve
        </button>
        <button
          onClick={onReject}
          disabled={isPending}
          className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
        >
          ✗ Reject
        </button>
      </div>
    </div>
  );
}

// Function: PendingUsersPage (Main Component)
// Kya kar raha hai: TanStack Query use karke pending users fetch karta hai aur Admin ko unko approve ya reject karne ki ability deta hai.
// Relation / Backend: Backend ke 'UsersController.findPending', 'UsersController.approve', aur 'UsersController.reject' endpoints ko hit karta hai.
export default function PendingUsersPage() {
  const queryClient = useQueryClient();
  
  // Function: useQuery (fetch pending users)
  // Kya kar raha hai: Har 15 seconds (refetchInterval: 15_000) mein GET /api/users/pending ko poll karta hai taaki naye requests live update hote rahein.
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: getPendingUsers,
    refetchInterval: 15_000,
  });

  // Function: approveMutation
  // Kya kar raha hai: PATCH /api/users/:id/approve API call karta hai. Success par queryClient.invalidateQueries(['users']) call karke UI ko turant refresh karta hai.
  const approveMutation = useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Function: rejectMutation
  // Kya kar raha hai: PATCH /api/users/:id/reject API call karta hai. Success par list refresh karta hai.
  const rejectMutation = useMutation({
    mutationFn: rejectUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Requests</h1>
          <p className="text-sm text-gray-500">{users.length} user{users.length !== 1 ? 's' : ''} awaiting approval</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-gray-500">No pending requests. All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onApprove={() => approveMutation.mutate(user._id)}
              onReject={() => rejectMutation.mutate(user._id)}
              isPending={approveMutation.isPending || rejectMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

