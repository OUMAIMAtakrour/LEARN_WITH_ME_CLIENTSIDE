import { create } from "zustand";
import { authService } from "../api/services/authService";
import { AuthState } from "../types/auth";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      if (response) {
        set({
          user: response.user,
          token: response.token,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      set({
        error: error.message || "Login failed",
        isLoading: false,
      });
      return false;
    }
  },
  register: async (name, email, password, profileImage = null) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(
        { name, email, password },
        profileImage
      );
      if (user) {
        set({
          user,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      set({
        error: error.message || "Registration failed",
        isLoading: false,
      });
      return false;
    }
  },
  logout: () => set({ user: null, token: null }),
}));
