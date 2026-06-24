import { useQuery } from '@tanstack/react-query';
import { getMe, User } from '../api/users';

export function useAuth() {
  const token = localStorage.getItem('token');

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!token,
    retry: false,
  });

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
