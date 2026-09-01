import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../../src/components/Button";
import { DateField } from "../../src/components/DateField";
import { Input } from "../../src/components/Input";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

const TYPES = ["WordPress Website Design", "Landing Page", "WordPress E-commerce", "WordPress Bug Fixing", "WordPress SEO", "WordPress AI Automation"];
const STAGES = ["Discovery", "Planning", "Design", "Build"];

export default function ProjectNew() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [stage, setStage] = useState("Discovery");
  const [eta, setEta] = useState("");         // yyyy-mm-dd
  const [note, setNote] = useState("");
  const [miles, setMiles] = useState<string[]>(["Discovery", "Design", "Build", "Launch"]);
  const [busy, setBusy] = useState(false);

  useFocusEffect(useCallback(() => {
    supabase.from("clients").select("id,contact,company").eq("archived", false).order("contact")
      .then(({ data }) => {
        setClients(data ?? []);
        if (!clientId && data && data.length) setClientId(data[0].id);
      });
  }, [clientId]));

  function setMile(i: number, v: string) { setMiles((m) => m.map((x, idx) => (idx === i ? v : x))); }
  function addMile() { setMiles((m) => [...m, "New milestone"]); }
  function rmMile(i: number) { setMiles((m) => m.filter((_, idx) => idx !== i)); }

  async function create() {
    if (!clientId) { Alert.alert("Pick a client", "Create a client first, then a project."); return; }
    if (!name.trim()) { Alert.alert("Name required", "Give the project a name."); return; }
    setBusy(true);
    const inProg = stage === "Design" || stage === "Build";
    const pct = stage === "Build" ? 55 : stage === "Design" ? 30 : 8;
    const { error } = await supabase.from("projects").insert({
      client_id: clientId,
      name: name.trim(),
      type,
      status: inProg ? "In progress" : "Planning",
      pct,
      eta: eta.trim() || null,
      note: note.trim() || null,
      milestones: miles.map((m) => ({ t: m, s: "" })),
    });
    setBusy(false);
    if (error) { Alert.alert("Could not create project", error.message); return; }
    Alert.alert("Project created", `${name} was added.`);
    router.back();
  }

  const selected = clients.find((c) => c.id === clientId);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={s.wrap}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Pressable onPress={() => router.back()} style={s.backBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
        <Text style={s.h1}>New project</Text>

        {/* Client picker */}
        <Text style={s.label}>CLIENT</Text>
        {clients.length === 0 ? (
          <Text style={s.help}>No clients yet. Create one in Clients first.</Text>
        ) : (
          <View style={s.clientList}>
            {clients.map((c) => (
              <Pressable key={c.id} onPress={() => setClientId(c.id)} style={[s.clientChip, c.id === clientId && s.clientChipOn]}>
                <Text style={[s.clientChipText, c.id === clientId && s.clientChipTextOn]}>{c.contact} — {c.company}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 16 }} />
        <Input label="PROJECT NAME" placeholder="e.g. Online ordering rebuild" value={name} onChangeText={setName} />

        {/* Type */}
        <Text style={s.label}>SERVICE TYPE</Text>
        <View style={s.wrapChips}>
          {TYPES.map((t) => (
            <Pressable key={t} onPress={() => setType(t)} style={[s.chip, t === type && s.chipOn]}>
              <Text style={[s.chipText, t === type && s.chipTextOn]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {/* Stage */}
        <Text style={s.label}>STARTING STAGE</Text>
        <View style={s.wrapChips}>
          {STAGES.map((st) => (
            <Pressable key={st} onPress={() => setStage(st)} style={[s.chip, st === stage && s.chipOn]}>
              <Text style={[s.chipText, st === stage && s.chipTextOn]}>{st}</Text>
            </Pressable>
          ))}
        </View>

        {/* Milestones */}
        <Text style={s.label}>MILESTONES</Text>
        {miles.map((m, i) => (
          <View key={i} style={s.mileRow}>
            <View style={s.mileIdx}><Text style={s.mileIdxText}>{i + 1}</Text></View>
            <TextInput value={m} onChangeText={(v) => setMile(i, v)} style={s.mileInput} placeholderTextColor={colors.muted} />
            <Pressable onPress={() => rmMile(i)} style={s.mileRm}><Ionicons name="close" size={16} color={colors.muted} /></Pressable>
          </View>
        ))}
        <Pressable onPress={addMile} style={s.addRow}><Ionicons name="add" size={18} color={colors.primary} /><Text style={s.addText}>Add milestone</Text></Pressable>

        <View style={{ height: 12 }} />
        <DateField label="ESTIMATED COMPLETION" value={eta} onChange={setEta} placeholder="Pick a completion date" />
        <Input label="NOTES / INSTRUCTIONS · visible to client" placeholder="Priorities, what you need from them…" value={note} onChangeText={setNote} multiline style={{ height: 80, textAlignVertical: "top" }} />

        <View style={s.note}><Text style={s.noteText}>💬 A project chat opens for the client automatically in a later step. {selected ? `Client: ${selected.contact}` : ""}</Text></View>
        <View style={{ height: 8 }} />
        <Button label={busy ? "Creating…" : "Create project"} onPress={create} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 240 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink, marginBottom: 16 },
  label: { fontFamily: "InterBold", fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 18, marginBottom: 10 },
  help: { fontFamily: "Inter", fontSize: 13, color: colors.muted },
  clientList: { gap: 8 },
  clientChip: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12 },
  clientChipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  clientChipText: { fontFamily: "InterBold", fontSize: 13.5, color: colors.ink },
  clientChipTextOn: { color: colors.primary },
  wrapChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 13, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: "InterBold", fontSize: 12.5, color: colors.ink },
  chipTextOn: { color: colors.white },
  mileRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 9 },
  mileIdx: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  mileIdxText: { fontFamily: "InterBold", fontSize: 11, color: colors.primary },
  mileInput: { flex: 1, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bgSoft, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 11, fontFamily: "Inter", fontSize: 14, color: colors.ink },
  mileRm: { width: 34, height: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line, borderRadius: radius.md },
  addRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 8 },
  addText: { fontFamily: "InterBold", fontSize: 13, color: colors.primary },
  note: { backgroundColor: colors.bgSoft, borderRadius: 12, padding: 12, marginTop: 8 },
  noteText: { fontFamily: "Inter", fontSize: 12, color: colors.muted, lineHeight: 18 },
});