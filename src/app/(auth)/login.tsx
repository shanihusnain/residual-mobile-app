import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useLogin } from "@/api/mutations/useLogin";
import { BrandLogo } from "@/components/brand-logo";
import {
  AppButton,
  AppInput,
  AuthCard,
  DismissKeyboard,
} from "@/components/ui/primitives";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useSession } from "@/providers/auth";

export default function LoginScreen() {
  const { signIn } = useSession();
  const { mutateAsync, isPending } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter email and password");
      return;
    }
    try {
      const data = await mutateAsync({
        email: email.trim(),
        password,
      });
      // Stack.Protected switches to (app) when session is set — no manual navigate.
      await signIn(data.access_token, data.refresh_token, data.user);
    } catch {
      // Toast handled in mutation onError
    }
  }

  return (
    <DismissKeyboard style={styles.root}>
      <Image
        source={require("@/assets/images/authbgimage.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={styles.scrim} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <AuthCard>
          <BrandLogo size={26} style={styles.logo} />
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
          <AppInput
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            editable={!isPending}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton label="Login" loading={isPending} onPress={onLogin} />
          <Pressable
            disabled={isPending}
            onPress={() => router.push("/(auth)/reset-password")}
          >
            <Text style={styles.link}>Forgot Password?</Text>
          </Pressable>
        </AuthCard>
      </KeyboardAvoidingView>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.authBackdrop },
  flex: { flex: 1, justifyContent: "center", padding: Spacing.four },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  logo: { alignSelf: "center", marginBottom: Spacing.one },
  link: {
    ...Typography.link,
    textAlign: "center",
    marginTop: Spacing.one,
  },
  error: {
    ...Typography.caption,
    color: Colors.light.red,
    textAlign: "center",
  },
});
