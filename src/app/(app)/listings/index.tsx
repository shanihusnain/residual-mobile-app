import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SymbolView } from "expo-symbols";

import {
  formatAed,
  useGetListings,
  type ListingRow,
} from "@/api/queries/useGetListings";
import { fonts } from "@/assets/fonts";
import { HeaderBar, Screen, StatusPill } from "@/components/ui/primitives";
import { getApiErrorMessage } from "@/config/toastConfig";
import { Colors, Radius, Spacing } from "@/constants/theme";

function statusTone(status?: string | null) {
  if (status === "On Market") return "success" as const;
  if (status === "Under Offer") return "info" as const;
  if (status === "Sold") return "warning" as const;
  return "neutral" as const;
}

function brokerLabel(item: ListingRow) {
  return (
    item.broker?.agency_name ||
    item.broker?.broker_name ||
    "—"
  );
}

function ListingRowCard({ item }: { item: ListingRow }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(app)/listings/${item.id}`)}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardCopy}>
          <Text style={styles.title}>{item.title ?? "Listing"}</Text>
          <Text style={styles.location}>{item.location ?? "—"}</Text>
        </View>
        <StatusPill
          label={item.status ?? "—"}
          tone={statusTone(item.status)}
        />
      </View>

      <View style={styles.metaGrid}>
        <Meta label="Amount" value={formatAed(item.listed_price)} />
        <Meta label="Broker" value={brokerLabel(item)} />
        <Meta
          label="Offers"
          value={`${item.offers_count ?? 0} offer${(item.offers_count ?? 0) === 1 ? "" : "s"}`}
        />
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetails}>View details</Text>
        <SymbolView
          name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
          size={16}
          tintColor={Colors.light.primary}
        />
      </View>
    </Pressable>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function ListingsScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetListings();
  const listings = data ?? [];

  return (
    <Screen padded={false}>
      <View style={styles.pad}>
        <HeaderBar
          title="Listings"
          subtitle="Manage property acquisition offers and negotiations."
          showMenu
          showBell
        />
      </View>
      {isLoading && listings.length === 0 ? (
        <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
      ) : isError && listings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn’t load listings</Text>
          <Text style={styles.emptyBody}>
            {getApiErrorMessage(error, "Please try again.")}
          </Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.retry}>Tap to retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          renderItem={({ item }) => <ListingRowCard item={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptyBody}>
                Listings will appear here once properties go on market.
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: Spacing.four },
  loader: { marginTop: Spacing.six },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  cardCopy: { flex: 1, gap: 4 },
  title: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.black,
  },
  location: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  metaGrid: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  metaItem: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    fontFamily: fonts.inter18.regular,
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  metaValue: {
    fontFamily: fonts.inter18.medium,
    fontSize: 13,
    color: Colors.light.black,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
    paddingTop: Spacing.two,
  },
  viewDetails: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 13,
    color: Colors.light.primary,
  },
  empty: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  emptyTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.black,
  },
  emptyBody: {
    fontFamily: fonts.inter18.regular,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  retry: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.primary,
  },
});
