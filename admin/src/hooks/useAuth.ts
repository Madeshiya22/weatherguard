import { useQuery } from '@tanstack/react-query';
import { getMe, User } from '../api/users';

// Function: useAuth (Custom Hook)
// Kya kar raha hai: TanStack Query use karke logged-in user ka profile data fetch karta hai. Isme loading state, authentication state, aur admin validation logic hota hai.
// Relation / Backend & Components: Backend ke 'UsersController.getMe' (/api/users/me) ko call karta hai. Frontend mein 'DashboardPage.tsx', 'Layout.tsx', 'ProtectedRoute.tsx', aur 'AdminRoute.tsx' is hook ko call karte hain taaki unhe user info aur 'isAdmin' check mil sake.
export function useAuth() {
  const token = localStorage.getItem('token');

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!token, // Sirf tabhi fetch karega jab token localStorage mein ho
    retry: false,
  });

  // Function: logout
  // Kya kar raha hai: User ko logout karta hai by removing token from localStorage aur login page par redirect karta hai.
  // Relation / Component: 'Layout.tsx' ke header mein 'Sign out' button click karne par call hota hai.
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    logout,
  };
}

