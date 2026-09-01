import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Pill } from "../../src/components/Pill";
import { Sheet } from "../../src/components/Sheet";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

function tone(status: string) {
  if (status === "Paid") return "ok" as const;
  if (status === "Proof submitted") return "primary" as const;
  return "amber" as const;
}
const eventTone: Record<string, any> = { amber: colors.amber, blue: colors.blue, ok: colors.ok, red: colors.red };
const eventBg: Record<string, any> = { amber: colors.amberSoft, blue: colors.blueSoft, ok: colors.okSoft, red: colors.redSoft };

export default function InvoiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [inv, setInv] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [declineOpen, setDeclineOpen] = useState(false);

  const load = useCallback(async () => {
    const { data: i } = await supabase.from("invoices").select("*, clients(company, contact)").eq("id", id).maybeSingle();
    const { data: e } = await supabase.from("invoice_events").select("*").eq("invoice_id", id).order("created_at", { ascending: true });
    setInv(i ?? null); setEvents(e ?? []); setLoading(false);
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function confirmPaid() {
    await supabase.from("invoices").update({ status: "Paid", proof: null, decline_reason: null }).eq("id", id);
    await supabase.from("invoice_events").insert({ invoice_id: id, text: "Payment confirmed", tone: "ok" });
    load();
  }
  async function declineProof(reason: string) {
    await supabase.from("invoices").update({ status: "Awaiting payment", proof: null, decline_reason: reason }).eq("id", id);
    await supabase.from("invoice_events").insert({ invoice_id: id, text: "Proof declined · " + reason, tone: "red" });
    await supabase.from("invoice_events").insert({ invoice_id: id, text: "Invoice reopened — awaiting new proof", tone: "amber" });
    load();
  }

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;
  if (!inv) return <View style={s.center}><Text style={{ color: colors.muted }}>Invoice not found.</Text></View>;

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
        <Pressable onPress={() => router.back()} style={s.backBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>

        <View style={s.card}>
          <View style={s.cardTop}>
            <View>
              <Text style={s.num}>{inv.number} · ${Number(inv.amount).toLocaleString()}</Text>
              <Text style={s.client}>{inv.clients?.company ?? "—"}</Text>
            </View>
            <Pill label={inv.status} tone={tone(inv.status)} />
          </View>
        </View>

        {/* Proof section — only when client submitted proof */}
        {inv.proof ? (
          <>
            <Text style={s.section}>Submitted proof</Text>
            <View style={s.proofCard}>
              {/* image comes in 5B-3d; for now show details */}
              <View style={s.proofImg}><Ionicons name="image-outline" size={26} color={colors.muted} /><Text style={s.proofImgText}>Receipt</Text></View>
              <View style={s.kv}><Text style={s.k}>Method</Text><Text style={s.v}>{inv.proof.method ?? "—"}</Text></View>
              <View style={s.kv}><Text style={s.k}>Reference</Text><Text style={s.v}>{inv.proof.ref ?? "—"}</Text></View>
              {inv.proof.note ? <View style={s.kv}><Text style={s.k}>Note</Text><Text style={s.v}>{inv.proof.note}</Text></View> : null}
            </View>
            <View style={s.actions}>
              <Pressable style={[s.actBtn, { backgroundColor: colors.ok }]} onPress={confirmPaid}><Text style={s.actText}>Confirm payment</Text></Pressable>
              <Pressable style={[s.actBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line }]} onPress={() => setDeclineOpen(true)}><Text style={[s.actText, { color: colors.red }]}>Decline proof</Text></Pressable>
            </View>
          </>
        ) : (
          <Text style={s.awaiting}>
            {inv.status === "Paid" ? "This invoice is paid." : "Waiting for the client to pay and submit proof."}
          </Text>
        )}

        {/* History */}
        <Text style={s.section}>Invoice history</Text>
        <View style={s.histCard}>
          {events.length === 0 ? <Text style={s.empty}>No history yet.</Text> :
            events.map((e) => (
              <View key={e.id} style={s.histRow}>
                <View style={[s.histIcon, { backgroundColor: eventBg[e.tone] ?? colors.bgSoft }]}>
                  <Ionicons name="ellipse" size={9} color={eventTone[e.tone] ?? colors.muted} />
                </View>
                <Text style={s.histText}>{e.text}</Text>
              </View>
            ))
          }
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      <Sheet
        visible={declineOpen}
        title="Decline payment proof"
        note="The invoice reopens for the client with your reason so they can re-upload."
        withInput inputPlaceholder="Type the reason…"
        confirmLabel="Decline proof" danger
        onCancel={() => setDeclineOpen(false)}
        onConfirm={(reason) => { setDeclineOpen(false); declineProof(reason); }}
      />
    </>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  num: { fontFamily: "JakartaBold", fontSize: 19, color: colors.ink }, client: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 3 },
  section: { fontFamily: "JakartaBold", fontSize: 15, color: colors.ink, marginTop: 24, marginBottom: 12 },
  proofCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14 },
  proofImg: { height: 130, borderRadius: 12, backgroundColor: colors.bgSoft, alignItems: "center", justifyContent: "center", marginBottom: 12, gap: 4 },
  proofImgText: { fontFamily: "InterBold", fontSize: 12, color: colors.muted },
  kv: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.line },
  k: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted }, v: { fontFamily: "InterBold", fontSize: 12.5, color: colors.ink, flexShrink: 1, textAlign: "right" },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  actBtn: { flex: 1, paddingVertical: 13, borderRadius: radius.md, alignItems: "center" },
  actText: { fontFamily: "InterBold", fontSize: 14, color: colors.white },
  awaiting: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, marginTop: 16, backgroundColor: colors.bgSoft, borderRadius: radius.md, padding: 14 },
  histCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, overflow: "hidden" },
  histRow: { flexDirection: "row", alignItems: "center", gap: 11, padding: 13, borderBottomWidth: 1, borderBottomColor: colors.line },
  histIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  histText: { flex: 1, fontFamily: "Inter", fontSize: 12.5, color: colors.ink },
  empty: { fontFamily: "Inter", fontSize: 13, color: colors.muted, padding: 14 },
});