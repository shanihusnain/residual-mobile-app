import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";

const forgotPassword = async (email: string) => {
  const response = await api.post("/auth/v1/recover", {
    email: email.trim(),
  });
  return response.data ?? {};
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
    mutationKey: ["forgot-password"],
    onSuccess: () => {
      showToast("success", "OTP sent successfully");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Failed to send reset instructions"),
      );
    },
  });
};
