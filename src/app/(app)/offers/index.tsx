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
  useGetListingOffers,
  type ListingOffer,
} from "@/api/mutations/useListingOffers";
import { fonts } from "@/assets/fonts";
import { HeaderBar, Screen, StatusPill } from "@/components/ui/primitives";
import { getApiErrorMessage } from "@/config/toastConfig";
import { Colors, Radius, Spacing } from "@/constants/theme";

function statusTone(status?: string | null) {
  if (status === "Accepted") return "success" as const;
  if (status === "Reviewing") return "info" as const;
  if (status === "Countered") return "warning" as const;
  if (status === "Declined") return "danger" as const;
  return "neutral" as const;
}

function OfferRow({ item }: { item: ListingOffer }) {
  const listing = item.listing;
  const diff = item.difference_label ?? "—";
  const isNegative = /[-−–]/.test(diff) && !diff.startsWith("+");

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(app)/offers/${item.id}`)}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardCopy}>
          <Text style={styles.title}>{listing?.title ?? "Offer"}</Text>
          <Text style={styles.location}>{listing?.location ?? "—"}</Text>
        </View>
        <StatusPill
          label={item.status ?? "—"}
          tone={statusTone(item.status)}
        />
      </View>

      <View style={styles.metaGrid}>
        <Meta
          label="Broker"
          value={
            item.broker?.agency_name ||
            item.broker?.broker_name ||
            listing?.owner_name ||
            "—"
          }
        />
        <Meta label="Offer Amount" value={formatAed(item.offer_amount)} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Difference</Text>
          <Text
            style={[
              styles.metaValue,
              {
                color: isNegative
                  ? Colors.light.red
                  : diff.includes("+")
                    ? Colors.light.green
                    : Colors.light.textSecondary,
              },
            ]}
          >
            {diff}
          </Text>
        </View>
        <Meta
          label="Received"
          value={item.received_at ?? "—"}
        />
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetails}>View details</Text>
        <SymbolView
          name={{
            ios: "chevron.right",
            android: "chevron_right",
            web: "chevron_right",
          }}
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

export default function OffersScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetListingOffers();
  const offers = data ?? [];

  return (
    <Screen padded={false}>
      <View style={styles.pad}>
        <HeaderBar
          title="Offers"
          subtitle="Manage property acquisition offers and negotiations."
          showMenu
          showBell
        />
      </View>
      {isLoading && offers.length === 0 ? (
        <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
      ) : isError && offers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn’t load offers</Text>
          <Text style={styles.emptyBody}>
            {getApiErrorMessage(error, "Please try again.")}
          </Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.retry}>Tap to retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          renderItem={({ item }) => <OfferRow item={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No offers yet</Text>
              <Text style={styles.emptyBody}>
                Incoming offers on your listings will show up here.
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
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  metaItem: {
    width: "47%",
    flexGrow: 1,
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
