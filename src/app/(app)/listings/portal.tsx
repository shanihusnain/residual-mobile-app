import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Linking,
  Pressable,
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
import { AppButton } from "@/components/ui/primitives";
import { getApiErrorMessage } from "@/config/toastConfig";
import { Colors, Radius, Spacing } from "@/constants/theme";

export default function PortalListingModal() {
  const { listingId, portalId } = useLocalSearchParams<{
    listingId?: string;
    portalId?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { data: listing, isLoading, isError, error } =
    useGetListingDetail(listingId);

  const portal = listing?.listing_portals?.find((p) => p.id === portalId);
  const details = listing?.property_details ?? undefined;

  if (isLoading && !listing) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.light.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  if (!listing || !portal) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
        <Text style={styles.missing}>
          {isError
            ? getApiErrorMessage(error, "Portal listing not found.")
            : "Portal listing not found."}
        </Text>
      </View>
    );
  }

  const hero =
    typeof details?.imageUrl === "string"
      ? details.imageUrl
      : typeof details?.image_url === "string"
        ? details.image_url
        : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Property Listing on Portal</Text>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconBtn}>
          <SymbolView
            name={{ ios: "xmark", android: "close", web: "close" }}
            size={20}
            tintColor={Colors.light.darkGray}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {hero ? (
          <Image source={{ uri: hero }} style={styles.hero} contentFit="cover" />
        ) : (
          <View style={[styles.hero, styles.heroFallback]}>
            <Text style={styles.heroFallbackText}>
              {portal.marketplace ?? "Portal"}
            </Text>
          </View>
        )}

        <View style={styles.portalBadge}>
          <Text style={styles.portalBadgeText}>
            {portal.marketplace ?? "Portal"}
          </Text>
        </View>

        <Text style={styles.price}>{formatAed(portal.amount)}</Text>
        <Text style={styles.status}>{portal.status ?? "—"}</Text>

        <Text style={styles.propertyLabel}>{listing.title}</Text>
        <Text style={styles.location}>{listing.location}</Text>

        <View style={styles.specs}>
          <Spec
            label="Bedrooms"
            value={String(details?.bedrooms ?? details?.beds ?? "—")}
          />
          <Spec
            label="Bathrooms"
            value={String(details?.bathrooms ?? details?.baths ?? "—")}
          />
          <Spec
            label="Property type"
            value={String(
              details?.propertyType ?? details?.property_type ?? "—",
            )}
          />
          <Spec
            label="Area"
            value={String(details?.area ?? details?.buaLabel ?? "—")}
          />
        </View>

        {portal.external_url ? (
          <AppButton
            label="Open on portal"
            onPress={() => {
              void Linking.openURL(portal.external_url!);
            }}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specRow}>
      <View style={styles.specDot} />
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.page },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 18,
    color: Colors.light.black,
  },
  iconBtn: { padding: Spacing.one },
  closeBtn: { padding: Spacing.four },
  closeText: {
    fontFamily: fonts.inter18.semiBold,
    color: Colors.light.primary,
  },
  missing: {
    paddingHorizontal: Spacing.four,
    fontFamily: fonts.inter18.regular,
    color: Colors.light.textSecondary,
  },
  scroll: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  hero: {
    width: "100%",
    height: 220,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.lightGray,
  },
  heroFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroFallbackText: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 18,
    color: Colors.light.textSecondary,
  },
  portalBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(211,160,93,0.15)",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
    marginTop: Spacing.one,
  },
  portalBadgeText: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 12,
    color: Colors.light.primary,
  },
  price: {
    fontFamily: fonts.inter18.bold,
    fontSize: 28,
    color: Colors.light.black,
    marginTop: Spacing.one,
  },
  status: {
    fontFamily: fonts.inter18.medium,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  propertyLabel: {
    marginTop: Spacing.two,
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.black,
  },
  location: {
    fontFamily: fonts.inter18.regular,
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.two,
  },
  specs: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  specDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  specLabel: {
    flex: 1,
    fontFamily: fonts.inter18.regular,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  specValue: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.black,
  },
});
