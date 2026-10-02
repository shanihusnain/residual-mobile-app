import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { fonts } from "@/assets/fonts";
import { AppButton, HeaderBar, Screen } from "@/components/ui/primitives";
import { Colors, Spacing } from "@/constants/theme";

export default function MessagesScreen() {
  return (
    <Screen padded={false}>
      <View style={styles.pad}>
        <HeaderBar
          title="Messages"
          subtitle="Project communications live on each property."
          showMenu
          showBell
        />
      </View>
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Open a property to message</Text>
        <Text style={styles.emptyBody}>
          Threads are scoped to each project. Go to Properties, open a project,
          then use the Communications tab.
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
  pad: { paddingHorizontal: Spacing.four },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
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
