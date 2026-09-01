import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

const TARGETS = ["Prospects", "Clients", "All"];

export default function EditOffers() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("offers").select("*").order("sort");
    setRows(data ?? []); setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function add() {
    await supabase.from("offers").insert({ title: "New offer", target: "All", active: false });
    load();
  }
  async function update(id: string, patch: any) {
    setRows((r) => r.map((x) => x.id === id ? { ...x, ...patch } : x)); // instant UI
    await supabase.from("offers").update(patch).eq("id", id);
  }
  async function remove(id: string) {
    await supabase.from("offers").delete().eq("id", id); load();
  }

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={s.backBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
        <Text style={s.h1}>Offers &amp; promos</Text>

        {rows.map((o) => (
          <View key={o.id} style={s.card}>
            <View style={s.cardTop}>
              <TextInput value={o.title} onChangeText={(v) => setRows((r) => r.map((x) => x.id === o.id ? { ...x, title: v } : x))} onEndEditing={() => update(o.id, { title: o.title })} style={s.titleInput} placeholder="Offer title" placeholderTextColor={colors.muted} />
              <Pressable onPress={() => update(o.id, { active: !o.active })} style={[s.toggle, o.active && s.toggleOn]}><View style={[s.knob, o.active && s.knobOn]} /></Pressable>
            </View>
            <View style={s.targets}>
              {TARGETS.map((t) => (
                <Pressable key={t} onPress={() => update(o.id, { target: t })} style={[s.tChip, o.target === t && s.tChipOn]}>
                  <Text style={[s.tText, o.target === t && s.tTextOn]}>{t}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => remove(o.id)} style={s.del}><Ionicons name="trash-outline" size={16} color={colors.red} /></Pressable>
            </View>
          </View>
        ))}
        <Pressable onPress={add} style={s.addRow}><Ionicons name="add" size={18} color={colors.primary} /><Text style={s.addText}>Add offer</Text></Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink, marginBottom: 16 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  titleInput: { flex: 1, fontFamily: "InterBold", fontSize: 14, color: colors.ink },
  toggle: { width: 46, height: 28, borderRadius: 14, backgroundColor: colors.line, padding: 3 },
  toggleOn: { backgroundColor: colors.primary },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white },
  knobOn: { alignSelf: "flex-end" },
  targets: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  tChip: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 6 },
  tChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  tText: { fontFamily: "InterBold", fontSize: 12, color: colors.ink }, tTextOn: { color: colors.white },
  del: { marginLeft: "auto", width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  addRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 8 },
  addText: { fontFamily: "InterBold", fontSize: 13, color: colors.primary },
});