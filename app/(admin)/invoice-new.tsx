import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../../src/components/Button";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

type Item = { d: string; a: string };
const METHODS = [{ id: "wu", label: "Western Union" }, { id: "bank", label: "Bank transfer" }, { id: "payo", label: "Payoneer" }];

export default function InvoiceNew() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [items, setItems] = useState<Item[]>([{ d: "Website design", a: "999" }]);
  const [discountPct, setDiscountPct] = useState("0");
  const [methods, setMethods] = useState<string[]>(["wu", "bank", "payo"]);
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);

  useFocusEffect(useCallback(() => {
    supabase.from("clients").select("id,contact,company").eq("archived", false).order("contact").then(({ data }) => {
      setClients(data ?? []);
      if (!clientId && data?.length) setClientId(data[0].id);
    });
  }, [clientId]));

  // load projects for the chosen client
  useFocusEffect(useCallback(() => {
    if (!clientId) return;
    supabase.from("projects").select("id,name").eq("client_id", clientId).then(({ data }) => {
      setProjects(data ?? []);
      setProjectId(data?.[0]?.id ?? "");
    });
  }, [clientId]));

  const subtotal = useMemo(() => items.reduce((s, it) => s + (parseFloat(it.a) || 0), 0), [items]);
  const discount = Math.round((subtotal * (parseFloat(discountPct) || 0)) / 100);
  const total = subtotal - discount;

  function setItem(i: number, key: keyof Item, v: string) { setItems((arr) => arr.map((it, idx) => idx === i ? { ...it, [key]: v } : it)); }
  function addItem() { setItems((a) => [...a, { d: "", a: "0" }]); }
  function rmItem(i: number) { setItems((a) => a.filter((_, idx) => idx !== i)); }
  function toggleMethod(id: string) { setMethods((m) => m.includes(id) ? m.filter((x) => x !== id) : [...m, id]); }

  async function create(send: boolean) {
    if (!clientId) { Alert.alert("Pick a client"); return; }
    setBusy(true);
    const number = "#" + (1000 + Math.floor(Math.random() * 9000));
    const { data: inv, error } = await supabase.from("invoices").insert({
      number, client_id: clientId, project_id: projectId || null,
      amount: total, methods, due: due.trim() || null,
      status: send ? "Awaiting payment" : "Awaiting payment",
    }).select().single();
    if (!error && inv) {
      await supabase.from("invoice_events").insert({ invoice_id: inv.id, text: `Invoice sent · ${number} · $${total.toLocaleString()}`, tone: "amber" });
    }
    setBusy(false);
    if (error) { Alert.alert("Could not create invoice", error.message); return; }
    Alert.alert("Invoice created", `${number} for $${total.toLocaleString()}`);
    router.back();
  }

  const money = (n: number) => "$" + n.toLocaleString();

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={s.backBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
        <Text style={s.h1}>New invoice</Text>

        <Text style={s.label}>CLIENT</Text>
        <View style={s.chips}>
          {clients.map((c) => (
            <Pressable key={c.id} onPress={() => setClientId(c.id)} style={[s.chip, c.id === clientId && s.chipOn]}>
              <Text style={[s.chipText, c.id === clientId && s.chipTextOn]}>{c.contact} — {c.company}</Text>
            </Pressable>
          ))}
        </View>

        {projects.length > 0 && (
          <>
            <Text style={s.label}>PROJECT (optional)</Text>
            <View style={s.chips}>
              <Pressable onPress={() => setProjectId("")} style={[s.chip, projectId === "" && s.chipOn]}>
                <Text style={[s.chipText, projectId === "" && s.chipTextOn]}>None</Text>
              </Pressable>
              {projects.map((p) => (
                <Pressable key={p.id} onPress={() => setProjectId(p.id)} style={[s.chip, p.id === projectId && s.chipOn]}>
                  <Text style={[s.chipText, p.id === projectId && s.chipTextOn]}>{p.name}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Text style={s.label}>LINE ITEMS</Text>
        {items.map((it, i) => (
          <View key={i} style={s.itemRow}>
            <TextInput placeholder="Description" placeholderTextColor={colors.muted} value={it.d} onChangeText={(v) => setItem(i, "d", v)} style={[s.input, { flex: 1 }]} />
            <TextInput placeholder="0" placeholderTextColor={colors.muted} value={it.a} onChangeText={(v) => setItem(i, "a", v)} keyboardType="numeric" style={[s.input, { width: 84, textAlign: "right" }]} />
            <Pressable onPress={() => rmItem(i)} style={s.rm}><Ionicons name="close" size={15} color={colors.muted} /></Pressable>
          </View>
        ))}
        <Pressable onPress={addItem} style={s.addRow}><Ionicons name="add" size={18} color={colors.primary} /><Text style={s.addText}>Add line item</Text></Pressable>

        <Text style={s.label}>DISCOUNT (%)</Text>
        <TextInput value={discountPct} onChangeText={setDiscountPct} keyboardType="numeric" style={[s.input, { width: 90 }]} />

        <Text style={s.label}>PAYMENT METHODS SHOWN</Text>
        {METHODS.map((m) => (
          <Pressable key={m.id} onPress={() => toggleMethod(m.id)} style={[s.method, methods.includes(m.id) && s.methodOn]}>
            <View style={[s.check, methods.includes(m.id) && s.checkOn]}>{methods.includes(m.id) ? <Ionicons name="checkmark" size={13} color={colors.white} /> : null}</View>
            <Text style={s.methodText}>{m.label}</Text>
          </Pressable>
        ))}

        <Text style={s.label}>DUE DATE (YYYY-MM-DD)</Text>
        <TextInput value={due} onChangeText={setDue} placeholder="2026-09-15" placeholderTextColor={colors.muted} autoCapitalize="none" style={[s.input, { width: 160 }]} />

        <View style={s.totalBox}>
          <View style={s.totalRow}><Text style={s.tK}>Subtotal</Text><Text style={s.tV}>{money(subtotal)}</Text></View>
          {discount > 0 && <View style={s.totalRow}><Text style={[s.tK, { color: colors.ok }]}>Discount ({discountPct}%)</Text><Text style={[s.tV, { color: colors.ok }]}>−{money(discount)}</Text></View>}
          <View style={[s.totalRow, s.totalFinal]}><Text style={s.tTotal}>Total</Text><Text style={s.tTotal}>{money(total)} CAD</Text></View>
        </View>

        <View style={{ height: 10 }} />
        <Button label={busy ? "Creating…" : "Send invoice"} onPress={() => create(true)} />
        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink },
  label: { fontFamily: "InterBold", fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 20, marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 13, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: "InterBold", fontSize: 12.5, color: colors.ink }, chipTextOn: { color: colors.white },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 9 },
  input: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bgSoft, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 11, fontFamily: "Inter", fontSize: 14, color: colors.ink },
  rm: { width: 34, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: radius.md },
  addRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 8 },
  addText: { fontFamily: "InterBold", fontSize: 13, color: colors.primary },
  method: { flexDirection: "row", alignItems: "center", gap: 11, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 13, marginBottom: 9, backgroundColor: colors.card },
  methodOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  methodText: { fontFamily: "InterBold", fontSize: 13.5, color: colors.ink },
  totalBox: { backgroundColor: colors.bgSoft, borderRadius: radius.lg, padding: 16, marginTop: 20 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  tK: { fontFamily: "Inter", fontSize: 13, color: colors.muted }, tV: { fontFamily: "InterBold", fontSize: 13, color: colors.ink },
  totalFinal: { borderTopWidth: 1, borderTopColor: colors.line, marginTop: 6, paddingTop: 10 },
  tTotal: { fontFamily: "JakartaBold", fontSize: 17, color: colors.ink },
});