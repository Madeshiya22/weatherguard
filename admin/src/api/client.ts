import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Function: interceptors.request.use
// Kya kar raha hai: Har outgoing API request ke pehle yeh interceptor chalta hai aur localStorage se JWT token nikaal kar 'Authorization: Bearer <token>' header attach kar deta hai.
// Relation / Backend: Backend ke 'JwtAuthGuard' (jwt.strategy.ts) ko token yahi se milta hai taaki woh verify kar sake ki user authentic hai.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Function: interceptors.response.use
// Kya kar raha hai: Backend se aane wale API response ko handle karta hai. Agar token expire ho chuka hai ya galat hai (status 401 Unauthorized aata hai), toh yeh token ko localStorage se remove karke user ko '/login' page par fek deta hai.
// Relation / Backend: Backend se aane wale 401 Unauthorized error code ko globally handle karta hai.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;

