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
import { ProgressBar, StatusPill } from "@/components/ui/primitives";
import { getApiErrorMessage } from "@/config/toastConfig";
import { isDocumentsOnlyProject } from "@/constants/project-status";
import { Colors, Radius, Spacing } from "@/constants/theme";

export default function PropertyOverviewTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetOwnerProjectDetail(id, "overview");

  const overview = data?.project?.overview;
  const documentsOnly = isDocumentsOnlyProject(data?.project);

  if (isLoading && !overview && !documentsOnly) {
    return (
      <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
    );
  }

  if (isError) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Couldn’t load overview</Text>
        <Text style={styles.emptyBody}>
          {getApiErrorMessage(error, "Please try again.")}
        </Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.retry}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  if (documentsOnly || !overview) {
    return (
      <View style={styles.pad}>
        <Text style={styles.emptyTitle}>Overview locked</Text>
        <Text style={styles.body}>
          Full project details are available after the contract is signed.
          Upload KYC and contract documents to continue.
        </Text>
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
      <View style={styles.stats}>
        <Stat
          label="Overall Progress"
          value={overview.overallProgressLabel}
        />
        <Stat label="Current Milestone" value={overview.currentMilestone} />
        <Stat label="Days Remaining" value={overview.daysRemainingLabel} />
      </View>

      <Text style={styles.heading}>Phase Progress</Text>
      <Text style={styles.progressLabel}>{overview.phaseProgressLabel}</Text>
      <ProgressBar value={overview.phaseProgress} />

      <Text style={styles.heading}>Timeline</Text>
      {overview.timeline?.map((item) => (
        <View key={item.id} style={styles.timelineRow}>
          <View
            style={[
              styles.timelineDot,
              item.state === "complete" && styles.dotComplete,
              item.state === "current" && styles.dotCurrent,
              item.state === "upcoming" && styles.dotUpcoming,
            ]}
          />
          <Text style={styles.timelineTitle}>{item.title}</Text>
          <StatusPill
            label={
              item.state === "complete"
                ? "Complete"
                : item.state === "current"
                  ? "Current"
                  : "Upcoming"
            }
            tone={
              item.state === "complete"
                ? "success"
                : item.state === "current"
                  ? "info"
                  : "neutral"
            }
          />
        </View>
      ))}

      <Text style={styles.heading}>Key Dates</Text>
      {overview.keyDates?.map((item) => (
        <View key={item.label} style={styles.row}>
          <Text style={styles.body}>{item.label}</Text>
          <Text style={styles.muted}>{item.value}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { padding: Spacing.four, gap: Spacing.two, paddingBottom: Spacing.six },
  loader: { marginTop: Spacing.six },
  stats: { gap: Spacing.two },
  stat: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: 4,
  },
  statLabel: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  statValue: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 15,
    color: Colors.light.black,
  },
  heading: {
    marginTop: Spacing.two,
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.black,
  },
  progressLabel: {
    fontFamily: fonts.inter18.bold,
    fontSize: 22,
    color: Colors.light.black,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotComplete: { backgroundColor: Colors.light.green },
  dotCurrent: { backgroundColor: Colors.light.blue },
  dotUpcoming: { backgroundColor: Colors.light.lightGray },
  timelineTitle: {
    flex: 1,
    fontFamily: fonts.inter18.medium,
    fontSize: 14,
    color: Colors.light.black,
  },
  body: {
    fontFamily: fonts.inter18.medium,
    fontSize: 14,
    color: Colors.light.black,
  },
  muted: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  row: {
    gap: 4,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
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
