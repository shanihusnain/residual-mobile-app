import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useGetOwnerSettings,
  useLogoutOtherSessions,
  useUpdateOwnerPassword,
} from "@/api/mutations/useOwnerSettings";
import { fonts } from "@/assets/fonts";
import {
  AppButton,
  AppInput,
  DismissKeyboardScrollView,
  HeaderBar,
  Screen,
} from "@/components/ui/primitives";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";
import { Colors, Radius, Spacing } from "@/constants/theme";

export default function SecurityScreen() {
  const { data, isLoading, isError, error, refetch } = useGetOwnerSettings();
  const updatePassword = useUpdateOwnerPassword();
  const logoutOthers = useLogoutOtherSessions();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const security = data?.security;

  async function onUpdatePassword() {
    if (next.length < 8) {
      showToast("error", "Password must be at least 8 characters");
      return;
    }
    if (next !== confirm) {
      showToast("error", "Passwords do not match");
      return;
    }
    await updatePassword.mutateAsync({
      current_password: current,
      new_password: next,
      confirm_password: confirm,
    });
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  if (isLoading && !security) {
    return (
      <Screen>
        <HeaderBar title="Security" showBack />
        <ActivityIndicator color={Colors.light.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (isError && !security) {
    return (
      <Screen>
        <HeaderBar title="Security" showBack />
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn’t load security settings</Text>
          <Text style={styles.emptyBody}>
            {getApiErrorMessage(error, "Please try again.")}
          </Text>
          <AppButton label="Retry" onPress={() => refetch()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.pad}>
        <HeaderBar
          title="Security"
          subtitle="Update your account password."
          showBack
        />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <DismissKeyboardScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <AppInput
            label="Current Password"
            secureTextEntry
            value={current}
            onChangeText={setCurrent}
          />
          <AppInput
            label="New Password"
            secureTextEntry
            value={next}
            onChangeText={setNext}
          />
          <AppInput
            label="Confirm New Password"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
          <AppButton
            label="Update Password"
            loading={updatePassword.isPending}
            onPress={() => {
              void onUpdatePassword();
            }}
          />
          <View style={styles.sessionBox}>
            <Text style={styles.sessionTitle}>Session Security</Text>
            <Text style={styles.sessionMeta}>
              Last password change ·{" "}
              {security?.passwordChangedLabel ?? "—"}
            </Text>
            {security?.lastLoginLabel ? (
              <Text style={styles.sessionMeta}>
                Last login · {security.lastLoginLabel}
              </Text>
            ) : null}
            <Text style={styles.sessionMeta}>
              Active Session · {security?.activeDevicesLabel ?? "This device"}
            </Text>
            <AppButton
              label="Logout of all other devices"
              variant="outline"
              loading={logoutOthers.isPending}
              onPress={() => {
                void logoutOthers.mutateAsync();
              }}
            />
          </View>
        </DismissKeyboardScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: Spacing.four },
  body: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  sessionBox: {
    marginTop: Spacing.two,
    backgroundColor: Colors.light.lightGray,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sessionTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 15,
    color: Colors.light.black,
  },
  sessionMeta: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
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
});
