import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";

export type OwnerProfile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

export type OwnerProject = {
  id: string;
  projectLabel: string;
  ownerName?: string;
  startDate?: string;
  progress: number;
  status: string;
  statusColor?: string;
  trackStatus?: string;
  trackStatusColor?: string;
  currentStage: string;
  estimatedCompletion: string;
  estimatedCompletionIso?: string;
};

export type OwnerPropertiesResponse = {
  profile: OwnerProfile;
  projects: OwnerProject[];
};

export type OwnerPropertiesParams = {
  q?: string;
  status?: string;
};

const getOwnerProperties = async (
  params?: OwnerPropertiesParams,
): Promise<OwnerPropertiesResponse> => {
  const query: Record<string, string> = {};
  if (params?.q?.trim()) query.q = params.q.trim();
  if (params?.status && params.status !== "All") {
    query.status = params.status;
  }

  const response = await api.get<OwnerPropertiesResponse>(
    "/functions/v1/owner-properties",
    { params: query },
  );
  return response.data;
};

export const useGetOwnerProperties = (params?: OwnerPropertiesParams) => {
  return useQuery({
    queryKey: [
      "owner-properties",
      params?.q?.trim() || null,
      params?.status && params.status !== "All" ? params.status : null,
    ],
    queryFn: () => getOwnerProperties(params),
  });
};
