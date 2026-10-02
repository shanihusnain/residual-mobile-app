import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";
import { setRecoveryAccessToken } from "@/storage/tokenStorage";

import type { LoginResponse } from "./useLogin";

/** Dev/staging OTP is hardcoded server-side to `111111`. */
export const HARDCODED_RECOVERY_OTP = "111111";

type VerifyOtpResponse = LoginResponse & {
  data?: LoginResponse;
};

const forgotPasswordOtpValidation = async (email: string, otp: string) => {
  const response = await api.post<VerifyOtpResponse>(
    "/functions/v1/verify-otp",
    {
      type: "recovery",
      email: email.trim(),
      token: otp.trim(),
    },
  );

  const payload = response.data?.access_token
    ? response.data
    : response.data?.data;

  if (!payload?.access_token) {
    throw new Error("OTP verified but no recovery session was returned");
  }

  return payload;
};

export const useForgotPasswordOtpValidation = () => {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      forgotPasswordOtpValidation(email, otp),
    mutationKey: ["forgot-password-otp-validation"],
    onSuccess: async (data) => {
      // Recovery session only — do not treat as app login.
      await setRecoveryAccessToken(data.access_token);
      showToast("success", "OTP verified");
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Invalid OTP. Please try again."),
      );
    },
  });
};
