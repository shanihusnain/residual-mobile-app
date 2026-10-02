import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";
import { getAccessToken } from "@/storage/tokenStorage";

const logout = async () => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return null;
  }

  const response = await api.post(
    "/auth/v1/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    mutationKey: ["logout"],
    onSuccess: () => {
      queryClient.clear();
      showToast("success", "Logged out successfully");
    },
    onError: (error) => {
      queryClient.clear();
      showToast("error", getApiErrorMessage(error, "Logout failed"));
    },
  });
};
