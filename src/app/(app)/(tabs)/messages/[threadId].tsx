import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { fonts } from "@/assets/fonts";
import { AppButton, HeaderBar, Screen } from "@/components/ui/primitives";
import { Colors, Spacing } from "@/constants/theme";

export default function MessageThreadScreen() {
  return (
    <Screen>
      <HeaderBar title="Messages" showBack />
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Use property communications</Text>
        <Text style={styles.emptyBody}>
          Conversations are available under each property’s Communications tab.
        </Text>
        <AppButton
          label="Go to Properties"
          onPress={() => router.push("/(app)/properties")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  emptyTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 18,
    color: Colors.light.black,
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: fonts.inter18.regular,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
