import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserData {
  email: string;
  name: string;
  userId: string;
  role: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      login: (userData) => set({ isLoggedIn: true, user: userData }),
      logout: () => set({ isLoggedIn: false, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
); 