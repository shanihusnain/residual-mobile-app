import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";

export type DashboardStat = {
  label: string;
  value: string;
};

export type DashboardProject = {
  id: string;
  projectLabel: string;
  ownerName?: string;
  status: string;
  statusColor?: string;
  progress: number;
  currentStage: string;
  estimatedCompletion: string;
  estimatedCompletionIso?: string;
};

export type DashboardMilestone = {
  id: string;
  projectId: string;
  propertyName: string;
  milestoneName: string;
  dueDate: string;
  dueDateIso?: string;
  state?: string;
};

export type ContractorDashboardResponse = {
  stats: DashboardStat[];
  projects: DashboardProject[];
  upcomingMilestones: DashboardMilestone[];
  range?: {
    start_date: string;
    end_date: string;
  };
};

export type DashboardDateRange = {
  startDate?: string;
  endDate?: string;
};

const getContractorDashboard = async (
  range?: DashboardDateRange,
): Promise<ContractorDashboardResponse> => {
  const params: Record<string, string> = {};
  if (range?.startDate) params.start_date = range.startDate;
  if (range?.endDate) params.end_date = range.endDate;

  const response = await api.get<ContractorDashboardResponse>(
    "/functions/v1/contractor-dashboard",
    { params },
  );
  return response.data;
};

export const useGetContractorDashboard = (range?: DashboardDateRange) => {
  return useQuery({
    queryKey: [
      "contractor-dashboard",
      range?.startDate ?? null,
      range?.endDate ?? null,
    ],
    queryFn: () => getContractorDashboard(range),
  });
};

/** Parse "74%" → 74 for ProgressBar when the KPI is a percent. */
export function parseStatProgress(value: string): number | null {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*%$/);
  if (!match) return null;
  return Number(match[1]);
}
