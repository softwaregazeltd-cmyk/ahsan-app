import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../../src/components/Button";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

export default function EditQuote() {
  const router = useRouter();
  const [types, setTypes] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  useFocusEffect(useCallback(() => {
    supabase.from("app_settings").select("value").eq("key", "quote").maybeSingle().then(({ data }) => {
      const v = data?.value ?? {}; setTypes(v.types ?? []); setAddons(v.addons ?? []);
    });
  }, []));

  const setType = (i: number, k: "n" | "price", v: string) =>
    setTypes((a) => a.map((t, idx) => idx === i ? { ...t, [k]: k === "price" ? (parseFloat(v) || 0) : v } : t));
  const setAddon = (i: number, k: "n" | "v", v: string) =>
    setAddons((a) => a.map((t, idx) => idx === i ? { ...t, [k]: k === "v" ? (parseFloat(v) || 0) : v } : t));

  async function save() {
    setBusy(true);
    const { error } = await supabase.from("app_settings").update({ value: { types, addons }, updated_at: new Date().toISOString() }).eq("key", "quote");
    setBusy(false);
    if (error) { Alert.alert("Error", error.message); return; }
    Alert.alert("Saved", "Quote calculator updated.");
    router.back();
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={s.backBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
        <Text style={s.h1}>Quote calculator</Text>

        <Text style={s.section}>PROJECT TYPES · name · base price</Text>
        {types.map((t, i) => (
          <View key={i} style={s.row}>
            <TextInput value={t.n} onChangeText={(v) => setType(i, "n", v)} placeholder="Type" placeholderTextColor={colors.muted} style={[s.input, { flex: 1 }]} />
            <TextInput value={String(t.price)} onChangeText={(v) => setType(i, "price", v)} keyboardType="numeric" style={[s.input, { width: 90, textAlign: "right" }]} />
            <Pressable onPress={() => setTypes((a) => a.filter((_, idx) => idx !== i))} style={s.rm}><Ionicons name="close" size={15} color={colors.muted} /></Pressable>
          </View>
        ))}
        <Pressable onPress={() => setTypes((a) => [...a, { n: "New type", price: 0 }])} style={s.addRow}><Ionicons name="add" size={18} color={colors.primary} /><Text style={s.addText}>Add type</Text></Pressable>

        <Text style={s.section}>ADD-ONS · name · +$</Text>
        {addons.map((a, i) => (
          <View key={i} style={s.row}>
            <TextInput value={a.n} onChangeText={(v) => setAddon(i, "n", v)} placeholder="Add-on" placeholderTextColor={colors.muted} style={[s.input, { flex: 1 }]} />
            <TextInput value={String(a.v)} onChangeText={(v) => setAddon(i, "v", v)} keyboardType="numeric" style={[s.input, { width: 90, textAlign: "right" }]} />
            <Pressable onPress={() => setAddons((arr) => arr.filter((_, idx) => idx !== i))} style={s.rm}><Ionicons name="close" size={15} color={colors.muted} /></Pressable>
          </View>
        ))}
        <Pressable onPress={() => setAddons((a) => [...a, { n: "New add-on", v: 0 }])} style={s.addRow}><Ionicons name="add" size={18} color={colors.primary} /><Text style={s.addText}>Add add-on</Text></Pressable>

        <Text style={s.note}>Customer's total = low estimate; high = total + $700.</Text>
        <View style={{ height: 10 }} />
        <Button label={busy ? "Saving…" : "Save changes"} onPress={save} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink },
  section: { fontFamily: "InterBold", fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 22, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 9 },
  input: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bgSoft, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 11, fontFamily: "Inter", fontSize: 14, color: colors.ink },
  rm: { width: 34, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: radius.md },
  addRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 8 },
  addText: { fontFamily: "InterBold", fontSize: 13, color: colors.primary },
  note: { fontFamily: "Inter", fontSize: 11.5, color: colors.muted, marginTop: 14, lineHeight: 17 },
});