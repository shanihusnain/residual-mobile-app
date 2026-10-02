import { Stack } from "expo-router";

export default function ListingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="portal"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}
