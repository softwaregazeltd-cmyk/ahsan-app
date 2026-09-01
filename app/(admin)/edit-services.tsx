import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

type Tier = { n: string; p: string; pop?: boolean; feats?: string[] };
type Service = { id: string; name: string; sort: number; tiers: Tier[] };

export default function EditServices() {
  const router = useRouter();
  const [rows, setRows] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null); // when set, show tier editor

  const load = useCallback(async () => {
    const { data } = await supabase.from("services").select("*").order("sort");
    setRows((data as Service[]) ?? []);
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function addService() {
    const { data } = await supabase
      .from("services")
      .insert({ name: "New service", sort: rows.length + 1, tiers: [{ n: "Basic", p: "$0", feats: ["Feature 1"] }] })
      .select()
      .single();
    if (data) setEditing({ ...(data as Service), tiers: (data as Service).tiers ?? [] });
    load();
  }

  async function deleteService(id: string) {
    Alert.alert("Delete service?", "This removes it from the public app.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await supabase.from("services").delete().eq("id", id); load(); } },
    ]);
  }

  // ----- Tier editor helpers (all null-safe) -----
  function patchEditing(p: Partial<Service>) { setEditing((e) => e ? { ...e, ...p } : e); }
  function setTier(i: number, k: keyof Tier, v: any) {
    patchEditing({ tiers: (editing?.tiers ?? []).map((t, idx) => idx === i ? { ...t, [k]: v } : t) });
  }
  function togglePop(i: number) {
    patchEditing({ tiers: (editing?.tiers ?? []).map((t, idx) => ({ ...t, pop: idx === i ? !t.pop : false })) });
  }
  function addTier() { patchEditing({ tiers: [...(editing?.tiers ?? []), { n: "New package", p: "$0", feats: ["New feature"] }] }); }
  function rmTier(i: number) { patchEditing({ tiers: (editing?.tiers ?? []).filter((_, idx) => idx !== i) }); }
  function setFeat(ti: number, fi: number, v: string) {
    patchEditing({ tiers: (editing?.tiers ?? []).map((t, idx) => idx === ti ? { ...t, feats: (t.feats ?? []).map((f, j) => j === fi ? v : f) } : t) });
  }
  function addFeat(ti: number) {
    patchEditing({ tiers: (editing?.tiers ?? []).map((t, idx) => idx === ti ? { ...t, feats: [...(t.feats ?? []), "New feature"] } : t) });
  }
  function rmFeat(ti: number, fi: number) {
    patchEditing({ tiers: (editing?.tiers ?? []).map((t, idx) => idx === ti ? { ...t, feats: (t.feats ?? []).filter((_, j) => j !== fi) } : t) });
  }
  async function saveTiers() {
    if (!editing) return;
    const { error } = await supabase.from("services").update({ name: editing.name, tiers: editing.tiers ?? [] }).eq("id", editing.id);
    if (error) { Alert.alert("Error", error.message); return; }
    setEditing(null);
    load();
  }

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;

  // ===== Tier editor view =====
  if (editing) {
    const tiers = editing.tiers ?? [];
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => setEditing(null)} style={s.backBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
          <Text style={s.h1}>Edit service</Text>

          <Text style={s.section}>SERVICE NAME</Text>
          <TextInput value={editing.name ?? ""} onChangeText={(v) => patchEditing({ name: v })} style={s.input} />

          <Text style={s.section}>PACKAGES · ★ = popular</Text>
          {tiers.map((t, i) => (
            <View key={i} style={s.card}>
              <View style={s.tierTop}>
                <TextInput value={t.n} onChangeText={(v) => setTier(i, "n", v)} placeholder="Package" placeholderTextColor={colors.muted} style={[s.input, { flex: 1 }]} />
                <TextInput value={t.p} onChangeText={(v) => setTier(i, "p", v)} placeholder="$0" placeholderTextColor={colors.muted} style={[s.input, { width: 90 }]} />
                <Pressable onPress={() => togglePop(i)} style={[s.star, t.pop && s.starOn]}><Text style={{ color: t.pop ? colors.limeInk : colors.muted }}>★</Text></Pressable>
                <Pressable onPress={() => rmTier(i)} style={s.rm}><Ionicons name="close" size={15} color={colors.muted} /></Pressable>
              </View>
              <Text style={s.feaLabel}>WHAT'S INCLUDED</Text>
              {(t.feats ?? []).map((f, fi) => (
                <View key={fi} style={s.feaRow}>
                  <TextInput value={f} onChangeText={(v) => setFeat(i, fi, v)} style={[s.input, { flex: 1 }]} placeholder="Feature" placeholderTextColor={colors.muted} />
                  <Pressable onPress={() => rmFeat(i, fi)} style={s.rmSmall}><Ionicons name="close" size={14} color={colors.muted} /></Pressable>
                </View>
              ))}
              <Pressable onPress={() => addFeat(i)} style={s.addRow}><Ionicons name="add" size={16} color={colors.primary} /><Text style={s.addText}>Add feature</Text></Pressable>
            </View>
          ))}
          <Pressable onPress={addTier} style={s.addRow}><Ionicons name="add" size={18} color={colors.primary} /><Text style={s.addText}>Add package</Text></Pressable>

          <View style={{ height: 12 }} />
          <Pressable style={s.saveBtn} onPress={saveTiers}><Text style={s.saveText}>Save changes</Text></Pressable>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ===== Services list view =====
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Pressable onPress={() => router.back()} style={s.backBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
      <Text style={s.h1}>Services &amp; pricing</Text>
      <Text style={s.help}>These power the public app. Tap a service to edit its packages.</Text>
      <View style={{ height: 12 }} />
      {rows.map((svc) => (
        <View key={svc.id} style={s.listRow}>
          <Pressable style={{ flex: 1 }} onPress={() => setEditing({ ...svc, tiers: svc.tiers ?? [] })}>
            <Text style={s.svcName}>{svc.name}</Text>
            <Text style={s.svcMeta}>{svc.tiers?.length ?? 0} packages · from {svc.tiers?.[0]?.p ?? "—"}</Text>
          </Pressable>
          <Pressable onPress={() => deleteService(svc.id)} style={s.del}><Ionicons name="trash-outline" size={18} color={colors.red} /></Pressable>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </View>
      ))}
      <Pressable onPress={addService} style={s.addRow}><Ionicons name="add" size={18} color={colors.primary} /><Text style={s.addText}>Add service</Text></Pressable>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink },
  help: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 8, lineHeight: 18 },
  section: { fontFamily: "InterBold", fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 22, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bgSoft, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 11, fontFamily: "Inter", fontSize: 14, color: colors.ink },
  listRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  svcName: { fontFamily: "InterBold", fontSize: 15, color: colors.ink },
  svcMeta: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 3 },
  del: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  tierTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  star: { width: 40, height: 42, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  starOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  rm: { width: 34, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: radius.md },
  rmSmall: { width: 30, height: 38, alignItems: "center", justifyContent: "center" },
  feaLabel: { fontFamily: "InterBold", fontSize: 11, color: colors.muted, letterSpacing: 0.4, marginBottom: 8 },
  feaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  addRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 8 },
  addText: { fontFamily: "InterBold", fontSize: 13, color: colors.primary },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: "center" },
  saveText: { fontFamily: "InterBold", fontSize: 15, color: colors.white },
});