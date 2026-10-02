import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

import {
  formatAed,
  useGetListingDetail,
} from "@/api/queries/useGetListings";
import { fonts } from "@/assets/fonts";
import { StatusPill } from "@/components/ui/primitives";
import { getApiErrorMessage } from "@/config/toastConfig";
import { Colors, Radius, Spacing } from "@/constants/theme";

function listingTone(status?: string | null) {
  if (status === "On Market") return "success" as const;
  if (status === "Under Offer") return "info" as const;
  return "neutral" as const;
}

function offerTone(status?: string | null) {
  if (status === "Accepted") return "success" as const;
  if (status === "Reviewing" || status === "Pending") return "warning" as const;
  if (status === "Declined" || status === "Rejected") return "danger" as const;
  if (status === "Countered") return "info" as const;
  return "neutral" as const;
}

function detailValue(
  details: Record<string, unknown> | null | undefined,
  ...keys: string[]
): string {
  if (!details) return "—";
  for (const key of keys) {
    const value = details[key];
    if (value == null || value === "") continue;
    return String(value);
  }
  return "—";
}

function financialNumber(
  financials: Record<string, unknown> | null | undefined,
  ...keys: string[]
): number | null {
  if (!financials) return null;
  for (const key of keys) {
    const value = financials[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: listing, isLoading, isError, error, refetch, isRefetching } =
    useGetListingDetail(id);

  if (isLoading && !listing) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <SymbolView
            name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
            size={22}
            tintColor={Colors.light.darkGray}
          />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.missing}>
          {isError
            ? getApiErrorMessage(error, "Listing not found.")
            : "Listing not found."}
        </Text>
      </View>
    );
  }

  const details = listing.property_details ?? undefined;
  const financials = listing.financials ?? undefined;
  const portals = listing.listing_portals ?? [];
  const offers = listing.listing_offers ?? [];
  const broker =
    listing.broker?.agency_name ||
    listing.broker?.broker_name ||
    "—";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconBtn}>
          <SymbolView
            name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
            size={22}
            tintColor={Colors.light.darkGray}
          />
        </Pressable>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {listing.title ?? "Listing"}
            </Text>
            <StatusPill
              label={listing.status ?? "—"}
              tone={listingTone(listing.status)}
            />
          </View>
          <Text style={styles.subtitle}>
            Broker: {broker} · Owner: {listing.owner_name ?? "—"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View style={styles.statsRow}>
          <StatCard label="Listed Price" value={formatAed(listing.listed_price)} />
          <StatCard
            label="Highest Offer"
            value={formatAed(listing.highest_offer)}
          />
          <StatCard
            label="Offers Received"
            value={String(listing.offers_count ?? offers.length)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Listing Details</Text>
          <View style={styles.detailsGrid}>
            <Detail
              label="Property type"
              value={detailValue(details, "propertyType", "property_type", "type")}
            />
            <Detail
              label="Bedrooms"
              value={detailValue(details, "bedrooms", "beds")}
            />
            <Detail
              label="Bathrooms"
              value={detailValue(details, "bathrooms", "baths")}
            />
            <Detail
              label="Parking Bays"
              value={detailValue(details, "parkingBays", "parking_bays", "parking")}
            />
            <Detail
              label="Area"
              value={detailValue(details, "area", "buaLabel", "bua_sqft", "size")}
            />
            <Detail label="Floor" value={detailValue(details, "floor")} />
            <Detail
              label="Listed date"
              value={listing.listed_at ?? detailValue(details, "listedDate", "listed_date")}
            />
            <Detail
              label="Location"
              value={listing.location ?? "—"}
            />
            <Detail
              label="DLD permit"
              value={detailValue(details, "dldPermit", "dld_permit", "dldZoneCode")}
            />
            <Detail
              label="Permit expiry"
              value={detailValue(details, "permitExpiry", "permit_expiry")}
            />
          </View>
        </View>

        {portals.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Linked Listings</Text>
            {portals.map((portal) => (
              <Pressable
                key={portal.id}
                style={styles.portalRow}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/listings/portal",
                    params: { listingId: listing.id, portalId: portal.id },
                  })
                }
              >
                <View style={styles.portalCopy}>
                  <Text style={styles.portalName}>
                    {portal.marketplace ?? "Portal"}
                  </Text>
                  <Text style={styles.portalPrice}>
                    {formatAed(portal.amount)}
                  </Text>
                </View>
                <StatusPill
                  label={portal.status ?? "—"}
                  tone={portal.status === "Live" ? "success" : "neutral"}
                />
                <SymbolView
                  name={{
                    ios: "chevron.right",
                    android: "chevron_right",
                    web: "chevron_right",
                  }}
                  size={16}
                  tintColor={Colors.light.textSecondary}
                />
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Financials</Text>
          <View style={styles.finGrid}>
            <Fin
              label="Original value"
              value={formatAed(
                financialNumber(financials, "originalValue", "original_value"),
              )}
            />
            <Fin
              label="Reno spend"
              value={formatAed(
                financialNumber(financials, "renoSpend", "reno_spend"),
              )}
            />
            <Fin
              label="Total cost basis"
              value={formatAed(
                financialNumber(
                  financials,
                  "totalCostBasis",
                  "total_cost_basis",
                ),
              )}
            />
            <Fin
              label="Listed price"
              value={formatAed(
                financialNumber(financials, "listedPrice", "listed_price") ??
                  listing.listed_price,
              )}
            />
            <Fin
              label="Gross uplift (Est)"
              value={formatAed(
                financialNumber(
                  financials,
                  "grossUpliftEst",
                  "gross_uplift_est",
                ),
              )}
              highlight
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Offers</Text>
          {offers.length === 0 ? (
            <Text style={styles.emptyOffers}>No offers yet.</Text>
          ) : (
            offers.map((offer) => (
              <Pressable
                key={offer.id}
                style={styles.offerRow}
                onPress={() => router.push(`/(app)/offers/${offer.id}`)}
              >
                <View style={styles.offerTop}>
                  <Text style={styles.offerBroker}>
                    {offer.broker?.agency_name ||
                      offer.broker?.broker_name ||
                      "Offer"}
                  </Text>
                  <StatusPill
                    label={offer.status ?? "—"}
                    tone={offerTone(offer.status)}
                  />
                </View>
                <Text style={styles.offerAmount}>
                  {formatAed(offer.offer_amount)}
                </Text>
                <Text style={styles.offerMeta}>
                  {offer.difference_label ?? "—"}
                  {offer.received_at ? ` · Received ${offer.received_at}` : ""}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function Fin({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.finItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.finValue, highlight && styles.finHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.page },
  loader: { marginTop: Spacing.six },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  iconBtn: { padding: Spacing.one, marginTop: 2 },
  headerCopy: { flex: 1, gap: 4 },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontFamily: fonts.inter18.semiBold,
    fontSize: 20,
    color: Colors.light.black,
  },
  subtitle: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    padding: Spacing.four,
  },
  backText: {
    fontFamily: fonts.inter18.medium,
    fontSize: 16,
    color: Colors.light.darkGray,
  },
  missing: {
    paddingHorizontal: Spacing.four,
    fontFamily: fonts.inter18.regular,
    color: Colors.light.textSecondary,
  },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: 4,
  },
  statLabel: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  statValue: {
    fontFamily: fonts.inter18.bold,
    fontSize: 16,
    color: Colors.light.black,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.black,
    marginBottom: Spacing.one,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  detailItem: {
    width: "45%",
    flexGrow: 1,
    gap: 2,
  },
  detailLabel: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    fontFamily: fonts.inter18.medium,
    fontSize: 14,
    color: Colors.light.black,
  },
  portalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
  },
  portalCopy: { flex: 1, gap: 2 },
  portalName: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.black,
  },
  portalPrice: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  finGrid: { gap: Spacing.two },
  finItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  finValue: {
    fontFamily: fonts.inter18.medium,
    fontSize: 14,
    color: Colors.light.black,
  },
  finHighlight: {
    fontFamily: fonts.inter18.semiBold,
    color: Colors.light.green,
  },
  offerRow: {
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
  },
  offerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.two,
  },
  offerBroker: {
    flex: 1,
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.black,
  },
  offerAmount: {
    fontFamily: fonts.inter18.bold,
    fontSize: 16,
    color: Colors.light.black,
  },
  offerMeta: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  emptyOffers: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
});
