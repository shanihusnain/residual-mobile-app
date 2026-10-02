import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useForgotPasswordOtpValidation } from "@/api/mutations/useForgotPasswordOtpValidation";
import { fonts } from "@/assets/fonts";
import {
  AppButton,
  AuthCard,
  DismissKeyboard,
} from "@/components/ui/primitives";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";

const LENGTH = 6;

export default function VerifyCodeScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { mutateAsync, isPending } = useForgotPasswordOtpValidation();
  // Temporary: server accepts hardcoded OTP `111111`.
  const [digits, setDigits] = useState<string[]>(["1", "1", "1", "1", "1", "1"]);
  const [error, setError] = useState<string | null>(null);
  const refs = useRef<(TextInput | null)[]>([]);

  async function onVerify() {
    setError(null);
    const token = digits.join("");
    if (!email) {
      setError("Missing email. Go back and request a new code.");
      return;
    }
    if (token.length < LENGTH) {
      setError("Enter the full verification code");
      return;
    }
    try {
      await mutateAsync({ email, otp: token });
      router.push({
        pathname: "/(auth)/new-password",
        params: { email },
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
          <Text style={styles.title}>Code Verification</Text>
          <Text style={styles.copy}>
            Enter the code we sent to {email ?? "your email"}.
          </Text>
          <View style={styles.otpRow}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => {
                  refs.current[index] = el;
                }}
                style={styles.otpBox}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                editable={!isPending}
                onChangeText={(value) => {
                  const next = [...digits];
                  next[index] = value.slice(-1);
                  setDigits(next);
                  if (value && index < LENGTH - 1) {
                    refs.current[index + 1]?.focus();
                  }
                }}
                onKeyPress={({ nativeEvent }) => {
                  if (
                    nativeEvent.key === "Backspace" &&
                    !digits[index] &&
                    index > 0
                  ) {
                    refs.current[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton label="Verify" loading={isPending} onPress={onVerify} />
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
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.one,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    textAlign: "center",
    fontFamily: fonts.inter18.semiBold,
    fontSize: 18,
    color: Colors.light.black,
    backgroundColor: Colors.light.white,
  },
  error: {
    ...Typography.caption,
    color: Colors.light.red,
    textAlign: "center",
  },
});
