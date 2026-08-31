import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../src/theme/tokens";

type Item = { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void };

export default function More() {
  const router = useRouter();

  const items: Item[] = [
    { icon: "person-outline", label: "About Rahatul", onPress: () => router.push("/(public)/about") },
    { icon: "calculator-outline", label: "Quote calculator", onPress: () => router.push("/(public)/quote") },
    { icon: "briefcase-outline", label: "Services", onPress: () => router.push("/(public)/services") },
    { icon: "lock-closed-outline", label: "Client login", onPress: () => router.push("/login") },
    { icon: "mail-outline", label: "Contact", onPress: () => Linking.openURL("mailto:admin@rahatulahsanrafi.com") },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Text style={s.h1}>More</Text>
      <View style={{ height: 16 }} />
      {items.map((it) => (
        <Pressable key={it.label} style={s.row} onPress={it.onPress}>
          <View style={s.icon}><Ionicons name={it.icon} size={18} color={colors.primary} /></View>
          <Text style={s.label}>{it.label}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      ))}
      <Text style={s.footer}>RAHATUL · Senior WordPress Developer</Text>
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