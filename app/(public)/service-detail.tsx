import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { Pill } from "../../src/components/Pill";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

type Tier = { n: string; p: string; pop?: boolean; feats?: string[] };
type Service = { id: string; name: string; tiers: Tier[] };

export default function ServiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [svc, setSvc] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(0);

  useEffect(() => {
    if (!id) return;
    supabase.from("services").select("*").eq("id", id).single().then(({ data }) => {
      const service = data as Service | null;
      setSvc(service);
      // default to the "popular" tier if present
      const popIndex = service?.tiers?.findIndex((t) => t.pop) ?? -1;
      setSel(popIndex > -1 ? popIndex : 0);
      setLoading(false);
    });
  }, [id]);

  const tier = useMemo(() => svc?.tiers?.[sel], [svc, sel]);

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;
  if (!svc) return <View style={s.center}><Text style={{ color: colors.muted }}>Service not found.</Text></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Pressable onPress={() => router.back()} style={s.backBtn}>
        <Ionicons name="chevron-back" size={22} color={colors.ink} />
      </Pressable>

      <Text style={s.h1}>{svc.name}</Text>

      {/* Tier selector */}
      <View style={s.tierRow}>
        {svc.tiers.map((t, i) => (
          <Pressable key={t.n} onPress={() => setSel(i)} style={[s.tierChip, i === sel && s.tierChipOn]}>
            <Text style={[s.tierChipText, i === sel && s.tierChipTextOn]}>{t.n}</Text>
          </Pressable>
        ))}
      </View>

      {/* Selected tier */}
      {tier ? (
        <View style={s.card}>
          <View style={s.priceRow}>
            <Text style={s.price}>{tier.p}</Text>
            {tier.pop ? <Pill label="Popular" tone="lime" /> : null}
          </View>
          <Text style={s.included}>WHAT'S INCLUDED</Text>
          {(tier.feats ?? []).map((f) => (
            <View key={f} style={s.featRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.ok} />
              <Text style={s.featText}>{f}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ height: 16 }} />
      <Button label="Discuss this package" onPress={() => router.push("/(public)/chat")} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink, marginBottom: 16 },
  tierRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  tierChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  tierChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  tierChipText: { fontFamily: "InterBold", fontSize: 13, color: colors.ink },
  tierChipTextOn: { color: colors.white },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 18 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  price: { fontFamily: "JakartaBold", fontSize: 28, color: colors.ink },
  included: { fontFamily: "InterBold", fontSize: 11, color: colors.muted, letterSpacing: 0.5, marginBottom: 10 },
  featRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 9 },
  featText: { fontFamily: "Inter", fontSize: 14, color: colors.ink, flex: 1 },
});