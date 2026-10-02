import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";

export type TimelineState = "complete" | "current" | "upcoming";

export type ProjectTimelineItem = {
  id: string;
  title: string;
  state: TimelineState;
};

export type ProjectKeyDate = {
  label: string;
  value: string;
  valueIso?: string;
};

export type ProjectOverview = {
  overallProgress: number;
  overallProgressLabel: string;
  currentMilestone: string;
  daysRemaining: number;
  daysRemainingLabel: string;
  phaseProgress: number;
  phaseProgressLabel: string;
  timeline: ProjectTimelineItem[];
  keyDates: ProjectKeyDate[];
};

export type ProjectPropertyInfo = {
  address?: string | null;
  community?: string | null;
  propertyType?: string | null;
  dldZoneCode?: string | null;
  subType?: string | null;
  buaSqft?: number | null;
  buaLabel?: string | null;
  plotSizeSqft?: number | null;
  plotSizeLabel?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parkingBays?: number | null;
  floor?: string | null;
  currentLayout?: string | null;
  hasPool?: boolean | null;
  hasBuildingPool?: boolean | null;
  poolLabel?: string | null;
  hasGarden?: boolean | null;
  gardenLabel?: string | null;
  viewDescription?: string | null;
  yearBuilt?: number | null;
  propertyAge?: string | null;
};

export type OwnerProjectDocument = {
  id: string;
  title: string;
  fileType: string;
  uploadedBy: string;
  uploadDate: string;
  uploadDateIso?: string;
  status: string;
  statusRaw?: string;
  category: string;
  downloadUrl?: string | null;
};

export type ProjectMilestone = {
  id: string;
  title: string;
  targetDate?: string | null;
  targetDateIso?: string | null;
  completionDate?: string | null;
  completionDateIso?: string | null;
  completionNote?: string | null;
  completionDisplay?: string | null;
  status: string;
  statusRaw?: string;
  badge?: string | null;
  description?: string | null;
};

export type CommThread = {
  id: string;
  reference: string;
  title: string;
  status: string;
  statusRaw?: string;
  date: string;
  dateIso?: string;
  alertCount?: number;
  messageCount?: number;
};

export type CommMessage = {
  id: string;
  body: string;
  senderName: string;
  senderRole?: string;
  side: "outgoing" | "incoming";
  sentAt: string;
  sentAtIso?: string;
};

export type CommThreadDetail = CommThread & {
  messages: CommMessage[];
};

export type OwnerProjectDetail = {
  id: string;
  projectLabel: string;
  leadId?: string;
  propertyId?: string;
  /** Backend status code (e.g. offer_sent) or label. */
  status?: string;
  /** true when status is offer_sent — KYC/contract docs only. */
  documentsOnly?: boolean;
  /** true when not documents-only (contract signed and beyond). */
  contractSigned?: boolean;
  allowedUploadCategories?: string[];
  overview?: ProjectOverview;
  property?: ProjectPropertyInfo;
};

export type OwnerKycItem = {
  id: string;
  title: string;
  status?: string | null;
  document_id?: string | null;
  category?: string | null;
  sort_order?: number | null;
};

export type OwnerProjectDetailResponse = {
  project: OwnerProjectDetail;
  kycDocuments?: OwnerProjectDocument[];
  projectDocuments?: OwnerProjectDocument[];
  kycItems?: OwnerKycItem[];
  overallProgress?: number;
  overallProgressLabel?: string;
  timeline?: ProjectTimelineItem[];
  milestones?: ProjectMilestone[];
  reports?: OwnerProjectDocument[];
  threads?: CommThread[];
  thread?: CommThreadDetail | null;
};

export type OwnerProjectDetailTab =
  | "overview"
  | "property"
  | "documents"
  | "milestones"
  | "reports"
  | "communications"
  | undefined;

const getOwnerProjectDetail = async (
  id: string,
  tab?: OwnerProjectDetailTab,
  threadId?: string,
): Promise<OwnerProjectDetailResponse> => {
  const params: Record<string, string> = { id };
  if (tab) params.tab = tab;
  if (threadId) params.thread_id = threadId;

  const response = await api.get<OwnerProjectDetailResponse>(
    "/functions/v1/owner-project-detail",
    { params },
  );
  return response.data;
};

export const useGetOwnerProjectDetail = (
  id?: string,
  tab?: OwnerProjectDetailTab,
  threadId?: string,
) => {
  return useQuery({
    queryKey: [
      "owner-project-detail",
      id ?? null,
      tab ?? "overview",
      threadId ?? null,
    ],
    queryFn: () => getOwnerProjectDetail(id!, tab, threadId),
    enabled: !!id,
  });
};
