import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
} from "react-native";

import { useResetPassword } from "@/api/mutations/useResetPassword";
import {
  AppButton,
  AppInput,
  AuthCard,
  DismissKeyboard,
} from "@/components/ui/primitives";
import { Colors, Spacing, Typography } from "@/constants/theme";

export default function NewPasswordScreen() {
  const { mutateAsync, isPending } = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      await mutateAsync({
        newPassword: password,
        confirmNewPassword: confirm,
      });
    } catch {
      // Toast + navigation handled in mutation
    }
  }

  return (
    <DismissKeyboard style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <AuthCard>
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.copy}>Enter a new password for your account.</Text>
          <AppInput
            label="New Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="New Password"
            editable={!isPending}
          />
          <AppInput
            label="Confirm New Password"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Confirm New Password"
            editable={!isPending}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton
            label="Change Password"
            loading={isPending}
            onPress={onSubmit}
          />
        </AuthCard>
      </KeyboardAvoidingView>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.authBackdrop },
  flex: { flex: 1, justifyContent: "center", padding: Spacing.four },
  title: { ...Typography.h2, textAlign: "center" },
  copy: { ...Typography.caption, textAlign: "center", lineHeight: 20 },
  error: {
    ...Typography.caption,
    color: Colors.light.red,
    textAlign: "center",
  },
});
