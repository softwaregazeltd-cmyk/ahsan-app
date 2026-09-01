import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

export default function EditProfile() {
  const router = useRouter();
  const [p, setP] = useState<any>({ name: "", role: "", bio: "", email: "", phone: "", available: true, stats: [] });
  const [busy, setBusy] = useState(false);

  useFocusEffect(useCallback(() => {
    supabase.from("app_settings").select("value").eq("key", "profile").maybeSingle()
      .then(({ data }) => { if (data?.value) setP(data.value); });
  }, []));

  const set = (k: string) => (v: string) => setP((prev: any) => ({ ...prev, [k]: v }));
  const setStat = (i: number, k: "label" | "value", v: string) =>
    setP((prev: any) => ({ ...prev, stats: prev.stats.map((st: any, idx: number) => idx === i ? { ...st, [k]: v } : st) }));

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("app_settings").update({ value: p, updated_at: new Date().toISOString() }).eq("key", "profile");
    setBusy(false);
    if (error) { Alert.alert("Error", error.message); return; }
    Alert.alert("Saved", "Profile updated.");
    router.back();
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={s.backBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
        <Text style={s.h1}>About / Profile</Text>

        <Pressable style={s.avail} onPress={() => setP((prev: any) => ({ ...prev, available: !prev.available }))}>
          <Text style={s.availText}>Available for new projects</Text>
          <View style={[s.toggle, p.available && s.toggleOn]}><View style={[s.knob, p.available && s.knobOn]} /></View>
        </Pressable>

        <Input label="NAME" value={p.name} onChangeText={set("name")} />
        <Input label="ROLE / TAGLINE" value={p.role} onChangeText={set("role")} />
        <Input label="BIO" value={p.bio} onChangeText={set("bio")} multiline style={{ height: 100, textAlignVertical: "top" }} />

        <Text style={s.section}>HOME STATS</Text>
        {(p.stats ?? []).map((st: any, i: number) => (
          <View key={i} style={s.statRow}>
            <TextInput value={st.label} onChangeText={(v) => setStat(i, "label", v)} placeholder="Label" placeholderTextColor={colors.muted} style={[s.input, { flex: 1 }]} />
            <TextInput value={st.value} onChangeText={(v) => setStat(i, "value", v)} placeholder="Value" placeholderTextColor={colors.muted} style={[s.input, { width: 100, textAlign: "center" }]} />
          </View>
        ))}

        <Text style={s.section}>CONTACT</Text>
        <Input label="EMAIL" value={p.email} onChangeText={set("email")} autoCapitalize="none" />
        <Input label="PHONE" value={p.phone} onChangeText={set("phone")} />

        <View style={{ height: 8 }} />
        <Button label={busy ? "Saving…" : "Save changes"} onPress={save} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink, marginBottom: 16 },
  avail: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 14, marginBottom: 16, backgroundColor: colors.card },
  availText: { fontFamily: "InterBold", fontSize: 13.5, color: colors.ink },
  toggle: { width: 46, height: 28, borderRadius: 14, backgroundColor: colors.line, padding: 3 },
  toggleOn: { backgroundColor: colors.primary },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white },
  knobOn: { alignSelf: "flex-end" },
  section: { fontFamily: "InterBold", fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 20, marginBottom: 10 },
  statRow: { flexDirection: "row", gap: 8, marginBottom: 9 },
  input: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bgSoft, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 11, fontFamily: "Inter", fontSize: 14, color: colors.ink },
});