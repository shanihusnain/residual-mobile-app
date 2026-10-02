import * as Linking from "expo-linking";
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

import {
  useGetOwnerProjectDetail,
  type OwnerProjectDocument,
} from "@/api/queries/useGetOwnerProjectDetail";
import { fonts } from "@/assets/fonts";
import { StatusPill } from "@/components/ui/primitives";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";
import { Colors, Radius, Spacing } from "@/constants/theme";

function ReportRow({ doc }: { doc: OwnerProjectDocument }) {
  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <Text style={styles.title}>{doc.title}</Text>
        <StatusPill
          label={doc.status}
          tone={
            doc.statusRaw === "verified" || doc.status === "Verified"
              ? "success"
              : "warning"
          }
        />
      </View>
      <Text style={styles.meta}>
        {doc.fileType} · {doc.uploadedBy} · {doc.uploadDate}
      </Text>
      {doc.downloadUrl ? (
        <Pressable
          onPress={() => {
            void Linking.openURL(doc.downloadUrl!).catch(() => {
              showToast("error", "Could not open download");
            });
          }}
        >
          <Text style={styles.link}>Download</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ReportsTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetOwnerProjectDetail(id, "reports");

  const reports = data?.reports ?? [];

  if (isLoading && reports.length === 0) {
    return (
      <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
    );
  }

  if (isError) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Couldn’t load reports</Text>
        <Text style={styles.emptyBody}>
          {getApiErrorMessage(error, "Please try again.")}
        </Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.retry}>Tap to retry</Text>
        </Pressable>
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
      <Text style={styles.heading}>Weekly Progress Reports</Text>
      {reports.length === 0 ? (
        <Text style={styles.meta}>No reports yet.</Text>
      ) : (
        reports.map((doc) => <ReportRow key={doc.id} doc={doc} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  loader: { marginTop: Spacing.six },
  heading: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 18,
    color: Colors.light.black,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontFamily: fonts.inter18.semiBold,
    fontSize: 15,
    color: Colors.light.black,
  },
  meta: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  link: {
    marginTop: Spacing.one,
    fontFamily: fonts.inter18.semiBold,
    fontSize: 13,
    color: Colors.light.primary,
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
