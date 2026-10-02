import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import type {
  CommMessage,
  CommThreadDetail,
} from "@/api/queries/useGetOwnerProjectDetail";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";

export type SendMessagePayload = {
  projectId: string;
  threadId: string;
  body: string;
  draft?: boolean;
};

export type CreateThreadPayload = {
  projectId: string;
  title: string;
  body?: string;
};

export type UpdateThreadStatusPayload = {
  projectId: string;
  threadId: string;
  status: "open" | "answered" | "closed";
};

const sendMessage = async (payload: SendMessagePayload) => {
  const response = await api.post<{
    message?: CommMessage;
    draft?: boolean;
    body?: string;
    thread_id?: string;
  }>("/functions/v1/owner-project-detail", {
    action: "send_message",
    project_id: payload.projectId,
    thread_id: payload.threadId,
    body: payload.body,
    ...(payload.draft ? { draft: true } : {}),
  });
  return response.data;
};

const createThread = async (payload: CreateThreadPayload) => {
  const response = await api.post<{ thread: CommThreadDetail }>(
    "/functions/v1/owner-project-detail",
    {
      action: "create_thread",
      project_id: payload.projectId,
      title: payload.title,
      ...(payload.body ? { body: payload.body } : {}),
    },
  );
  return response.data;
};

const updateThreadStatus = async (payload: UpdateThreadStatusPayload) => {
  const response = await api.post("/functions/v1/owner-project-detail", {
    action: "update_status",
    project_id: payload.projectId,
    thread_id: payload.threadId,
    status: payload.status,
  });
  return response.data;
};

export const useSendProjectMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    mutationKey: ["send-project-message"],
    onSuccess: async (_data, variables) => {
      if (variables.draft) return;
      await queryClient.invalidateQueries({
        queryKey: ["owner-project-detail", variables.projectId],
      });
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Could not send message"),
      );
    },
  });
};

export const useCreateProjectThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createThread,
    mutationKey: ["create-project-thread"],
    onSuccess: async (_data, variables) => {
      showToast("success", "Thread created");
      await queryClient.invalidateQueries({
        queryKey: ["owner-project-detail", variables.projectId],
      });
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Could not create thread"),
      );
    },
  });
};

export const useUpdateThreadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateThreadStatus,
    mutationKey: ["update-thread-status"],
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["owner-project-detail", variables.projectId],
      });
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Could not update status"),
      );
    },
  });
};
