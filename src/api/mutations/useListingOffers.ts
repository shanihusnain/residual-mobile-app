import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";

export type OfferListing = {
  id: string;
  title?: string | null;
  location?: string | null;
  status?: string | null;
  region?: string | null;
  listed_price?: number | null;
  owner_name?: string | null;
  broker_id?: string | null;
  project_id?: string | null;
  financials?: Record<string, unknown> | null;
  broker?: {
    id: string;
    broker_name?: string | null;
    agency_name?: string | null;
  } | null;
};

export type OfferBroker = {
  id: string;
  broker_name?: string | null;
  agency_name?: string | null;
};

export type ListingOffer = {
  id: string;
  listing_id: string;
  broker_id?: string | null;
  offer_amount?: number | null;
  difference_label?: string | null;
  received_at?: string | null;
  status?: string | null;
  subtext?: string | null;
  roi?: number | null;
  days_in_pipeline?: number | null;
  listing?: OfferListing | null;
  broker?: OfferBroker | null;
};

const LIST_SELECT =
  "id,listing_id,offer_amount,difference_label,received_at,status,subtext,roi,days_in_pipeline,listing:listings!inner(id,title,location,status,region,listed_price,owner_name,broker_id,project_id)";

const DETAIL_SELECT =
  "id,listing_id,broker_id,offer_amount,difference_label,received_at,status,subtext,roi,days_in_pipeline,broker:brokers(id,broker_name,agency_name),listing:listings(id,title,location,listed_price,owner_name,status,region,financials,broker:brokers(id,broker_name,agency_name))";

const getOffers = async (): Promise<ListingOffer[]> => {
  const response = await api.get<ListingOffer[]>("/rest/v1/listing_offers", {
    params: {
      select: LIST_SELECT,
      "listing.project_id": "not.is.null",
      order: "received_at.desc",
      limit: 200,
    },
  });
  return response.data;
};

const getOfferById = async (id: string): Promise<ListingOffer | null> => {
  const response = await api.get<ListingOffer[]>("/rest/v1/listing_offers", {
    params: {
      id: `eq.${id}`,
      select: DETAIL_SELECT,
    },
  });
  return response.data[0] ?? null;
};

export type RespondOfferPayload = {
  id: string;
  listingId?: string;
  status: string;
  offer_amount?: number;
  difference_label?: string;
  subtext?: string;
};

const respondToOffer = async (payload: RespondOfferPayload) => {
  const body: Record<string, unknown> = { status: payload.status };
  if (payload.offer_amount != null) body.offer_amount = payload.offer_amount;
  if (payload.difference_label != null) {
    body.difference_label = payload.difference_label;
  }
  if (payload.subtext != null) body.subtext = payload.subtext;

  const response = await api.patch<ListingOffer[]>(
    "/rest/v1/listing_offers",
    body,
    {
      params: { id: `eq.${payload.id}` },
      headers: { Prefer: "return=representation" },
    },
  );
  return response.data[0] ?? null;
};

export const useGetListingOffers = () => {
  return useQuery({
    queryKey: ["listing-offers"],
    queryFn: getOffers,
  });
};

export const useGetListingOfferDetail = (id?: string) => {
  return useQuery({
    queryKey: ["listing-offer", id ?? null],
    queryFn: () => getOfferById(id!),
    enabled: !!id,
  });
};

export const useRespondToOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: respondToOffer,
    mutationKey: ["respond-to-offer"],
    onSuccess: async (_data, variables) => {
      showToast("success", `Offer ${variables.status.toLowerCase()}`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["listing-offers"] }),
        queryClient.invalidateQueries({
          queryKey: ["listing-offer", variables.id],
        }),
        queryClient.invalidateQueries({ queryKey: ["listings"] }),
        variables.listingId
          ? queryClient.invalidateQueries({
              queryKey: ["listing", variables.listingId],
            })
          : Promise.resolve(),
      ]);
    },
    onError: (error) => {
      showToast(
        "error",
        getApiErrorMessage(error, "Could not update offer"),
      );
    },
  });
};

export function formatAed(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `AED ${Math.round(amount).toLocaleString("en-AE")}`;
}

export function parseDifferencePercent(label?: string | null): number | null {
  if (!label) return null;
  const match = label.replace(/[−–]/g, "-").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}
