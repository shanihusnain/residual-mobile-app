import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppDrawerContent } from "@/components/app-drawer";

export default function AppLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => (
          <AppDrawerContent navigation={props.navigation} />
        )}
        screenOptions={{
          headerShown: false,
          drawerType: "front",
          overlayColor: "rgba(0,0,0,0.35)",
          drawerStyle: { width: 300 },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{ drawerLabel: "Dashboard", title: "Dashboard" }}
        />
        <Drawer.Screen
          name="properties"
          options={{ drawerLabel: "Properties", title: "Properties" }}
        />
        <Drawer.Screen
          name="listings"
          options={{ drawerLabel: "Listings", title: "Listings" }}
        />
        <Drawer.Screen
          name="offers"
          options={{ drawerLabel: "Offers", title: "Offers" }}
        />
        <Drawer.Screen
          name="notifications"
          options={{
            drawerItemStyle: { display: "none" },
            drawerLabel: () => null,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
