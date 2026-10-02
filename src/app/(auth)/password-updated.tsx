import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppButton, AuthCard } from "@/components/ui/primitives";
import { Colors, Spacing, Typography } from "@/constants/theme";

export default function PasswordUpdatedScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.flex}>
        <AuthCard>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✓</Text>
          </View>
          <Text style={styles.title}>Password Updated</Text>
          <Text style={styles.copy}>
            Your password has been successfully updated.
          </Text>
          <AppButton
            label="Go to Login"
            onPress={() => router.replace("/(auth)/login")}
          />
        </AuthCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.authBackdrop },
  flex: { flex: 1, justifyContent: "center", padding: Spacing.four },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  badgeText: {
    fontSize: 28,
    color: Colors.light.white,
    fontWeight: "700",
  },
  title: { ...Typography.h2, textAlign: "center" },
  copy: { ...Typography.caption, textAlign: "center", lineHeight: 20 },
});
