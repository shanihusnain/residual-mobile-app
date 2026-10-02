import { router } from "expo-router";
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
  parseStatProgress,
  useGetOwnerDashboard,
} from "@/api/queries/useGetOwnerDashboard";
import { fonts } from "@/assets/fonts";
import {
  HeaderBar,
  ProgressBar,
  Screen,
  SectionCard,
  StatusPill,
} from "@/components/ui/primitives";
import { getApiErrorMessage } from "@/config/toastConfig";
import {
  formatOwnerProjectStatus,
  ownerProjectStatusTone,
} from "@/constants/project-status";
import { Colors, Radius, Spacing } from "@/constants/theme";

export default function HomeScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetOwnerDashboard();
  const stats = data?.stats ?? [];
  const projects = data?.projects ?? [];
  const milestones = data?.upcomingMilestones ?? [];
  const profileName = data?.profile?.full_name;

  return (
    <Screen padded={false}>
      <View style={styles.pad}>
        <HeaderBar
          title="Dashboard"
          subtitle={
            profileName
              ? `Welcome back, ${profileName}.`
              : "Track the progress of your properties and stay updated with the latest milestones."
          }
          showMenu
          showBell
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {isLoading ? (
          <ActivityIndicator
            color={Colors.light.primary}
            style={styles.loader}
          />
        ) : isError ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Couldn’t load dashboard</Text>
            <Text style={styles.emptyBody}>
              {getApiErrorMessage(error, "Please try again.")}
            </Text>
            <Pressable onPress={() => refetch()}>
              <Text style={styles.retry}>Tap to retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.kpiGrid}>
              {stats.map((kpi) => {
                const progress = parseStatProgress(kpi.value);
                return (
                  <View key={kpi.label} style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>{kpi.label}</Text>
                    <Text style={styles.kpiValue}>{kpi.value}</Text>
                    {progress != null ? <ProgressBar value={progress} /> : null}
                  </View>
                );
              })}
            </View>

            <SectionCard
              title="My Properties"
              actionLabel="View all"
              onAction={() => router.push("/(app)/properties")}
            >
              {projects.length === 0 ? (
                <Text style={styles.muted}>No properties yet.</Text>
              ) : (
                projects.map((property) => (
                  <Pressable
                    key={property.id}
                    style={styles.row}
                    onPress={() =>
                      router.push(`/(app)/properties/${property.id}`)
                    }
                  >
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>
                        {property.projectLabel}
                      </Text>
                      <StatusPill
                        label={formatOwnerProjectStatus(property.status)}
                        tone={ownerProjectStatusTone(property.status)}
                      />
                      <ProgressBar value={property.progress} />
                      <Text style={styles.muted}>
                        {property.currentStage} · {property.estimatedCompletion}
                      </Text>
                    </View>
                  </Pressable>
                ))
              )}
            </SectionCard>

            <SectionCard title="Upcoming Milestones">
              {milestones.length === 0 ? (
                <Text style={styles.muted}>No upcoming milestones.</Text>
              ) : (
                milestones.map((item) => (
                  <View key={item.id} style={styles.row}>
                    <View style={styles.dot} />
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{item.milestoneName}</Text>
                      <Text style={styles.muted}>
                        {item.propertyName} · {item.dueDate}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </SectionCard>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: Spacing.four },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  loader: { marginTop: Spacing.six },
  empty: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.six,
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
    marginTop: Spacing.one,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  kpiCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  kpiLabel: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  kpiValue: {
    fontFamily: fonts.inter18.bold,
    fontSize: 24,
    color: Colors.light.black,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
  },
  rowBody: { flex: 1, gap: Spacing.one },
  rowTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 15,
    color: Colors.light.black,
  },
  muted: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginTop: 6,
  },
});
