import axios from "axios";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string | string[];
          msg?: string;
          error_description?: string;
          error?: string;
        }
      | undefined;

    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }

    const raw =
      (typeof data?.message === "string" && data.message) ||
      data?.msg ||
      data?.error_description ||
      data?.error ||
      "";

    if (raw) {
      const lower = raw.toLowerCase();
      if (lower.includes("confirm") || lower.includes("not confirmed")) {
        return "Please confirm your email before signing in";
      }
      if (
        lower.includes("invalid login") ||
        lower.includes("invalid credentials") ||
        (error.response?.status === 400 && lower.includes("password"))
      ) {
        return "Invalid email or password";
      }
      if (
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        lower.includes("otp") ||
        lower.includes("token")
      ) {
        if (lower.includes("otp") || lower.includes("token") || lower.includes("code")) {
          return "Invalid or expired code. Request a new one.";
        }
      }
      return raw;
    }

    if (error.message === "Network Error") {
      return "Network error. Please check your connection and try again.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const showToast = (type: "success" | "error", message: string) => {
  Toast.show({
    type,
    text1: message,
    position: "top",
    visibilityTime: 3000,
    autoHide: true,
    topOffset: Platform.OS === "ios" ? 60 : 40,
  });
};
