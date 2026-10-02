import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";

export type CommunicationsPollResponse = {
  hasNew: boolean;
  latestAt: string | null;
  latestMessageId: string | null;
  threadCount: number;
  selectedThreadLatestAt?: string | null;
  selectedThreadLatestId?: string | null;
};

const pollCommunications = async (
  projectId: string,
  since?: string | null,
  threadId?: string | null,
): Promise<CommunicationsPollResponse> => {
  const params: Record<string, string> = {
    id: projectId,
    tab: "communications",
    poll: "true",
  };
  if (since) params.since = since;
  if (threadId) params.thread_id = threadId;

  const response = await api.get<CommunicationsPollResponse>(
    "/functions/v1/owner-project-detail",
    { params },
  );
  return response.data;
};

export const usePollProjectCommunications = (
  projectId?: string,
  since?: string | null,
  threadId?: string | null,
  enabled = true,
) => {
  return useQuery({
    queryKey: [
      "owner-comms-poll",
      projectId ?? null,
      since ?? null,
      threadId ?? null,
    ],
    queryFn: () => pollCommunications(projectId!, since, threadId),
    enabled: !!projectId && enabled,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
};
