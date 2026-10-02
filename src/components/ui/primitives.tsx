import { useGetUnreadNotificationCount } from "@/api/queries/useGetUnreadNotificationCount";
import { fonts } from "@/assets/fonts";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { router, useNavigation } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  type ScrollViewProps,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Tap empty space (outside inputs) to dismiss the keyboard. */
export function DismissKeyboard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[{ flex: 1 }, style]}>{children}</View>
    </TouchableWithoutFeedback>
  );
}

/**
 * ScrollView that dismisses the keyboard on drag and when tapping
 * non-interactive content (wraps children in a pressable).
 */
export function DismissKeyboardScrollView({
  children,
  contentContainerStyle,
  ...props
}: ScrollViewProps) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...props}
    >
      <Pressable
        onPress={Keyboard.dismiss}
        accessible={false}
        style={contentContainerStyle}
      >
        {children}
      </Pressable>
    </ScrollView>
  );
}

export function Screen({
  children,
  style,
  padded = true,
  dismissKeyboardOnPress = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  /** Tap empty space to dismiss the keyboard (default true). */
  dismissKeyboardOnPress?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const content = (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingHorizontal: padded ? Spacing.four : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!dismissKeyboardOnPress) return content;

  return <DismissKeyboard>{content}</DismissKeyboard>;
}

export function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  variant?:
    | "primary"
    | "ghost"
    | "danger"
    | "outline"
    | "success"
    | "outlinePrimary"
    | "outlineDanger";
  disabled?: boolean;
  loading?: boolean;
}) {
  const isDisabled = disabled || loading;
  const lightLabel =
    variant === "ghost" ||
    variant === "outline" ||
    variant === "outlinePrimary" ||
    variant === "outlineDanger";
  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.buttonPrimary,
        variant === "ghost" && styles.buttonGhost,
        variant === "danger" && styles.buttonDanger,
        variant === "outline" && styles.buttonOutline,
        variant === "success" && styles.buttonSuccess,
        variant === "outlinePrimary" && styles.buttonOutlinePrimary,
        variant === "outlineDanger" && styles.buttonOutlineDanger,
        (pressed || isDisabled) && { opacity: 0.7 },
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            lightLabel
              ? variant === "outlineDanger"
                ? Colors.light.red
                : variant === "outlinePrimary"
                  ? Colors.light.primary
                  : Colors.light.darkGray
              : Colors.light.white
          }
        />
      ) : (
        <Text
          style={[
            styles.buttonLabel,
            variant === "ghost" && { color: Colors.light.darkGray },
            variant === "outline" && { color: Colors.light.darkGray },
            variant === "danger" && { color: Colors.light.white },
            variant === "outlinePrimary" && { color: Colors.light.primary },
            variant === "outlineDanger" && { color: Colors.light.red },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function AppInput({
  label,
  secureTextEntry,
  ...props
}: TextInputProps & { label?: string }) {
  const [visible, setVisible] = useState(false);
  const isPassword = secureTextEntry === true;

  return (
    <View style={styles.inputWrap}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor="rgba(51,51,51,0.4)"
          style={[styles.input, isPassword && styles.inputWithToggle]}
          secureTextEntry={isPassword ? !visible : secureTextEntry}
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={10}
            style={styles.eyeBtn}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Hide password" : "Show password"}
          >
            <SymbolView
              name={{
                ios: visible ? "eye.slash" : "eye",
                android: visible ? "visibility_off" : "visibility",
                web: visible ? "visibility_off" : "visibility",
              }}
              size={20}
              tintColor={Colors.light.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function HeaderBar({
  title,
  subtitle,
  showBell,
  showBack,
  showMenu,
  right,
}: {
  title: string;
  subtitle?: string;
  showBell?: boolean;
  showBack?: boolean;
  showMenu?: boolean;
  right?: React.ReactNode;
}) {
  const navigation = useNavigation();
  const { data: unreadCount = 0 } = useGetUnreadNotificationCount({
    enabled: !!showBell,
  });

  function openDrawerMenu() {
    type NavNode = {
      openDrawer?: () => void;
      getParent?: () => NavNode | undefined;
    };
    let nav: NavNode | undefined = navigation as unknown as NavNode;
    while (nav) {
      if (typeof nav.openDrawer === "function") {
        nav.openDrawer();
        return;
      }
      nav = nav.getParent?.();
    }
  }

  return (
    <View style={[styles.header, subtitle ? styles.headerWithSubtitle : null]}>
      <View style={styles.headerMain}>
        <View style={styles.headerTitleRow}>
          {showMenu ? (
            <Pressable
              onPress={openDrawerMenu}
              hitSlop={12}
              style={styles.iconBtn}
            >
              <SymbolView
                name={{ ios: "line.3.horizontal", android: "menu", web: "menu" }}
                size={22}
                tintColor={Colors.light.darkGray}
              />
            </Pressable>
          ) : null}
          {showBack ? (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={styles.iconBtn}
            >
              <SymbolView
                name={{
                  ios: "chevron.left",
                  android: "arrow_back",
                  web: "arrow_back",
                }}
                size={22}
                tintColor={Colors.light.darkGray}
              />
            </Pressable>
          ) : null}
          <Text style={styles.headerTitle} numberOfLines={2}>
            {title}
          </Text>
        </View>
        {subtitle ? (
          <Text
            style={[
              styles.headerSubtitle,
              (showBack || showMenu) && styles.headerSubtitleIndented,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.headerRight}>
        {right}
        {showBell ? (
          <Pressable
            onPress={() => router.push("/(app)/notifications")}
            hitSlop={12}
            style={styles.iconBtn}
          >
            <SymbolView
              name={{
                ios: "bell",
                android: "notifications",
                web: "notifications",
              }}
              size={22}
              tintColor={Colors.light.darkGray}
            />
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : String(unreadCount)}
                </Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function SectionCard({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction}>
            <Text style={styles.cardAction}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const bg =
    tone === "success"
      ? "rgba(63,125,94,0.15)"
      : tone === "warning"
        ? "rgba(211,160,93,0.2)"
        : tone === "danger"
          ? "rgba(179,67,58,0.15)"
          : tone === "info"
            ? "rgba(17,152,194,0.15)"
            : Colors.light.lightGray;
  const color =
    tone === "success"
      ? Colors.light.green
      : tone === "warning"
        ? Colors.light.primary
        : tone === "danger"
          ? Colors.light.red
          : tone === "info"
            ? Colors.light.blue
            : Colors.light.darkGray;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamped}%` }]} />
    </View>
  );
}

/** White form card used on auth flows */
export function AuthCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.authCard}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.page,
  },
  button: {
    minHeight: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
  buttonPrimary: {
    backgroundColor: Colors.light.primary,
  },
  buttonGhost: {
    backgroundColor: "transparent",
  },
  buttonOutline: {
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  buttonDanger: {
    backgroundColor: Colors.light.red,
  },
  buttonSuccess: {
    backgroundColor: Colors.light.green,
  },
  buttonOutlinePrimary: {
    backgroundColor: Colors.light.white,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  buttonOutlineDanger: {
    backgroundColor: Colors.light.white,
    borderWidth: 1.5,
    borderColor: Colors.light.red,
  },
  buttonLabel: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.white,
  },
  inputWrap: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontFamily: fonts.inter18.medium,
    fontSize: 13,
    color: Colors.light.darkGray,
  },
  inputRow: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.inputBackground,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontFamily: fonts.inter18.regular,
    fontSize: 16,
    color: Colors.light.black,
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  eyeBtn: {
    position: "absolute",
    right: Spacing.two,
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: Spacing.one,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  headerWithSubtitle: {
    alignItems: "flex-start",
  },
  headerMain: {
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
    gap: 2,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    minHeight: 40,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    minHeight: 40,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.inter18.bold,
    fontSize: 22,
    lineHeight: 28,
    color: Colors.light.black,
    ...(Platform.OS === "android"
      ? { includeFontPadding: false, textAlignVertical: "center" as const }
      : null),
  },
  headerSubtitle: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.light.textSecondary,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
  },
  headerSubtitleIndented: {
    marginLeft: 40 + Spacing.one,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: Colors.light.red,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: fonts.inter18.bold,
    fontSize: 9,
    color: Colors.light.white,
    lineHeight: 11,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.black,
  },
  cardAction: {
    fontFamily: fonts.inter18.medium,
    fontSize: 13,
    color: Colors.light.primary,
  },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
  },
  pillText: {
    fontFamily: fonts.inter18.medium,
    fontSize: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.lightGray,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
  },
  authCard: {
    backgroundColor: Colors.light.white,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
});
