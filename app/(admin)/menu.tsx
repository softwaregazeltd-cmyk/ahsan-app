import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

type Item = { icon: keyof typeof Ionicons.glyphMap; label: string; go: string };

const ITEMS: Item[] = [
  { icon: "people-outline", label: "Clients", go: "/(admin)/clients" },
  { icon: "cash-outline", label: "Earnings", go: "/(admin)/earnings" },
  { icon: "layers-outline", label: "Services & pricing", go: "/(admin)/edit-services" },
  { icon: "person-outline", label: "About / Profile", go: "/(admin)/edit-profile" },
  { icon: "calculator-outline", label: "Quote calculator", go: "/(admin)/edit-quote" },
  { icon: "pricetag-outline", label: "Offers", go: "/(admin)/edit-offers" },
  { icon: "star-outline", label: "Reviews", go: "/(admin)/edit-reviews" },
];

export default function AdminMenu() {
  const router = useRouter();
  async function logout() { await supabase.auth.signOut(); router.replace("/"); }
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Text style={s.h1}>Menu</Text>
      <View style={{ height: 16 }} />
      {ITEMS.map((it) => (
        <Pressable key={it.label} style={s.row} onPress={() => router.push(it.go as any)}>
          <View style={s.icon}><Ionicons name={it.icon} size={18} color={colors.primary} /></View>
          <Text style={s.label}>{it.label}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      ))}
      <View style={{ height: 20 }} />
      <Button label="Log out" variant="ghost" onPress={logout} />
      <Text style={s.footer}>RAHATUL · Admin</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingTop: 64, paddingBottom: 40 },
  h1: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, marginBottom: 10 },
  icon: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  label: { fontFamily: "InterBold", fontSize: 14, color: colors.ink, flex: 1 },
  footer: { fontFamily: "Inter", fontSize: 12, color: colors.muted, textAlign: "center", marginTop: 24 },
});