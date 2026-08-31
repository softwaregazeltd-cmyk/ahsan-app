import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

type Tier = { n: string; p: string; pop?: boolean; feats?: string[] };
type Service = { id: string; name: string; tiers: Tier[] };

const TILE_COLORS = ["#F2751A", "#4EA1F7", "#3AA76D", "#E0A63C", "#2E74E8", "#B98CF0"];

export default function Services() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("services").select("*").order("sort").then(({ data, error }) => {
      if (error) setErr(error.message);
      else setServices((data as Service[]) ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Text style={s.h1}>Services</Text>
      <Text style={s.sub}>Pick a service to see packages and pricing.</Text>
      <View style={{ height: 16 }} />
      {err ? <Text style={{ color: colors.red }}>{err}</Text> : null}
      {services.map((svc, i) => {
        const from = svc.tiers?.[0]?.p ?? "";
        return (
          <Pressable
            key={svc.id}
            style={s.row}
            onPress={() => router.push({ pathname: "/(public)/service-detail", params: { id: svc.id } })}
          >
            <View style={[s.icon, { backgroundColor: TILE_COLORS[i % TILE_COLORS.length] }]}>
              <Ionicons name="layers-outline" size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{svc.name}</Text>
              <Text style={s.meta}>{svc.tiers?.length ?? 0} packages · from {from}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  wrap: { padding: spacing.xl, paddingTop: 64, paddingBottom: 40 },
  h1: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink },
  sub: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, marginTop: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  name: { fontFamily: "InterBold", fontSize: 15, color: colors.ink },
  meta: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 3 },
});