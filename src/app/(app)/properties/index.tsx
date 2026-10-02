import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useGetOwnerProperties,
  type OwnerProject,
} from "@/api/queries/useGetOwnerProperties";
import { fonts } from "@/assets/fonts";
import {
  HeaderBar,
  ProgressBar,
  Screen,
  StatusPill,
} from "@/components/ui/primitives";
import { getApiErrorMessage } from "@/config/toastConfig";
import {
  formatOwnerProjectStatus,
  ownerProjectStatusTone,
} from "@/constants/project-status";
import { Colors, Radius, Spacing } from "@/constants/theme";

function PropertyRow({ item }: { item: OwnerProject }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(app)/properties/${item.id}`)}
    >
      <View style={styles.cardTop}>
        <Text style={styles.title}>{item.projectLabel}</Text>
        <StatusPill
          label={formatOwnerProjectStatus(item.status)}
          tone={ownerProjectStatusTone(item.status)}
        />
      </View>
      <ProgressBar value={item.progress} />
      <View style={styles.meta}>
        <Text style={styles.metaText}>{item.currentStage}</Text>
        <Text style={styles.metaText}>{item.estimatedCompletion}</Text>
      </View>
      {item.trackStatus ? (
        <Text style={styles.track}>{item.trackStatus}</Text>
      ) : null}
    </Pressable>
  );
}

export default function PropertiesScreen() {
  const params = useLocalSearchParams<{ q?: string; status?: string }>();
  const status = typeof params.status === "string" ? params.status : "All";
  const initialQ = typeof params.q === "string" ? params.q : "";
  const [search, setSearch] = useState(initialQ);

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetOwnerProperties({
      q: initialQ || undefined,
      status: status !== "All" ? status : undefined,
    });

  const projects = data?.projects ?? [];

  function submitSearch() {
    router.setParams({
      q: search.trim() || undefined,
      status: status !== "All" ? status : undefined,
    });
  }

  return (
    <Screen padded={false}>
      <View style={styles.pad}>
        <HeaderBar
          title="Properties"
          subtitle="Manage all your properties in one place."
          showMenu
          showBell
          right={
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(app)/properties/filters",
                  params: {
                    status: status !== "All" ? status : undefined,
                    q: initialQ || undefined,
                  },
                })
              }
            >
              <Text style={styles.filter}>Filters</Text>
            </Pressable>
          }
        />
        <View style={styles.searchRow}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search properties"
            placeholderTextColor="rgba(51,51,51,0.4)"
            style={styles.search}
            returnKeyType="search"
            onSubmitEditing={submitSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable onPress={submitSearch} style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>Search</Text>
          </Pressable>
        </View>
        {status !== "All" ? (
          <Text style={styles.activeFilter}>
            Status: {formatOwnerProjectStatus(status)}
          </Text>
        ) : null}
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
      ) : isError ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn’t load properties</Text>
          <Text style={styles.emptyBody}>
            {getApiErrorMessage(error, "Please try again.")}
          </Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.retry}>Tap to retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No properties found</Text>
              <Text style={styles.emptyBody}>
                Try adjusting search or filters.
              </Text>
            </View>
          }
          renderItem={({ item }) => <PropertyRow item={item} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: Spacing.four, gap: Spacing.two },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
    flexGrow: 1,
  },
  filter: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.primary,
  },
  searchRow: {
    flexDirection: "row",
    gap: Spacing.two,
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.white,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: fonts.inter18.regular,
    fontSize: 15,
    color: Colors.light.black,
  },
  searchBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchBtnText: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.primary,
  },
  activeFilter: {
    fontFamily: fonts.inter18.medium,
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.one,
  },
  loader: { marginTop: Spacing.six },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.black,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  track: {
    fontFamily: fonts.inter18.medium,
    fontSize: 12,
    color: Colors.light.green,
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
