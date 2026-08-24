import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/auth";

export default function Index() {
  const { role, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator /></View>;

  // For now, client + admin both land on public tabs; we'll point these at
  // the portal/admin areas when we build them.
  
  return <Redirect href="/(public)/home" />;
}