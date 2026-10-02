import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useMarkAllNotificationsRead } from "@/api/mutations/useMarkAllNotificationsRead";
import { useMarkNotificationRead } from "@/api/mutations/useMarkNotificationRead";
import {
  formatNotificationTime,
  groupNotificationsByDay,
  useGetContractorNotifications,
  type ContractorNotification,
} from "@/api/queries/useGetContractorNotifications";
import { fonts } from "@/assets/fonts";
import { HeaderBar, Screen } from "@/components/ui/primitives";
import { getApiErrorMessage } from "@/config/toastConfig";
import { Colors, Spacing } from "@/constants/theme";

export default function NotificationsScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetContractorNotifications({ limit: 50 });
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: markingAll } =
    useMarkAllNotificationsRead();

  const notifications = data ?? [];
  const sections = groupNotificationsByDay(notifications);
  const hasUnread = notifications.some((n) => !n.read_at);

  function onPressItem(item: ContractorNotification) {
    if (!item.read_at) {
      markRead(item.id);
    }
  }

  return (
    <Screen padded={false}>
      <View style={styles.pad}>
        <HeaderBar
          title="Notifications"
          showBack
          right={
            hasUnread ? (
              <Pressable
                disabled={markingAll}
                onPress={() => markAllRead()}
                hitSlop={8}
              >
                <Text style={styles.markAll}>
                  {markingAll ? "…" : "Mark all read"}
                </Text>
              </Pressable>
            ) : null
          }
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
      ) : isError ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn’t load notifications</Text>
          <Text style={styles.emptyBody}>
            {getApiErrorMessage(error, "Please try again.")}
          </Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.retry}>Tap to retry</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyBody}>
                You’re all caught up. New updates will show up here.
              </Text>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          renderItem={({ item }) => {
            const unread = !item.read_at;
            return (
              <Pressable
                onPress={() => onPressItem(item)}
                style={[styles.row, unread && styles.unread]}
              >
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>
                  {formatNotificationTime(item.created_at)}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: Spacing.four },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    flexGrow: 1,
  },
  loader: { marginTop: Spacing.six },
  markAll: {
    fontFamily: fonts.inter18.medium,
    fontSize: 13,
    color: Colors.light.primary,
  },
  sectionTitle: {
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
    fontFamily: fonts.inter18.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: Colors.light.textSecondary,
  },
  row: {
    gap: 4,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  unread: {
    backgroundColor: "rgba(211,160,93,0.08)",
    marginHorizontal: -Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 10,
  },
  title: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 15,
    color: Colors.light.black,
  },
  body: {
    fontFamily: fonts.inter18.regular,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  time: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: "rgba(51,51,51,0.5)",
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
    marginTop: Spacing.one,
  },
});
