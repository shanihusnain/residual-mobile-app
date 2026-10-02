import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

import { api } from "@/api";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";
import {
  clearAuthTokens,
  clearRecoveryAccessToken,
  getRecoveryAccessToken,
} from "@/storage/tokenStorage";

export type ResetPasswordPayload = {
  newPassword: string;
  confirmNewPassword: string;
};

const resetPassword = async (payload: ResetPasswordPayload) => {
  if (payload.newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (payload.newPassword !== payload.confirmNewPassword) {
    throw new Error("Passwords do not match");
  }

  const recoveryToken = await getRecoveryAccessToken();
  if (!recoveryToken) {
    throw new Error("Missing recovery session. Verify your code again.");
  }

  const response = await api.put(
    "/auth/v1/user",
    { password: payload.newPassword },
    {
      headers: {
        Authorization: `Bearer ${recoveryToken}`,
      },
    },
  );

  try {
    await api.post(
      "/auth/v1/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${recoveryToken}`,
        },
      },
    );
  } catch {
    // Ignore logout failures after password update
  }

  await clearRecoveryAccessToken();
  await clearAuthTokens();

  return response.data;
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
    mutationKey: ["reset-password"],
    onSuccess: () => {
      showToast("success", "Password updated successfully");
      setTimeout(() => {
        router.replace("/(auth)/password-updated");
      }, 400);
    },
    onError: (error) => {
      showToast("error", getApiErrorMessage(error, "Password reset failed"));
    },
  });
};
