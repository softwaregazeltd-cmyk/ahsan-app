import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors } from "../../src/theme/tokens";

export default function PublicTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: "InterBold", fontSize: 11 },
        tabBarStyle: { borderTopColor: colors.line, height: 84, paddingTop: 8 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="services"
        options={{ title: "Services", tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: "Chat", tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="client"
        options={{ title: "Client", tabBarIcon: ({ color, size }) => <Ionicons name="lock-closed-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: "More", tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" size={size} color={color} /> }}
      />
      {/* Pushed screen — not a tab */}
      <Tabs.Screen name="service-detail" options={{ href: null }} />
    </Tabs>
  );
}