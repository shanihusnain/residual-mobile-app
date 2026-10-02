import type { OwnerProjectDetail } from "@/api/queries/useGetOwnerProjectDetail";

/** Backend project status codes used by owner-properties / owner-project-detail. */
export const OWNER_PROJECT_STATUS = {
  offer_sent: "offer_sent",
  contract_signed: "contract_signed",
  site_handover: "site_handover",
  in_progress: "in_progress",
  completed: "completed",
  on_hold: "on_hold",
} as const;

export type OwnerProjectStatusCode =
  (typeof OWNER_PROJECT_STATUS)[keyof typeof OWNER_PROJECT_STATUS];

export type OwnerProjectStatusMeta = {
  code: OwnerProjectStatusCode;
  label: string;
  color: string;
  tone: "neutral" | "success" | "warning" | "danger" | "info";
};

/** Canonical status list for filters + display. */
export const OWNER_PROJECT_STATUSES: OwnerProjectStatusMeta[] = [
  {
    code: "offer_sent",
    label: "Offer Sent",
    color: "#FF9500",
    tone: "warning",
  },
  {
    code: "contract_signed",
    label: "Contract Signed",
    color: "#D3A05D",
    tone: "warning",
  },
  {
    code: "site_handover",
    label: "Site Handover",
    color: "#3B82F6",
    tone: "info",
  },
  {
    code: "in_progress",
    label: "Under Construction",
    color: "#22D3EE",
    tone: "info",
  },
  {
    code: "completed",
    label: "Completed",
    color: "#3F7D5E",
    tone: "success",
  },
  {
    code: "on_hold",
    label: "On Hold",
    color: "#989898",
    tone: "neutral",
  },
];

const BY_CODE = Object.fromEntries(
  OWNER_PROJECT_STATUSES.map((item) => [item.code, item]),
) as Record<OwnerProjectStatusCode, OwnerProjectStatusMeta>;

const BY_LABEL = Object.fromEntries(
  OWNER_PROJECT_STATUSES.map((item) => [item.label.toLowerCase(), item]),
) as Record<string, OwnerProjectStatusMeta>;

function normalizeStatusKey(value?: string | null) {
  return (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

/** Resolve status whether API sent a raw code or a display label. */
export function resolveOwnerProjectStatus(
  status?: string | null,
): OwnerProjectStatusMeta | null {
  if (!status?.trim()) return null;
  const raw = status.trim();
  const asCode = normalizeStatusKey(raw) as OwnerProjectStatusCode;
  if (BY_CODE[asCode]) return BY_CODE[asCode];
  return BY_LABEL[raw.toLowerCase()] ?? null;
}

export function formatOwnerProjectStatus(status?: string | null): string {
  return resolveOwnerProjectStatus(status)?.label ?? status?.trim() ?? "—";
}

export function ownerProjectStatusTone(
  status?: string | null,
): OwnerProjectStatusMeta["tone"] {
  return resolveOwnerProjectStatus(status)?.tone ?? "neutral";
}

export function ownerProjectStatusColor(status?: string | null): string | undefined {
  return resolveOwnerProjectStatus(status)?.color;
}

/**
 * Owners see full project details on every status except `offer_sent`.
 * Prefer explicit `documentsOnly`, then status code — do not infer from
 * `contractSigned` alone (that flag is easy to mis-read and caused redirect loops).
 */
export function isDocumentsOnlyProject(
  project?: Pick<OwnerProjectDetail, "documentsOnly" | "contractSigned" | "status"> | null,
): boolean {
  if (!project) return false;
  if (typeof project.documentsOnly === "boolean") return project.documentsOnly;
  const resolved = resolveOwnerProjectStatus(project.status);
  if (resolved) return resolved.code === "offer_sent";
  return false;
}

export function hasFullProjectAccess(
  project?: Pick<OwnerProjectDetail, "documentsOnly" | "contractSigned" | "status"> | null,
): boolean {
  return !isDocumentsOnlyProject(project);
}
