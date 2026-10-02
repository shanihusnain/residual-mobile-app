import { router, usePathname } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandLogo } from "@/components/brand-logo";
import { fonts } from "@/assets/fonts";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useSession } from "@/providers/auth";

type DrawerNavProps = {
  navigation: { closeDrawer: () => void };
};

type DrawerItem = {
  label: string;
  href: string;
  match: string;
  icon: { ios: string; android: string; web: string };
};

const PRIMARY_ITEMS: DrawerItem[] = [
  {
    label: "Dashboard",
    href: "/(app)/(tabs)/home",
    match: "/home",
    icon: { ios: "square.grid.2x2.fill", android: "dashboard", web: "dashboard" },
  },
  {
    label: "Properties",
    href: "/(app)/properties",
    match: "/properties",
    icon: { ios: "building.2.fill", android: "apartment", web: "apartment" },
  },
  {
    label: "Listings",
    href: "/(app)/listings",
    match: "/listings",
    icon: { ios: "tag.fill", android: "sell", web: "sell" },
  },
  {
    label: "Offers",
    href: "/(app)/offers",
    match: "/offers",
    icon: {
      ios: "doc.text.magnifyingglass",
      android: "description",
      web: "description",
    },
  },
];

const SECONDARY_ITEMS: DrawerItem[] = [
  {
    label: "Messages",
    href: "/(app)/(tabs)/messages",
    match: "/messages",
    icon: {
      ios: "bubble.left.and.bubble.right.fill",
      android: "chat",
      web: "chat",
    },
  },
  {
    label: "Profile",
    href: "/(app)/(tabs)/profile",
    match: "/profile",
    icon: { ios: "person.fill", android: "person", web: "person" },
  },
];

export function AppDrawerContent(props: DrawerNavProps) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user } = useSession();

  const email = user?.email ?? "—";
  const meta =
    typeof user?.user_metadata === "object" && user.user_metadata
      ? (user.user_metadata as { full_name?: string })
      : null;
  const displayName = meta?.full_name || email.split("@")[0] || "Owner";
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function go(href: string) {
    props.navigation.closeDrawer();
    router.push(href as never);
  }

  function isActive(match: string) {
    return pathname.includes(match);
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.two }]}>
      <View style={styles.brandBlock}>
        <BrandLogo size={22} />
        <Text style={styles.region}>UAE</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        style={styles.scrollView}
      >
        <Text style={styles.sectionLabel}>OVERVIEW</Text>
        <DrawerLink
          item={PRIMARY_ITEMS[0]}
          active={isActive(PRIMARY_ITEMS[0].match)}
          onPress={() => go(PRIMARY_ITEMS[0].href)}
        />

        <Text style={styles.sectionLabel}>PORTFOLIO</Text>
        {PRIMARY_ITEMS.slice(1).map((item) => (
          <DrawerLink
            key={item.href}
            item={item}
            active={isActive(item.match)}
            onPress={() => go(item.href)}
          />
        ))}

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        {SECONDARY_ITEMS.map((item) => (
          <DrawerLink
            key={item.href}
            item={item}
            active={isActive(item.match)}
            onPress={() => go(item.href)}
          />
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || "RO"}</Text>
        </View>
        <View style={styles.footerCopy}>
          <Text style={styles.footerName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.footerRole} numberOfLines={1}>
            Owner
          </Text>
        </View>
      </View>
    </View>
  );
}

function DrawerLink({
  item,
  active,
  onPress,
}: {
  item: DrawerItem;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.link, active && styles.linkActive]}
    >
      <SymbolView
        name={{
          ios: item.icon.ios as never,
          android: item.icon.android as never,
          web: item.icon.web as never,
        }}
        size={18}
        tintColor={active ? Colors.light.white : Colors.light.darkGray}
      />
      <Text style={[styles.linkLabel, active && styles.linkLabelActive]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  brandBlock: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  region: {
    alignSelf: "flex-start",
    fontFamily: fonts.inter18.medium,
    fontSize: 12,
    color: Colors.light.textSecondary,
    backgroundColor: Colors.light.lightGray,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    overflow: "hidden",
  },
  scrollView: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.one,
  },
  sectionLabel: {
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
    marginLeft: Spacing.one,
    fontFamily: fonts.inter18.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: Colors.light.textSecondary,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
  },
  linkActive: {
    backgroundColor: Colors.light.primary,
  },
  linkLabel: {
    fontFamily: fonts.inter18.medium,
    fontSize: 15,
    color: Colors.light.darkGray,
  },
  linkLabelActive: {
    color: Colors.light.white,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.inter18.bold,
    fontSize: 14,
    color: Colors.light.white,
  },
  footerCopy: { flex: 1 },
  footerName: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.black,
  },
  footerRole: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});
