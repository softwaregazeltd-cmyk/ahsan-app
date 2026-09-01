import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

export default function EditReviews() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("reviews").select("*").order("sort");
    setRows(data ?? []); setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function add() { await supabase.from("reviews").insert({ name: "New reviewer", role: "Role, Company", stars: 5, published: false }); load(); }
  async function update(id: string, patch: any) {
    setRows((r) => r.map((x) => x.id === id ? { ...x, ...patch } : x));
    await supabase.from("reviews").update(patch).eq("id", id);
  }
  async function remove(id: string) { await supabase.from("reviews").delete().eq("id", id); load(); }

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={s.backBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
        <Text style={s.h1}>Reviews</Text>
        <Text style={s.help}>Video reviews via YouTube. Toggle Publish to show one in the public app.</Text>
        <View style={{ height: 12 }} />

        {rows.map((r) => (
          <View key={r.id} style={s.card}>
            <View style={s.cardTop}>
              <View style={{ flex: 1 }}>
                <TextInput value={r.name} onChangeText={(v) => setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, name: v } : x))} onEndEditing={() => update(r.id, { name: r.name })} style={s.nameInput} placeholder="Reviewer name" placeholderTextColor={colors.muted} />
                <TextInput value={r.role ?? ""} onChangeText={(v) => setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, role: v } : x))} onEndEditing={() => update(r.id, { role: r.role })} style={s.roleInput} placeholder="Role, Company" placeholderTextColor={colors.muted} />
              </View>
              <Pressable onPress={() => remove(r.id)} style={s.del}><Ionicons name="trash-outline" size={18} color={colors.red} /></Pressable>
            </View>
            <View style={s.ytRow}>
              <View style={s.ytTag}><Text style={s.ytText}>▶ YouTube</Text></View>
              <TextInput value={r.youtube ?? ""} onChangeText={(v) => setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, youtube: v } : x))} onEndEditing={() => update(r.id, { youtube: r.youtube })} style={[s.input, { flex: 1 }]} placeholder="youtu.be/…" placeholderTextColor={colors.muted} autoCapitalize="none" />
            </View>
            <View style={s.bottomRow}>
              <Text style={s.stars}>{"★".repeat(r.stars)}</Text>
              <View style={s.publishRow}>
                <Text style={[s.publishText, { color: r.published ? colors.ok : colors.muted }]}>{r.published ? "Published" : "Hidden"}</Text>
                <Pressable onPress={() => update(r.id, { published: !r.published })} style={[s.toggle, r.published && s.toggleOn]}><View style={[s.knob, r.published && s.knobOn]} /></Pressable>
              </View>
            </View>
          </View>
        ))}
        <Pressable onPress={add} style={s.addRow}><Ionicons name="add" size={18} color={colors.primary} /><Text style={s.addText}>Add review</Text></Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink },
  help: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 8, lineHeight: 18 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  nameInput: { fontFamily: "InterBold", fontSize: 14, color: colors.ink, paddingVertical: 2 },
  roleInput: { fontFamily: "Inter", fontSize: 12, color: colors.muted, paddingVertical: 2, marginTop: 2 },
  del: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  ytRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  ytTag: { backgroundColor: colors.redSoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  ytText: { fontFamily: "InterBold", fontSize: 11, color: colors.red },
  input: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bgSoft, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontFamily: "Inter", fontSize: 13, color: colors.ink },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  stars: { color: colors.primary, fontSize: 14, letterSpacing: 1 },
  publishRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  publishText: { fontFamily: "InterBold", fontSize: 12 },
  toggle: { width: 46, height: 28, borderRadius: 14, backgroundColor: colors.line, padding: 3 },
  toggleOn: { backgroundColor: colors.primary },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white },
  knobOn: { alignSelf: "flex-end" },
  addRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 8 },
  addText: { fontFamily: "InterBold", fontSize: 13, color: colors.primary },
});