import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

import {
  formatAed,
  useGetListingOfferDetail,
  useRespondToOffer,
} from "@/api/mutations/useListingOffers";
import { fonts } from "@/assets/fonts";
import { AppButton, StatusPill } from "@/components/ui/primitives";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";
import { Colors, Radius, Spacing } from "@/constants/theme";

function statusTone(status?: string | null) {
  if (status === "Accepted") return "success" as const;
  if (status === "Reviewing") return "info" as const;
  if (status === "Countered") return "warning" as const;
  if (status === "Declined") return "danger" as const;
  return "neutral" as const;
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

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: offer, isLoading, isError, error, refetch, isRefetching } =
    useGetListingOfferDetail(id);
  const respond = useRespondToOffer();
  const [counterOpen, setCounterOpen] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");

  if (isLoading && !offer) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
      </View>
    );
  }

  if (!offer) {
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
            ? getApiErrorMessage(error, "Offer not found.")
            : "Offer not found."}
        </Text>
      </View>
    );
  }

  const currentOffer = offer;
  const listing = currentOffer.listing;
  const listedPrice = listing?.listed_price ?? null;
  const offerAmount = currentOffer.offer_amount ?? null;
  const brokerLabel =
    currentOffer.broker?.broker_name ||
    currentOffer.broker?.agency_name ||
    listing?.broker?.broker_name ||
    listing?.broker?.agency_name ||
    "—";
  const agencyLabel =
    currentOffer.broker?.agency_name ||
    listing?.broker?.agency_name ||
    brokerLabel;
  const canRespond =
    currentOffer.status === "Reviewing" || currentOffer.status === "Countered";
  const financials = listing?.financials ?? undefined;

  function confirmAction(action: "accept" | "decline") {
    const labels = { accept: "Accept", decline: "Decline" };
    Alert.alert(
      `${labels[action]} offer?`,
      `${labels[action]} ${formatAed(offerAmount)} for ${listing?.title ?? "this property"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: labels[action],
          style: action === "decline" ? "destructive" : "default",
          onPress: () => {
            void respond.mutateAsync({
              id: currentOffer.id,
              listingId: currentOffer.listing_id,
              status: action === "accept" ? "Accepted" : "Declined",
            });
          },
        },
      ],
    );
  }

  async function submitCounter() {
    const amount = Number(counterAmount.replace(/,/g, ""));
    if (!amount || Number.isNaN(amount)) {
      showToast("error", "Enter a valid counter amount");
      return;
    }
    let difference_label: string | undefined;
    if (listedPrice && listedPrice > 0) {
      const pct = ((amount - listedPrice) / listedPrice) * 100;
      difference_label = `${pct >= 0 ? "+" : "−"}${Math.abs(pct).toFixed(1)}%`;
    }
    await respond.mutateAsync({
      id: currentOffer.id,
      listingId: currentOffer.listing_id,
      status: "Countered",
      offer_amount: amount,
      difference_label,
      subtext: "Owner counter",
    });
    setCounterOpen(false);
    setCounterAmount("");
  }

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
              {listing?.title ?? "Offer"}
            </Text>
            <StatusPill
              label={currentOffer.status ?? "—"}
              tone={statusTone(currentOffer.status)}
            />
          </View>
          <Text style={styles.subtitle}>via {agencyLabel}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View style={styles.priceRow}>
          <View style={[styles.priceCard, styles.offerPriceCard]}>
            <Text style={styles.priceLabelLight}>Offer Price</Text>
            <Text style={styles.priceValueLight}>{formatAed(offerAmount)}</Text>
          </View>
          <View style={[styles.priceCard, styles.listedPriceCard]}>
            <Text style={styles.priceLabel}>Listed Price</Text>
            <Text style={styles.priceValue}>{formatAed(listedPrice)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Offer Details</Text>
          <View style={styles.grid}>
            <Field label="Listed Price" value={formatAed(listedPrice)} />
            <Field
              label="Difference"
              value={currentOffer.difference_label ?? "—"}
            />
            <Field
              label="ROI"
              value={currentOffer.roi != null ? `${currentOffer.roi}%` : "—"}
            />
            <Field
              label="Days in pipeline"
              value={
                currentOffer.days_in_pipeline != null
                  ? String(currentOffer.days_in_pipeline)
                  : "—"
              }
            />
            <Field label="Received" value={currentOffer.received_at ?? "—"} />
            <Field label="Broker" value={brokerLabel} />
            {currentOffer.subtext ? (
              <Field label="Notes" value={currentOffer.subtext} />
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Linked Property</Text>
          <View style={styles.grid}>
            <Field label="Property" value={listing?.title ?? "—"} />
            <Field label="Location" value={listing?.location ?? "—"} />
            <Field label="Owner" value={listing?.owner_name ?? "—"} />
            <Field label="Listed Price" value={formatAed(listedPrice)} />
            <Field label="Listing status" value={listing?.status ?? "—"} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Respond to Offer</Text>
          {canRespond ? (
            <View style={styles.actions}>
              <AppButton
                label={`Accept ${formatAed(offerAmount)}`}
                variant="success"
                loading={respond.isPending}
                onPress={() => confirmAction("accept")}
              />
              <AppButton
                label="Counter Offer"
                variant="outlinePrimary"
                disabled={respond.isPending}
                onPress={() => {
                  setCounterAmount(
                    offerAmount != null ? String(offerAmount) : "",
                  );
                  setCounterOpen(true);
                }}
              />
              <AppButton
                label="Decline Offer"
                variant="outlineDanger"
                disabled={respond.isPending}
                onPress={() => confirmAction("decline")}
              />
            </View>
          ) : (
            <Text style={styles.muted}>
              This offer is already {(currentOffer.status ?? "closed").toLowerCase()}.
            </Text>
          )}
        </View>

        {financials ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Financial Impact</Text>
            <ImpactRow
              label="Projected Net"
              value={formatAed(
                financialNumber(
                  financials,
                  "projectedNet",
                  "projected_net",
                  "grossUpliftEst",
                ),
              )}
            />
            <ImpactRow
              label="Owner Share"
              value={formatAed(
                financialNumber(financials, "ownerShare", "owner_share"),
              )}
            />
            <ImpactRow
              label="Residual Share"
              value={formatAed(
                financialNumber(financials, "residualShare", "residual_share"),
              )}
            />
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={counterOpen} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Counter offer</Text>
            <TextInput
              style={styles.modalInput}
              value={counterAmount}
              onChangeText={setCounterAmount}
              keyboardType="numeric"
              placeholder="Amount (AED)"
              placeholderTextColor="rgba(51,51,51,0.45)"
            />
            <View style={styles.modalActions}>
              <AppButton
                label="Cancel"
                variant="outline"
                onPress={() => setCounterOpen(false)}
              />
              <AppButton
                label="Submit counter"
                loading={respond.isPending}
                onPress={() => {
                  void submitCounter();
                }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function ImpactRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.impactRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.impactValue}>{value}</Text>
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
    gap: Spacing.three,
  },
  priceRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  priceCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: 4,
  },
  offerPriceCard: {
    backgroundColor: Colors.light.primary,
  },
  listedPriceCard: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  priceLabelLight: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  priceValueLight: {
    fontFamily: fonts.inter18.bold,
    fontSize: 16,
    color: Colors.light.white,
  },
  priceLabel: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  priceValue: {
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  field: {
    width: "45%",
    flexGrow: 1,
    gap: 2,
  },
  fieldLabel: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  fieldValue: {
    fontFamily: fonts.inter18.medium,
    fontSize: 14,
    color: Colors.light.black,
  },
  actions: { gap: Spacing.two },
  muted: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  impactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  impactValue: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.black,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: Spacing.four,
  },
  modalCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 18,
    color: Colors.light.black,
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: fonts.inter18.regular,
    fontSize: 15,
    color: Colors.light.black,
  },
  modalActions: { gap: Spacing.two },
});
