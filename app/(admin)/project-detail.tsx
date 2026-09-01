import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Pill } from "../../src/components/Pill";
import { Sheet } from "../../src/components/Sheet";
import { supabase } from "../../src/lib/supabase";
import { pickAndUploadImage } from "../../src/lib/upload";
import { statusTone } from "../../src/statusTone";
import { colors, radius, spacing } from "../../src/theme/tokens";

const STATUSES = ["Planning", "In progress", "On Hold", "Completed", "Cancelled"];

export default function ProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [p, setP] = useState<any>(null);
  const [delivs, setDelivs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // reason sheet
  const [sheetStatus, setSheetStatus] = useState<string | null>(null);

  // deliverable inputs
  const [dName, setDName] = useState("");
  const [dLink, setDLink] = useState("");
  const [dImage, setDImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data: proj } = await supabase.from("projects").select("*, clients(contact, company)").eq("id", id).maybeSingle();
    const { data: dl } = await supabase.from("deliverables").select("*").eq("project_id", id).order("created_at", { ascending: false });
    setP(proj ?? null);
    setDelivs(dl ?? []);
    setLoading(false);
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function applyStatus(status: string, reason?: string) {
    const patch: any = { status, status_reason: reason ?? null };
    if (status === "Completed") patch.pct = 100;
    const { error } = await supabase.from("projects").update(patch).eq("id", id);
    if (error) { Alert.alert("Error", error.message); return; }
    load();
  }

  function onPickStatus(status: string) {
    if (status === "On Hold" || status === "Cancelled") {
      setSheetStatus(status);
    } else {
      applyStatus(status);
    }
  }

  // ---- milestones ----
  async function cycleMilestone(i: number) {
    if (!p) return;
    const miles = [...(p.milestones ?? [])];
    const cur = miles[i]?.s ?? "";
    miles[i] = { ...miles[i], s: cur === "" ? "active" : cur === "active" ? "done" : "" };
    const done = miles.filter((m: any) => m.s === "done").length;
    const pct = miles.length ? Math.round((done / miles.length) * 100) : p.pct;
    await supabase.from("projects").update({ milestones: miles, pct }).eq("id", id);
    load();
  }
  async function addMilestone() {
    if (!p) return;
    const miles = [...(p.milestones ?? []), { t: "New milestone", s: "" }];
    await supabase.from("projects").update({ milestones: miles }).eq("id", id);
    load();
  }
  function renameMilestone(i: number, text: string) {
    if (!p) return;
    const miles = [...(p.milestones ?? [])];
    miles[i] = { ...miles[i], t: text };
    setP({ ...p, milestones: miles });
  }
  async function saveMilestoneName() {
    if (!p) return;
    await supabase.from("projects").update({ milestones: p.milestones }).eq("id", id);
    load();
  }
  async function removeMilestone(i: number) {
    if (!p) return;
    const miles = (p.milestones ?? []).filter((_: any, idx: number) => idx !== i);
    await supabase.from("projects").update({ milestones: miles }).eq("id", id);
    load();
  }

  // ---- deliverables ----
  async function attachImage() {
    try {
      setUploading(true);
      const url = await pickAndUploadImage(`deliverables/${id}`);
      if (url) setDImage(url);
    } catch (e: any) {
      Alert.alert("Upload failed", e.message ?? String(e));
    } finally {
      setUploading(false);
    }
  }
  async function postDeliverable() {
    if (!dName.trim()) { Alert.alert("Name required", "Give the deliverable a name."); return; }
    const { error } = await supabase.from("deliverables").insert({
      project_id: id,
      name: dName.trim(),
      link: dLink.trim() || null,
      image: dImage,
    });
    if (error) { Alert.alert("Error", error.message); return; }
    setDName(""); setDLink(""); setDImage(null); load();
  }

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;
  if (!p) return <View style={s.center}><Text style={{ color: colors.muted }}>Project not found.</Text></View>;

  const miles = p.milestones ?? [];

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={s.backBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>

          {/* Header card */}
          <View style={s.card}>
            <View style={s.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{p.name}</Text>
                <Text style={s.client}>{p.clients?.company ?? "—"}</Text>
              </View>
              <Pill label={p.status} tone={statusTone(p.status)} />
            </View>
            {(p.eta || p.note) ? (
              <View style={s.metaBlock}>
                {p.eta ? <View style={s.kv}><Text style={s.k}>Est. completion</Text><Text style={s.v}>{p.eta}</Text></View> : null}
                {p.note ? <Text style={s.noteText}>{p.note}</Text> : null}
              </View>
            ) : null}
            {p.status_reason ? (
              <View style={[s.metaBlock, { borderTopColor: colors.line }]}>
                <Text style={[s.reasonLabel, { color: p.status === "Cancelled" ? colors.red : colors.amber }]}>{p.status.toUpperCase()} REASON</Text>
                <Text style={s.noteText}>{p.status_reason}</Text>
              </View>
            ) : null}
          </View>

          {/* Status */}
          <Text style={s.section}>Status</Text>
          <View style={s.chipsRow}>
            {STATUSES.map((st) => (
              <Pressable key={st} onPress={() => onPickStatus(st)} style={[s.chip, st === p.status && s.chipOn]}>
                <Text style={[s.chipText, st === p.status && s.chipTextOn]}>{st}</Text>
              </Pressable>
            ))}
          </View>

          {/* Milestones */}
          <Text style={s.section}>Milestones</Text>
          {miles.length === 0 ? <Text style={s.empty}>No milestones yet.</Text> :
            miles.map((m: any, i: number) => (
              <View key={i} style={s.mileRow}>
                <Pressable onPress={() => cycleMilestone(i)}>
                  <View style={[s.dot, m.s === "done" && s.dotDone, m.s === "active" && s.dotActive]}>
                    {m.s === "done" ? <Ionicons name="checkmark" size={13} color={colors.white} /> : null}
                  </View>
                </Pressable>
                <TextInput
                  value={m.t}
                  onChangeText={(v) => renameMilestone(i, v)}
                  onEndEditing={() => saveMilestoneName()}
                  style={s.mileNameInput}
                />
                <Text style={s.mileState}>{m.s === "done" ? "Done" : m.s === "active" ? "Active" : "Upcoming"}</Text>
                <Pressable onPress={() => removeMilestone(i)} style={s.mileRm}>
                  <Ionicons name="close" size={15} color={colors.muted} />
                </Pressable>
              </View>
            ))
          }
          <Pressable onPress={addMilestone} style={s.addRow}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <Text style={s.addText}>Add milestone</Text>
          </Pressable>

          {/* Post deliverable */}
          <Text style={s.section}>Post a deliverable</Text>
          <View style={s.deliverBox}>
            <TextInput placeholder="e.g. Homepage design v2" placeholderTextColor={colors.muted} value={dName} onChangeText={setDName} style={s.input} />
            <TextInput placeholder="Link (Figma, URL…) — optional" placeholderTextColor={colors.muted} value={dLink} onChangeText={setDLink} style={[s.input, { marginTop: 10 }]} autoCapitalize="none" />

            {dImage ? (
              <View style={s.previewRow}>
                <Image source={{ uri: dImage }} style={s.previewImg} />
                <Text style={s.previewText}>Image attached</Text>
                <Pressable onPress={() => setDImage(null)}><Ionicons name="close" size={18} color={colors.muted} /></Pressable>
              </View>
            ) : null}

            <Pressable style={s.attachBtn} onPress={attachImage} disabled={uploading}>
              <Ionicons name="image-outline" size={18} color={colors.primary} />
              <Text style={s.attachText}>{uploading ? "Uploading…" : "Attach image"}</Text>
            </Pressable>

            <Pressable style={s.postBtn} onPress={postDeliverable}><Text style={s.postText}>Post for client approval</Text></Pressable>
          </View>

          {/* Deliverable history */}
          <Text style={s.section}>Deliverable history</Text>
          {delivs.length === 0 ? <Text style={s.empty}>No deliverables yet.</Text> :
            delivs.map((d) => (
              <View key={d.id} style={s.delivRow}>
                {d.image ? (
                  <Image source={{ uri: d.image }} style={s.delivThumb} />
                ) : (
                  <View style={s.delivIcon}><Ionicons name="cube-outline" size={18} color={colors.primary} /></View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={s.delivName}>{d.name}</Text>
                  {d.link ? <Text style={s.delivLink} numberOfLines={1}>{d.link}</Text> : null}
                  {d.image && !d.link ? <Text style={s.delivLink}>Image attached</Text> : null}
                </View>
                <Pill label={d.status} tone={d.status === "Approved" ? "ok" : d.status === "Changes" ? "red" : "amber"} />
              </View>
            ))
          }
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Reason sheet for On Hold / Cancelled */}
      <Sheet
        visible={sheetStatus !== null}
        title={sheetStatus === "Cancelled" ? "Cancel project" : "Put project on hold"}
        note="Add a reason — it's saved to the project and shared with the client."
        withInput
        inputPlaceholder="Type the reason…"
        confirmLabel={sheetStatus === "Cancelled" ? "Cancel project" : "Put on hold"}
        danger={sheetStatus === "Cancelled"}
        onCancel={() => setSheetStatus(null)}
        onConfirm={(reason) => { const st = sheetStatus!; setSheetStatus(null); applyStatus(st, reason); }}
      />
    </>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { fontFamily: "JakartaBold", fontSize: 17, color: colors.ink },
  client: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 2 },
  metaBlock: { borderTopWidth: 1, borderTopColor: colors.line, marginTop: 12, paddingTop: 12 },
  kv: { flexDirection: "row", justifyContent: "space-between" },
  k: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted },
  v: { fontFamily: "InterBold", fontSize: 12.5, color: colors.ink },
  noteText: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 8, lineHeight: 18 },
  reasonLabel: { fontFamily: "InterBold", fontSize: 11, letterSpacing: 0.4 },
  section: { fontFamily: "JakartaBold", fontSize: 15, color: colors.ink, marginTop: 24, marginBottom: 12 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 13, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: "InterBold", fontSize: 12.5, color: colors.ink },
  chipTextOn: { color: colors.white },
  mileRow: { flexDirection: "row", alignItems: "center", gap: 11, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radius.md, padding: 13, marginBottom: 9 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  dotActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  dotDone: { borderColor: colors.ok, backgroundColor: colors.ok },
  mileNameInput: { flex: 1, fontFamily: "InterBold", fontSize: 13.5, color: colors.ink, paddingVertical: 2 },
  mileState: { fontFamily: "Inter", fontSize: 11, color: colors.muted },
  mileRm: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  addRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 8 },
  addText: { fontFamily: "InterBold", fontSize: 13, color: colors.primary },
  deliverBox: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14 },
  input: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bgSoft, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 11, fontFamily: "Inter", fontSize: 14, color: colors.ink },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10, backgroundColor: colors.bgSoft, borderRadius: radius.md, padding: 8 },
  previewImg: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.line },
  previewText: { flex: 1, fontFamily: "Inter", fontSize: 12.5, color: colors.muted },
  attachBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingVertical: 12, marginTop: 12 },
  attachText: { fontFamily: "InterBold", fontSize: 13.5, color: colors.primary },
  postBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 13, alignItems: "center", marginTop: 12 },
  postText: { fontFamily: "InterBold", fontSize: 14, color: colors.white },
  delivRow: { flexDirection: "row", alignItems: "center", gap: 11, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radius.md, padding: 12, marginBottom: 9 },
  delivIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  delivThumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: colors.line },
  delivName: { fontFamily: "InterBold", fontSize: 13.5, color: colors.ink },
  delivLink: { fontFamily: "Inter", fontSize: 11, color: colors.muted, marginTop: 2 },
  empty: { fontFamily: "Inter", fontSize: 13, color: colors.muted },
});