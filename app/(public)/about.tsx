import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "../../src/components/Avatar";
import { Button } from "../../src/components/Button";
import { Pill } from "../../src/components/Pill";
import { colors, radius, spacing } from "../../src/theme/tokens";

const STATS = [
  { label: "Years", value: "10+" },
  { label: "Projects", value: "800+" },
  { label: "Rating", value: "4.9★" },
  { label: "On-time", value: "100%" },
];

export default function About() {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Pressable onPress={() => router.back()} style={s.backBtn}>
        <Ionicons name="chevron-back" size={22} color={colors.ink} />
      </Pressable>

      <View style={s.header}>
        <Avatar name="Rahatul Ahsan" size={84} />
        <Text style={s.name}>Rahatul Ahsan Rafi</Text>
        <Text style={s.role}>Senior WordPress Developer</Text>
        <View style={{ height: 8 }} />
        <Pill label="Available for new projects" tone="lime" />
      </View>

      <Text style={s.bio}>
        I build fast, clean, mobile-ready WordPress sites for Canadian businesses. After 800+ projects,
        I've learned the hard part isn't the code — it's building a site that actually brings you clients.
      </Text>

      <View style={s.statsRow}>
        {STATS.map((st) => (
          <View key={st.label} style={s.stat}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 20 }} />
      <Button label="Book a free call" onPress={() => router.push("/(public)/chat")} />

      <Text style={s.section}>Contact</Text>
      <Pressable style={s.contactRow} onPress={() => Linking.openURL("mailto:admin@rahatulahsanrafi.com")}>
        <Ionicons name="mail-outline" size={18} color={colors.primary} />
        <Text style={s.contactText}>admin@rahatulahsanrafi.com</Text>
      </Pressable>
      <Pressable style={s.contactRow} onPress={() => Linking.openURL("tel:+16473602026")}>
        <Ionicons name="call-outline" size={18} color={colors.primary} />
        <Text style={s.contactText}>+1 (647) 360-2026</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  header: { alignItems: "center", marginBottom: 20 },
  name: { fontFamily: "JakartaBold", fontSize: 22, color: colors.ink, marginTop: 12 },
  role: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, marginTop: 4 },
  bio: { fontFamily: "Inter", fontSize: 14, color: colors.ink, lineHeight: 22, textAlign: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  stat: { flex: 1, backgroundColor: colors.bgSoft, borderRadius: radius.md, paddingVertical: 14, alignItems: "center" },
  statValue: { fontFamily: "JakartaBold", fontSize: 18, color: colors.primary },
  statLabel: { fontFamily: "Inter", fontSize: 11, color: colors.muted, marginTop: 3 },
  section: { fontFamily: "InterBold", fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 28, marginBottom: 12 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  contactText: { fontFamily: "Inter", fontSize: 14, color: colors.ink },
});