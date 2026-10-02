import { router, Stack, useLocalSearchParams, usePathname } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGetOwnerProjectDetail } from "@/api/queries/useGetOwnerProjectDetail";
import { fonts } from "@/assets/fonts";
import { StatusPill } from "@/components/ui/primitives";
import {
  formatOwnerProjectStatus,
  isDocumentsOnlyProject,
  ownerProjectStatusTone,
} from "@/constants/project-status";
import { Colors, Radius, Spacing } from "@/constants/theme";

const ALL_TABS = [
  { segment: "index", label: "Overview", path: "" },
  { segment: "tenant", label: "Property", path: "tenant" },
  { segment: "documents", label: "Documents", path: "documents" },
  { segment: "lease", label: "Milestones", path: "lease" },
  { segment: "history", label: "Reports", path: "history" },
  { segment: "chat", label: "Chat", path: "chat" },
] as const;

const DOCUMENTS_ONLY_TABS = ALL_TABS.filter((tab) => tab.path === "documents");

export default function PropertyDetailLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const redirectedRef = useRef<string | null>(null);
  const { data, isLoading } = useGetOwnerProjectDetail(id, "overview");
  const project = data?.project;
  const documentsOnly = isDocumentsOnlyProject(project);
  const tabs = documentsOnly ? DOCUMENTS_ONLY_TABS : ALL_TABS;
  const statusLabel = formatOwnerProjectStatus(project?.status);

  const onDocumentsPath =
    !!id &&
    (pathname.includes(`/${id}/documents`) || pathname.endsWith("/documents"));

  // One-shot replace — never Redirect during render (that loops).
  useEffect(() => {
    if (!id || isLoading || !project || !documentsOnly || onDocumentsPath) {
      return;
    }
    if (redirectedRef.current === id) return;
    redirectedRef.current = id;
    router.replace(`/(app)/properties/${id}/documents`);
  }, [id, isLoading, project, documentsOnly, onDocumentsPath]);

  useEffect(() => {
    if (!documentsOnly) redirectedRef.current = null;
  }, [documentsOnly]);

  const subtitle =
    project?.property?.community || project?.property?.address || "";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.back}
          >
            <SymbolView
              name={{
                ios: "chevron.left",
                android: "arrow_back",
                web: "arrow_back",
              }}
              size={22}
              tintColor={Colors.light.darkGray}
              style={styles.backIcon}
            />
          </Pressable>
          <View style={styles.headerCopy}>
            {isLoading && !project ? (
              <ActivityIndicator color={Colors.light.primary} />
            ) : (
              <Text style={styles.title} numberOfLines={1}>
                {project?.projectLabel ?? "Property"}
              </Text>
            )}
          </View>
          {project?.status ? (
            <View style={styles.statusWrap}>
              <StatusPill
                label={statusLabel}
                tone={ownerProjectStatusTone(project.status)}
              />
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {documentsOnly ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Upload required documents</Text>
          <Text style={styles.bannerBody}>
            Full project details unlock after the contract is signed. Until
            then, you can upload KYC and contract documents here.
          </Text>
        </View>
      ) : null}

      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabs}
        >
          {tabs.map((tab) => {
            const href =
              tab.path === ""
                ? `/(app)/properties/${id}`
                : `/(app)/properties/${id}/${tab.path}`;
            const active =
              tab.path === ""
                ? pathname.endsWith(`/${id}`) || pathname.endsWith(`/${id}/`)
                : pathname.includes(`/${id}/${tab.path}`);

            return (
              <Pressable
                key={tab.segment}
                onPress={() => {
                  if (active) return;
                  router.push(href as never);
                }}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text
                  style={[styles.tabLabel, active && styles.tabLabelActive]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.page },
  header: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    gap: Spacing.one,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 22,
    height: 22,
  },
  headerCopy: {
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  statusWrap: {
    height: 44,
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 18,
    lineHeight: 22,
    color: Colors.light.black,
    ...(Platform.OS === "android"
      ? { includeFontPadding: false, textAlignVertical: "center" as const }
      : null),
  },
  subtitle: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.light.textSecondary,
    marginLeft: 44 + Spacing.one,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
  },
  banner: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: "rgba(255,149,0,0.12)",
    gap: 4,
  },
  bannerTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.black,
  },
  bannerBody: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.light.darkGray,
  },
  tabsWrap: {
    flexGrow: 0,
    flexShrink: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tabs: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
    alignItems: "center",
  },
  tab: {
    height: 36,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: Colors.light.primary },
  tabLabel: {
    fontFamily: fonts.inter18.medium,
    fontSize: 13,
    color: Colors.light.darkGray,
  },
  tabLabelActive: { color: Colors.light.white },
  content: {
    flex: 1,
  },
});
