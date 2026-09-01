import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "../../src/components/Avatar";
import { Button } from "../../src/components/Button";
import { Pill } from "../../src/components/Pill";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

const DEFAULT = {
  name: "Rahatul Ahsan Rafi",
  role: "Senior WordPress Developer",
  available: true,
  bio: "I build fast, clean, mobile-ready WordPress sites for Canadian businesses. After 800+ projects, I've learned the hard part isn't the code — it's building a site that actually brings you clients.",
  email: "admin@rahatulahsanrafi.com",
  phone: "+1 (647) 360-2026",
  stats: [
    { label: "Years", value: "10+" },
    { label: "Projects", value: "800+" },
    { label: "Rating", value: "4.9★" },
    { label: "On-time", value: "100%" },
  ],
};

export default function About() {
  const router = useRouter();
  const [p, setP] = useState<any>(DEFAULT);

  useFocusEffect(useCallback(() => {
    supabase.from("app_settings").select("value").eq("key", "profile").maybeSingle()
      .then(({ data }) => { if (data?.value) setP({ ...DEFAULT, ...data.value }); });
  }, []));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Pressable onPress={() => router.back()} style={s.backBtn}>
        <Ionicons name="chevron-back" size={22} color={colors.ink} />
      </Pressable>

      <View style={s.header}>
        <Avatar name={p.name} size={84} />
        <Text style={s.name}>{p.name}</Text>
        <Text style={s.role}>{p.role}</Text>
        <View style={{ height: 8 }} />
        {p.available ? <Pill label="Available for new projects" tone="lime" center /> : null}
      </View>

      <Text style={s.bio}>{p.bio}</Text>

      <View style={s.statsRow}>
        {(p.stats ?? []).map((st: any, i: number) => (
          <View key={i} style={s.stat}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 20 }} />
      <Button label="Book a free call" onPress={() => router.push("/(public)/book")} />

      <Text style={s.section}>Contact</Text>
      <Pressable style={s.contactRow} onPress={() => Linking.openURL(`mailto:${p.email}`)}>
        <Ionicons name="mail-outline" size={18} color={colors.primary} />
        <Text style={s.contactText}>{p.email}</Text>
      </Pressable>
      <Pressable style={s.contactRow} onPress={() => Linking.openURL(`tel:${(p.phone || "").replace(/[^0-9+]/g, "")}`)}>
        <Ionicons name="call-outline" size={18} color={colors.primary} />
        <Text style={s.contactText}>{p.phone}</Text>
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