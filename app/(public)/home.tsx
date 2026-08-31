import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "../../src/components/Avatar";
import { Button } from "../../src/components/Button";
import { Pill } from "../../src/components/Pill";
import { colors, radius, spacing } from "../../src/theme/tokens";

type Action = { icon: keyof typeof Ionicons.glyphMap; label: string; go: string };

const ACTIONS: Action[] = [
  { icon: "calculator-outline", label: "Get quote", go: "/(public)/quote" },
  { icon: "calendar-outline", label: "Book call", go: "/(public)/home" },
  { icon: "chatbubble-outline", label: "Live chat", go: "/(public)/chat" },
  { icon: "grid-outline", label: "See work", go: "/(public)/services" },
];

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      {/* Profile bar */}
      <View style={s.topbar}>
        <Avatar name="Rahatul Ahsan" size={44} />
        <View style={{ flex: 1 }}>
          <Text style={s.name}>Rahatul Ahsan</Text>
          <View style={s.availRow}>
            <View style={s.dot} />
            <Text style={s.availText}>Available for new projects</Text>
          </View>
        </View>
        <Pressable style={s.iconBtn} onPress={() => router.push("/(public)/more")}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.ink} />
        </Pressable>
      </View>

      {/* Hero card */}
      <View style={s.hero}>
        <Pill label="Senior WordPress Developer" tone="lime" />
        <Text style={s.heroTitle}>Turn your visitors into paying clients</Text>
        <Text style={s.heroSub}>Fast, clean, mobile-ready WordPress sites — built to convert.</Text>
        <View style={{ height: 14 }} />
        <View style={s.heroBtns}>
          <View style={{ flex: 1 }}>
            <Button label="Book a free call" onPress={() => router.push("/(public)/home")} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Watch intro" variant="ghost" onPress={() => router.push("/(public)/home")} />
          </View>
        </View>
      </View>

      {/* Quick actions */}
      <Text style={s.section}>Quick actions</Text>
      <View style={s.grid}>
        {ACTIONS.map((a) => (
          <Pressable key={a.label} style={s.tile} onPress={() => router.push(a.go as any)}>
            <View style={s.tileIcon}>
              <Ionicons name={a.icon} size={22} color={colors.primary} />
            </View>
            <Text style={s.tileLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingTop: 64, paddingBottom: 40 },
  topbar: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  name: { fontFamily: "JakartaBold", fontSize: 16, color: colors.ink },
  availRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.ok },
  availText: { fontFamily: "Inter", fontSize: 12, color: colors.muted },
  iconBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },

  hero: { backgroundColor: colors.bgSoft, borderRadius: radius.xl, padding: 20, borderWidth: 1, borderColor: colors.line },
  heroTitle: { fontFamily: "JakartaBold", fontSize: 22, color: colors.ink, marginTop: 12, lineHeight: 28 },
  heroSub: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, marginTop: 8, lineHeight: 20 },
  heroBtns: { flexDirection: "row", gap: 10 },

  section: { fontFamily: "InterBold", fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 28, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47%", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16, gap: 10 },
  tileIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  tileLabel: { fontFamily: "InterBold", fontSize: 14, color: colors.ink },
});