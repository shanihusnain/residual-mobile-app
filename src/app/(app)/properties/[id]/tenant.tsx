import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useGetOwnerProjectDetail } from "@/api/queries/useGetOwnerProjectDetail";
import { fonts } from "@/assets/fonts";
import { getApiErrorMessage } from "@/config/toastConfig";
import { Colors, Spacing } from "@/constants/theme";

export default function PropertyInfoTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetOwnerProjectDetail(id, "property");

  const property = data?.project?.property;

  if (isLoading && !property) {
    return (
      <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
    );
  }

  if (isError) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Couldn’t load property</Text>
        <Text style={styles.emptyBody}>
          {getApiErrorMessage(error, "Please try again.")}
        </Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.retry}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.pad}>
        <Text style={styles.value}>Property details not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.pad}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <Text style={styles.heading}>Location & Classification</Text>
      <Row label="Address" value={property.address ?? "—"} />
      <Row label="Community" value={property.community ?? "—"} />
      <Row label="Property Type" value={property.propertyType ?? "—"} />
      <Row label="DLD Zone" value={property.dldZoneCode ?? "—"} />
      <Row label="Sub Type" value={property.subType ?? "—"} />

      <Text style={[styles.heading, { marginTop: Spacing.three }]}>
        Size & Layout
      </Text>
      <Row label="BUA" value={property.buaLabel ?? "—"} />
      <Row label="Plot Size" value={property.plotSizeLabel ?? "—"} />
      <Row
        label="Bedrooms"
        value={
          property.bedrooms != null ? String(property.bedrooms) : "—"
        }
      />
      <Row
        label="Bathrooms"
        value={
          property.bathrooms != null ? String(property.bathrooms) : "—"
        }
      />
      <Row
        label="Parking"
        value={
          property.parkingBays != null ? String(property.parkingBays) : "—"
        }
      />
      <Row label="Floor" value={property.floor ?? "—"} />
      <Row label="Layout" value={property.currentLayout ?? "—"} />

      <Text style={[styles.heading, { marginTop: Spacing.three }]}>
        Features & Condition
      </Text>
      <Row label="Pool" value={property.poolLabel ?? "—"} />
      <Row label="Garden" value={property.gardenLabel ?? "—"} />
      <Row label="View" value={property.viewDescription ?? "—"} />
      <Row label="Age" value={property.propertyAge ?? "—"} />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { padding: Spacing.four, gap: Spacing.two, paddingBottom: Spacing.six },
  loader: { marginTop: Spacing.six },
  heading: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.black,
    marginBottom: Spacing.one,
  },
  row: {
    gap: 4,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  label: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  value: {
    fontFamily: fonts.inter18.medium,
    fontSize: 15,
    color: Colors.light.black,
  },
  empty: {
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.six,
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
