import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email?: string;
  [key: string]: unknown;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: number;
  user: AuthUser;
};

const login = async ({
  email,
  password,
}: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/v1/token?grant_type=password",
    {
      email: email.trim(),
      password,
    },
  );
  return response.data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    mutationKey: ["login"],
    onSuccess: () => {
      showToast("success", "Login successful");
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Login failed"));
    },
  });
};
