import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";

const markNotificationRead = async (id: string) => {
  const response = await api.post("/functions/v1/notifications", {
    id,
  });
  return response.data;
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    mutationKey: ["mark-notification-read"],
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Could not mark notification as read"),
      );
    },
  });
};
