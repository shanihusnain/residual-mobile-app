import { useQuery } from "@tanstack/react-query";

import { api } from "@/api";

export type ListingBroker = {
  id: string;
  broker_name?: string | null;
  agency_name?: string | null;
};

export type ListingProject = {
  id: string;
  name?: string | null;
  status?: string | null;
};

export type ListingPortal = {
  id: string;
  marketplace?: string | null;
  amount?: number | null;
  status?: string | null;
  external_url?: string | null;
  external_id?: string | null;
};

export type ListingOfferRow = {
  id: string;
  broker_id?: string | null;
  offer_amount?: number | null;
  difference_label?: string | null;
  received_at?: string | null;
  status?: string | null;
  subtext?: string | null;
  roi?: number | null;
  days_in_pipeline?: number | null;
  broker?: ListingBroker | null;
};

export type ListingRow = {
  id: string;
  title?: string | null;
  location?: string | null;
  listed_price?: number | null;
  highest_offer?: number | null;
  owner_name?: string | null;
  broker_id?: string | null;
  project_id?: string | null;
  status?: string | null;
  region?: string | null;
  offers_count?: number | null;
  listed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  property_details?: Record<string, unknown> | null;
  financials?: Record<string, unknown> | null;
  broker?: ListingBroker | null;
  project?: ListingProject | null;
  listing_portals?: ListingPortal[];
  listing_offers?: ListingOfferRow[];
};

const LIST_SELECT =
  "id,title,location,listed_price,highest_offer,owner_name,broker_id,project_id,status,region,offers_count,listed_at,created_at,updated_at,broker:brokers(id,broker_name,agency_name),project:projects(id,name,status)";

const DETAIL_SELECT =
  "id,title,location,listed_price,highest_offer,owner_name,broker_id,project_id,status,region,offers_count,property_details,financials,listed_at,created_at,updated_at,broker:brokers(id,broker_name,agency_name),project:projects(id,name,status),listing_portals(id,marketplace,amount,status,external_url,external_id),listing_offers(id,broker_id,offer_amount,difference_label,received_at,status,subtext,roi,days_in_pipeline,broker:brokers(id,broker_name,agency_name))";

const getListings = async (): Promise<ListingRow[]> => {
  const response = await api.get<ListingRow[]>("/rest/v1/listings", {
    params: {
      select: LIST_SELECT,
      order: "title.asc",
      limit: 200,
    },
  });
  return response.data;
};

const getListingById = async (id: string): Promise<ListingRow | null> => {
  const response = await api.get<ListingRow[]>("/rest/v1/listings", {
    params: {
      id: `eq.${id}`,
      select: DETAIL_SELECT,
    },
    headers: {
      Prefer: "return=representation",
    },
  });
  return response.data[0] ?? null;
};

export const useGetListings = () => {
  return useQuery({
    queryKey: ["listings"],
    queryFn: getListings,
  });
};

export const useGetListingDetail = (id?: string) => {
  return useQuery({
    queryKey: ["listing", id ?? null],
    queryFn: () => getListingById(id!),
    enabled: !!id,
  });
};

export function formatAed(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return `AED ${Math.round(amount).toLocaleString("en-AE")}`;
}
