import { Image } from "expo-image";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { BrandLogo } from "@/components/brand-logo";
import { AppButton, Screen } from "@/components/ui/primitives";
import { Colors, Spacing } from "@/constants/theme";

export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      <Image
        source={require("@/assets/images/authbgimage.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={styles.scrim} />
      <Screen style={styles.content} padded>
        <BrandLogo size={32} light />
        <View style={styles.actions}>
          <AppButton label="Login" onPress={() => router.push("/(auth)/login")} />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.authBackdrop },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    gap: Spacing.five,
    paddingBottom: Spacing.five,
  },
  actions: { gap: Spacing.two },
});
