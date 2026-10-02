import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";

export type ContractorNotification = {
  id: string;
  user_id: string;
  type?: string;
  title: string;
  body: string;
  entity_type?: string | null;
  entity_id?: string | null;
  href?: string | null;
  read_at: string | null;
  created_at: string;
};

export type ContractorNotificationsResponse = {
  notifications: ContractorNotification[];
};

export type NotificationsListParams = {
  limit?: number;
  unreadOnly?: boolean;
};

const getContractorNotifications = async (
  params?: NotificationsListParams,
): Promise<ContractorNotification[]> => {
  const response = await api.get<ContractorNotificationsResponse>(
    "/functions/v1/notifications",
    {
      params: {
        limit: params?.limit ?? 50,
        ...(params?.unreadOnly ? { unread_only: true } : {}),
      },
    },
  );
  return response.data.notifications ?? [];
};

export const useGetContractorNotifications = (
  params?: NotificationsListParams,
) => {
  return useQuery({
    queryKey: [
      "notifications",
      params?.limit ?? 50,
      params?.unreadOnly ?? false,
    ],
    queryFn: () => getContractorNotifications(params),
  });
};

export type NotificationSectionKey = "TODAY" | "YESTERDAY" | "EARLIER";

export type NotificationSection = {
  title: NotificationSectionKey;
  data: ContractorNotification[];
};

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getNotificationDayBucket(
  createdAt: string,
  now = new Date(),
): NotificationSectionKey {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "EARLIER";

  const today = startOfLocalDay(now).getTime();
  const day = startOfLocalDay(created).getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (day === today) return "TODAY";
  if (day === today - oneDay) return "YESTERDAY";
  return "EARLIER";
}

export function groupNotificationsByDay(
  items: ContractorNotification[],
): NotificationSection[] {
  const buckets: Record<NotificationSectionKey, ContractorNotification[]> = {
    TODAY: [],
    YESTERDAY: [],
    EARLIER: [],
  };

  for (const item of items) {
    buckets[getNotificationDayBucket(item.created_at)].push(item);
  }

  return (["TODAY", "YESTERDAY", "EARLIER"] as const)
    .filter((key) => buckets[key].length > 0)
    .map((title) => ({ title, data: buckets[title] }));
}

export function formatNotificationTime(createdAt: string): string {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "";

  const diffMs = Date.now() - created.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return created.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
