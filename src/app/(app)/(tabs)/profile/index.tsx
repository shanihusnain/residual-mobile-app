import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { useLogout } from "@/api/mutations/useLogout";
import { useGetOwnerSettings } from "@/api/mutations/useOwnerSettings";
import { fonts } from "@/assets/fonts";
import { AppButton, HeaderBar, Screen } from "@/components/ui/primitives";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useSession } from "@/providers/auth";

const ACCOUNT_ITEMS = [
  {
    id: "profile",
    label: "Profile",
    href: "/(app)/(tabs)/profile/edit",
    icon: { ios: "person.fill", android: "person", web: "person" },
  },
  {
    id: "security",
    label: "Security",
    href: "/(app)/(tabs)/profile/security",
    icon: { ios: "shield.fill", android: "shield", web: "shield" },
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/(app)/(tabs)/profile/notifications",
    icon: { ios: "bell.fill", android: "notifications", web: "notifications" },
  },
] as const;

export default function SettingsScreen() {
  const { signOut, user } = useSession();
  const { mutateAsync, isPending } = useLogout();
  const { data: settings } = useGetOwnerSettings();

  const email = settings?.profile.email ?? user?.email ?? "—";
  const displayName =
    settings?.profile.fullName ||
    email.split("@")[0] ||
    "Owner";
  const roleLabel = settings?.profile.roleLabel ?? "Owner";
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function onSignOut() {
    try {
      await mutateAsync();
    } catch {
      // still clear local session
    } finally {
      await signOut();
    }
  }

  return (
    <Screen>
      <HeaderBar
        title="Settings"
        subtitle="Manage your personal and company configurations."
        showMenu
        showBell
      />

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        {ACCOUNT_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            style={styles.menuRow}
            onPress={() => router.push(item.href as never)}
          >
            <View style={styles.menuIcon}>
              <SymbolView
                name={{
                  ios: item.icon.ios as never,
                  android: item.icon.android as never,
                  web: item.icon.web as never,
                }}
                size={18}
                tintColor={Colors.light.primary}
              />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.userCard}>
        {settings?.profile.avatarUrl ? (
          <Image
            source={{ uri: settings.profile.avatarUrl }}
            style={styles.avatarImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || "RO"}</Text>
          </View>
        )}
        <View style={styles.userCopy}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.role}>{roleLabel}</Text>
        </View>
      </View>

      <AppButton
        label="Sign out"
        variant="outline"
        loading={isPending}
        onPress={onSignOut}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  sectionLabel: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.one,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(211,160,93,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontFamily: fonts.inter18.medium,
    fontSize: 16,
    color: Colors.light.black,
  },
  chevron: {
    fontSize: 22,
    color: "rgba(51,51,51,0.4)",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.lightGray,
  },
  avatarText: {
    fontFamily: fonts.inter18.bold,
    fontSize: 18,
    color: Colors.light.white,
  },
  userCopy: { flex: 1, gap: 2 },
  name: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.black,
  },
  email: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  role: {
    fontFamily: fonts.inter18.medium,
    fontSize: 12,
    color: Colors.light.primary,
  },
});
