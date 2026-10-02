import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";

export type UnreadNotificationCountResponse = {
  unread_count: number;
};

const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await api.get<UnreadNotificationCountResponse>(
    "/functions/v1/notifications",
    { params: { unread_count: true } },
  );
  return response.data.unread_count ?? 0;
};

export const useGetUnreadNotificationCount = (options?: {
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadNotificationCount,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: true,
  });
};
