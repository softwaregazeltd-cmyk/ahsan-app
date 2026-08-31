import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

type QType = { n: string; price: number };
type Addon = { n: string; v: number };

export default function Quote() {
  const router = useRouter();
  const [types, setTypes] = useState<QType[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeIdx, setTypeIdx] = useState(0);
  const [sel, setSel] = useState<Set<number>>(new Set());

  useEffect(() => {
    supabase.from("app_settings").select("value").eq("key", "quote").single().then(({ data }) => {
      const v = (data?.value as any) ?? {};
      setTypes(v.types ?? []);
      setAddons(v.addons ?? []);
      setLoading(false);
    });
  }, []);

  const { low, high } = useMemo(() => {
    const base = types[typeIdx]?.price ?? 0;
    let sum = base;
    sel.forEach((i) => (sum += addons[i]?.v ?? 0));
    return { low: sum, high: sum + 700 };
  }, [types, addons, typeIdx, sel]);

  function toggle(i: number) {
    const next = new Set(sel);
    next.has(i) ? next.delete(i) : next.add(i);
    setSel(next);
  }
  const money = (n: number) => "$" + n.toLocaleString();

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={s.h1}>Quote calculator</Text>
        <Text style={s.sub}>Pick a project type and add-ons for an instant estimate in CAD. Final price is confirmed on a call.</Text>

        <Text style={s.section}>Project type</Text>
        {types.map((t, i) => (
          <Pressable key={t.n} style={[s.opt, i === typeIdx && s.optOn]} onPress={() => setTypeIdx(i)}>
            <View style={[s.radio, i === typeIdx && s.radioOn]}>
              {i === typeIdx ? <View style={s.radioDot} /> : null}
            </View>
            <Text style={s.optName}>{t.n}</Text>
            <Text style={s.optPrice}>from {money(t.price)}</Text>
          </Pressable>
        ))}

        <Text style={s.section}>Add-ons</Text>
        {addons.map((a, i) => (
          <Pressable key={a.n} style={[s.opt, sel.has(i) && s.optOn]} onPress={() => toggle(i)}>
            <View style={[s.check, sel.has(i) && s.checkOn]}>
              {sel.has(i) ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
            </View>
            <Text style={s.optName}>{a.n}</Text>
            <Text style={s.optPrice}>+${a.v}</Text>
          </Pressable>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Sticky estimate bar */}
      <View style={s.bar}>
        <View>
          <Text style={s.barLabel}>Estimated range</Text>
          <Text style={s.barValue}>{money(low)} – {money(high)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Discuss this estimate" onPress={() => router.push("/(public)/chat")} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 20 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink },
  sub: { fontFamily: "Inter", fontSize: 13, color: colors.muted, marginTop: 6, lineHeight: 19 },
  section: { fontFamily: "InterBold", fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 24, marginBottom: 10 },
  opt: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 9 },
  optOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optName: { fontFamily: "InterBold", fontSize: 14, color: colors.ink, flex: 1 },
  optPrice: { fontFamily: "InterBold", fontSize: 13, color: colors.primary },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  bar: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, paddingBottom: 22, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
  barLabel: { fontFamily: "Inter", fontSize: 11, color: colors.muted },
  barValue: { fontFamily: "JakartaBold", fontSize: 18, color: colors.ink, marginTop: 2 },
});