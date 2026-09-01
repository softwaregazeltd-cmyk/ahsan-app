import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "../../src/components/Avatar";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

const PERIODS = ["This month", "This week", "All time"];

export default function Earnings() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("This month");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*, clients(company)")
      .eq("status", "Paid")
      .order("created_at", { ascending: false });
    setRows(data ?? []); setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(() => {
    const now = new Date();
    return rows.filter((r) => {
      const d = new Date(r.created_at);
      if (period === "This week") { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w; }
      if (period === "This month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [rows, period]);

  const total = filtered.reduce((s, r) => s + Number(r.amount), 0);

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Pressable onPress={() => router.back()} style={s.backBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
      <Text style={s.h1}>Earnings</Text>

      <View style={s.totalCard}>
        <Text style={s.totalN}>${total.toLocaleString()}</Text>
        <Text style={s.totalL}>{period}</Text>
      </View>

      <View style={s.chips}>
        {PERIODS.map((p) => (
          <Pressable key={p} onPress={() => setPeriod(p)} style={[s.chip, p === period && s.chipOn]}>
            <Text style={[s.chipText, p === period && s.chipTextOn]}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={s.section}>PAYMENTS ({filtered.length})</Text>
      {filtered.length === 0 ? <Text style={s.empty}>No paid invoices in this period.</Text> :
        filtered.map((r, i) => (
          <View key={r.id} style={s.row}>
            <Avatar name={r.clients?.company ?? "?"} size={38} />
            <View style={{ flex: 1 }}>
              <Text style={s.rNum}>{r.number}</Text>
              <Text style={s.rMeta}>{r.clients?.company ?? "—"}</Text>
            </View>
            <Text style={s.rAmt}>+${Number(r.amount).toLocaleString()}</Text>
          </View>
        ))
      }
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink },
  totalCard: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 22, alignItems: "center", marginTop: 16 },
  totalN: { fontFamily: "JakartaBold", fontSize: 34, color: colors.white },
  totalL: { fontFamily: "Inter", fontSize: 12.5, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  chips: { flexDirection: "row", gap: 8, marginTop: 16 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: "InterBold", fontSize: 12.5, color: colors.ink }, chipTextOn: { color: colors.white },
  section: { fontFamily: "InterBold", fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 24, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 13, marginBottom: 10 },
  rNum: { fontFamily: "InterBold", fontSize: 13.5, color: colors.ink }, rMeta: { fontFamily: "Inter", fontSize: 11.5, color: colors.muted, marginTop: 2 },
  rAmt: { fontFamily: "JakartaBold", fontSize: 15, color: colors.ok },
  empty: { fontFamily: "Inter", fontSize: 13, color: colors.muted },
});