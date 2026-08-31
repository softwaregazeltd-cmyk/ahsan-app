import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { supabase } from "../../src/lib/supabase";
import { colors, spacing } from "../../src/theme/tokens";

export default function AdminMenu() {
  const router = useRouter();
  async function logout() { await supabase.auth.signOut(); router.replace("/"); }
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Text style={s.h1}>Menu</Text>
      <Text style={s.sub}>Clients, earnings, and content controllers live here — built in 5B-2 and 5B-4.</Text>
      <View style={{ height: 24 }} />
      <Button label="Clients" onPress={() => router.push("/(admin)/clients")} />
      <View style={{ height: 10 }} />
      <Button label="Log out" variant="ghost" onPress={logout} />
    </ScrollView>
  );
}
const s = StyleSheet.create({ wrap: { padding: spacing.xl, paddingTop: 64 }, h1: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink }, sub: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, marginTop: 8, lineHeight: 20 } });