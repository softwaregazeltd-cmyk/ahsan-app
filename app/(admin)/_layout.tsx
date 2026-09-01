import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../src/auth";
import { colors } from "../../src/theme/tokens";

export default function AdminTabs() {
  const { role, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator color={colors.primary} /></View>;
  if (role !== "admin") return <Redirect href="/" />;

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
      <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="chats" options={{ title: "Chats", tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="projects" options={{ title: "Projects", tabBarIcon: ({ color, size }) => <Ionicons name="folder-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="invoices" options={{ title: "Invoices", tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="menu" options={{ title: "Menu", tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="clients" options={{ href: null }} />
      <Tabs.Screen name="client-new" options={{ href: null }} />
      <Tabs.Screen name="client-detail" options={{ href: null }} />
      <Tabs.Screen name="project-new" options={{ href: null }} />
      <Tabs.Screen name="project-detail" options={{ href: null }} />
      <Tabs.Screen name="invoice-new" options={{ href: null }} />
      <Tabs.Screen name="invoice-detail" options={{ href: null }} />
    </Tabs>
  );
}