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
import { StatusPill } from "@/components/ui/primitives";
import { getApiErrorMessage } from "@/config/toastConfig";
import { Colors, Radius, Spacing } from "@/constants/theme";

export default function MilestonesTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetOwnerProjectDetail(id, "milestones");

  const milestones = data?.milestones ?? [];
  const timeline = data?.timeline ?? [];
  const progressLabel =
    data?.overallProgressLabel ??
    (data?.overallProgress != null ? `${data.overallProgress}%` : null);

  if (isLoading && milestones.length === 0 && timeline.length === 0) {
    return (
      <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
    );
  }

  if (isError) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Couldn’t load milestones</Text>
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
      {progressLabel ? (
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <Text style={styles.progressValue}>{progressLabel}</Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.min(100, Math.max(0, data?.overallProgress ?? 0))}%`,
                },
              ]}
            />
          </View>
        </View>
      ) : null}

      {timeline.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timelineRow}
        >
          {timeline.map((item) => (
            <View key={item.id} style={styles.timelineItem}>
              <View
                style={[
                  styles.dot,
                  item.state === "complete" && styles.dotComplete,
                  item.state === "current" && styles.dotCurrent,
                ]}
              />
              <Text style={styles.timelineTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : null}

      <Text style={styles.heading}>Milestones</Text>
      {milestones.length === 0 ? (
        <Text style={styles.detail}>No milestones yet.</Text>
      ) : (
        milestones.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.rowTop}>
              <Text style={styles.title}>{item.title}</Text>
              <StatusPill
                label={item.status}
                tone={
                  item.statusRaw === "complete" || item.status === "Done"
                    ? "success"
                    : item.statusRaw === "current" ||
                        item.status === "In Progress"
                      ? "warning"
                      : "neutral"
                }
              />
            </View>
            {item.targetDate ? (
              <Text style={styles.detail}>Target · {item.targetDate}</Text>
            ) : null}
            {item.completionDisplay || item.completionDate ? (
              <Text style={styles.detail}>
                {item.completionDisplay ??
                  `${item.completionDate}${item.completionNote ? ` (${item.completionNote})` : ""}`}
              </Text>
            ) : null}
            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  loader: { marginTop: Spacing.six },
  progressCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  progressLabel: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  progressValue: {
    fontFamily: fonts.inter18.bold,
    fontSize: 22,
    color: Colors.light.black,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.lightGray,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
  },
  timelineRow: { gap: Spacing.three, paddingVertical: Spacing.one },
  timelineItem: { width: 88, gap: Spacing.one, alignItems: "center" },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.lightGray,
  },
  dotComplete: { backgroundColor: Colors.light.green },
  dotCurrent: { backgroundColor: Colors.light.primary },
  timelineTitle: {
    fontFamily: fonts.inter18.regular,
    fontSize: 11,
    textAlign: "center",
    color: Colors.light.textSecondary,
  },
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
  detail: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  description: {
    marginTop: Spacing.one,
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
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
