import { create } from "zustand";
import { authService } from "../api/services/authService";
import { AuthState } from "../types/auth";
import { AxiosError } from "axios";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  access_token: null,
  refresh_token: null,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    console.log("useAuthStore login called with:", { email, password });
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login({ email, password });
      console.log("authService.login response:", response);

      if (response && response.access_token) {
        set({
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          isLoading: false,
          error: null,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("useAuthStore login error details:", error);

      let errorMessage = "Login failed";
      if (error instanceof ApolloError) {
        errorMessage = error.message || errorMessage;
        if (error.graphQLErrors?.length > 0) {
          errorMessage = error.graphQLErrors[0].message || errorMessage;
        }
      }

      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  register: async (name, email, password, profileImage = null) => {
    console.log("useAuthStore register called with:", {
      name,
      email,
      password,
      profileImage,
    });
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(
        { name, email, password },
        profileImage
      );
      console.log("authService.register response:", user);
      if (user) {
        set({
          user,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error("useAuthStore register error:", axiosError.message);
      set({
        error: axiosError.message || "Registration failed",
        isLoading: false,
      });
      return false;
    }
  },
  logout: () => set({ user: null, token: null }),
}));
