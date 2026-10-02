import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";

const markAllNotificationsRead = async () => {
  const response = await api.post("/functions/v1/notifications", {
    mark_all: true,
  });
  return response.data;
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    mutationKey: ["mark-all-notifications-read"],
    onSuccess: async () => {
      showToast("success", "All notifications marked as read");
      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Could not mark notifications as read"),
      );
    },
  });
};
