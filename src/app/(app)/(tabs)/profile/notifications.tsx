import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useGetOwnerSettings,
  useUpdateOwnerNotifications,
  type OwnerNotificationPrefs,
} from "@/api/mutations/useOwnerSettings";
import { fonts } from "@/assets/fonts";
import { AppButton, HeaderBar, Screen } from "@/components/ui/primitives";
import { getApiErrorMessage } from "@/config/toastConfig";
import { Colors, Spacing } from "@/constants/theme";

export default function NotificationSettingsScreen() {
  const { data, isLoading, isError, error, refetch } = useGetOwnerSettings();
  const updateNotifications = useUpdateOwnerNotifications();

  const [prefs, setPrefs] = useState<OwnerNotificationPrefs | null>(null);

  useEffect(() => {
    if (data?.notifications) {
      setPrefs(data.notifications);
    }
  }, [data?.notifications]);

  const items = data?.notificationItems ?? [];

  if (isLoading && !prefs) {
    return (
      <Screen>
        <HeaderBar title="Notifications" showBack />
        <ActivityIndicator
          color={Colors.light.primary}
          style={{ marginTop: 40 }}
        />
      </Screen>
    );
  }

  if ((isError && !prefs) || !prefs) {
    return (
      <Screen>
        <HeaderBar title="Notifications" showBack />
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn’t load preferences</Text>
          <Text style={styles.emptyBody}>
            {getApiErrorMessage(error, "Please try again.")}
          </Text>
          <AppButton label="Retry" onPress={() => refetch()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <HeaderBar
        title="Notifications"
        subtitle="Choose which updates you want to receive."
        showBack
      />
      <View style={styles.body}>
        {(items.length
          ? items
          : (Object.keys(prefs) as (keyof OwnerNotificationPrefs)[]).map(
              (key) => ({
                key,
                label: key,
                enabled: prefs[key],
              }),
            )
        ).map((item) => {
          const enabled = prefs[item.key];
          return (
            <Pressable
              key={item.key}
              style={styles.row}
              onPress={() =>
                setPrefs((prev) =>
                  prev ? { ...prev, [item.key]: !prev[item.key] } : prev,
                )
              }
            >
              {/* <View style={styles.icon} /> */}
              <Text style={styles.label}>{item.label}</Text>
              <View style={[styles.toggle, enabled && styles.toggleOn]}>
                <View style={[styles.knob, enabled && styles.knobOn]} />
              </View>
            </Pressable>
          );
        })}
        <AppButton
          label="Save Changes"
          loading={updateNotifications.isPending}
          onPress={() => {
            void updateNotifications.mutateAsync({ notifications: prefs });
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: Spacing.two, gap: Spacing.one },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
  },
  label: {
    flex: 1,
    fontFamily: fonts.inter18.medium,
    fontSize: 15,
    color: Colors.light.black,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.darkGray,
    padding: 2,
    justifyContent: "center",
  },
  toggleOn: { backgroundColor: Colors.light.primary },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.white,
  },
  knobOn: { alignSelf: "flex-end" },
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
});
