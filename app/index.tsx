import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/auth";

export default function Index() {
  const { role, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator /></View>;

  if (role === "admin") {

    return <Redirect href="/(admin)/home" />;
  }
  // client portal comes later; visitors + clients use public for now

  return <Redirect href="/(public)/home" />;
}