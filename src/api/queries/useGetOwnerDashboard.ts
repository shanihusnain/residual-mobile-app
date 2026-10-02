import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";
import type { OwnerProfile } from "@/api/queries/useGetOwnerProperties";
import {
  parseStatProgress,
  type DashboardDateRange,
  type DashboardMilestone,
  type DashboardProject,
  type DashboardStat,
} from "@/api/queries/useGetContractorDashboard";

export type OwnerDashboardResponse = {
  stats: DashboardStat[];
  projects: DashboardProject[];
  upcomingMilestones: DashboardMilestone[];
  profile?: OwnerProfile;
  range?: {
    start_date: string;
    end_date: string;
  };
};

const getOwnerDashboard = async (
  range?: DashboardDateRange,
): Promise<OwnerDashboardResponse> => {
  const params: Record<string, string> = {};
  if (range?.startDate) params.start_date = range.startDate;
  if (range?.endDate) params.end_date = range.endDate;

  const response = await api.get<OwnerDashboardResponse>(
    "/functions/v1/owner-dashboard",
    { params },
  );
  return response.data;
};

export const useGetOwnerDashboard = (range?: DashboardDateRange) => {
  return useQuery({
    queryKey: [
      "owner-dashboard",
      range?.startDate ?? null,
      range?.endDate ?? null,
    ],
    queryFn: () => getOwnerDashboard(range),
  });
};

export { parseStatProgress };
