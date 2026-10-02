import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
} from "react-native";

import { useForgotPassword } from "@/api/mutations/useForgotPassword";
import {
  AppButton,
  AppInput,
  AuthCard,
  DismissKeyboard,
} from "@/components/ui/primitives";
import { Colors, Spacing, Typography } from "@/constants/theme";

export default function ResetPasswordScreen() {
  const { mutateAsync, isPending } = useForgotPassword();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email");
      return;
    }
    try {
      await mutateAsync(trimmed);
      router.push({
        pathname: "/(auth)/verify-code",
        params: { email: trimmed },
      });
    } catch {
      // Toast handled in mutation
    }
  }

  return (
    <DismissKeyboard style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <AuthCard>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.copy}>
            Enter the email associated with your account and we will send a
            verification code.
          </Text>
          <AppInput
            label="Email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            editable={!isPending}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton label="Submit" loading={isPending} onPress={onSubmit} />
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
