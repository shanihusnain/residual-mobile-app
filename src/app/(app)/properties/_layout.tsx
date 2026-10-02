import { Stack } from "expo-router";

export default function PropertiesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="filters"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
