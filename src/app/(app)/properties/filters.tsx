import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { fonts } from "@/assets/fonts";
import { AppButton, HeaderBar, Screen } from "@/components/ui/primitives";
import { OWNER_PROJECT_STATUSES } from "@/constants/project-status";
import { Colors, Radius, Spacing } from "@/constants/theme";

export default function FiltersScreen() {
  const params = useLocalSearchParams<{ status?: string; q?: string }>();
  const [status, setStatus] = useState<string>(
    typeof params.status === "string" ? params.status : "All",
  );

  function apply() {
    router.replace({
      pathname: "/(app)/properties",
      params: {
        status: status !== "All" ? status : undefined,
        q: typeof params.q === "string" && params.q ? params.q : undefined,
      },
    });
  }

  return (
    <Screen>
      <HeaderBar title="Filters" showBack />
      <View style={styles.body}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.chips}>
          <Pressable
            onPress={() => setStatus("All")}
            style={[styles.chip, status === "All" && styles.chipActive]}
          >
            <Text
              style={[styles.chipText, status === "All" && styles.chipTextActive]}
            >
              All
            </Text>
          </Pressable>
          {OWNER_PROJECT_STATUSES.map((item) => (
            <Pressable
              key={item.code}
              onPress={() => setStatus(item.code)}
              style={[styles.chip, status === item.code && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  status === item.code && styles.chipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <AppButton label="Apply Filters" onPress={apply} />
        <AppButton
          label="Reset"
          variant="ghost"
          onPress={() => {
            setStatus("All");
            router.replace({
              pathname: "/(app)/properties",
              params: {
                q:
                  typeof params.q === "string" && params.q
                    ? params.q
                    : undefined,
              },
            });
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.three, marginTop: Spacing.two },
  label: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.black,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    backgroundColor: Colors.light.lightGray,
  },
  chipActive: { backgroundColor: Colors.light.primary },
  chipText: {
    fontFamily: fonts.inter18.medium,
    fontSize: 13,
    color: Colors.light.darkGray,
  },
  chipTextActive: { color: Colors.light.white },
});
