import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "../../src/components/Avatar";
import { Pill } from "../../src/components/Pill";
import { Sheet } from "../../src/components/Sheet";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

export default function AdminChats() {
  const router = useRouter();
  const [tab, setTab] = useState<"req" | "active">("req");
  const [requests, setRequests] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [declineFor, setDeclineFor] = useState<any | null>(null);

  const load = useCallback(async () => {
    const [r, c] = await Promise.all([
      supabase.from("chat_requests").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("chats").select("*").order("updated_at", { ascending: false }),
    ]);
    setRequests(r.data ?? []);
    setChats(c.data ?? []);
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function approve(r: any) {
    // 1. create chat
    const { data: chat, error } = await supabase.from("chats").insert({
      title: r.name,
      company: r.email,
      is_prospect: true,
      prospect_email: r.email,
      last_message: r.message ?? "New chat",
    }).select().single();
    if (error || !chat) { return; }
    // 2. seed messages
    await supabase.from("messages").insert([
      { chat_id: chat.id, sender: "event", type: "event", body: "Chat request approved" },
      ...(r.message ? [{ chat_id: chat.id, sender: "client", type: "text", body: r.message }] : []),
      { chat_id: chat.id, sender: "admin", type: "text", body: `Hi ${r.name.split(" ")[0]} 👋 thanks for reaching out — happy to help. Let's talk through your project.` },
    ]);
    // 3. mark request approved
    await supabase.from("chat_requests").update({ status: "approved" }).eq("id", r.id);
    load();
    setTab("active");
    router.push({ pathname: "/(admin)/chat-thread", params: { id: chat.id } });
  }

  async function decline(r: any, reason: string) {
    await supabase.from("chat_requests").update({ status: "declined", decline_reason: reason }).eq("id", r.id);
    load();
  }

  const activeFiltered = chats.filter((c) => {
    const s = q.toLowerCase();
    return !s || (c.title ?? "").toLowerCase().includes(s) || (c.company ?? "").toLowerCase().includes(s);
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Text style={s.title}>Chats</Text>

      {/* Segmented control */}
      <View style={s.seg}>
        <Pressable onPress={() => setTab("req")} style={[s.segBtn, tab === "req" && s.segBtnOn]}>
          <Text style={[s.segText, tab === "req" && s.segTextOn]}>Requests</Text>
          {requests.length > 0 ? <View style={s.badge}><Text style={s.badgeText}>{requests.length}</Text></View> : null}
        </Pressable>
        <Pressable onPress={() => setTab("active")} style={[s.segBtn, tab === "active" && s.segBtnOn]}>
          <Text style={[s.segText, tab === "active" && s.segTextOn]}>Active</Text>
        </Pressable>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : tab === "req" ? (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: spacing.xl, paddingTop: 8 }}
          ListEmptyComponent={<Text style={s.empty}>No pending requests.</Text>}
          renderItem={({ item }) => (
            <View style={s.reqCard}>
              <View style={s.reqTop}>
                <Avatar name={item.name} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={s.reqName}>{item.name}</Text>
                  <Text style={s.reqMeta}>{item.email}</Text>
                </View>
                <Pill label="NEW" tone="primary" />
              </View>
              {item.message ? <Text style={s.reqMsg}>"{item.message}"</Text> : null}
              <View style={s.reqActions}>
                <Pressable style={[s.actBtn, { backgroundColor: colors.ok }]} onPress={() => approve(item)}>
                  <Text style={s.actText}>Approve & open</Text>
                </Pressable>
                <Pressable style={[s.actBtn, s.actGhost]} onPress={() => setDeclineFor(item)}>
                  <Text style={[s.actText, { color: colors.ink }]}>Decline</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      ) : (
        <>
          <View style={s.searchWrap}>
            <View style={s.search}>
              <Ionicons name="search" size={18} color={colors.muted} />
              <TextInput placeholder="Search by client or project…" placeholderTextColor={colors.muted} value={q} onChangeText={setQ} style={s.searchInput} />
            </View>
          </View>
          <FlatList
            data={activeFiltered}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ padding: spacing.xl, paddingTop: 4 }}
            ListEmptyComponent={<Text style={s.empty}>No active chats yet. Approve a request to start one.</Text>}
            renderItem={({ item }) => (
              <Pressable style={s.chatRow} onPress={() => router.push({ pathname: "/(admin)/chat-thread", params: { id: item.id } })}>
                <Avatar name={item.title ?? "?"} size={44} />
                <View style={{ flex: 1 }}>
                  <View style={s.chatTop}>
                    <Text style={s.chatName} numberOfLines={1}>{item.title}</Text>
                    {item.is_prospect ? <Pill label="PROSPECT" tone="amber" /> : null}
                  </View>
                  <Text style={s.chatLast} numberOfLines={1}>{item.last_message ?? ""}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            )}
          />
        </>
      )}

      <Sheet
        visible={declineFor !== null}
        title="Decline chat request"
        note="This reason is sent to the person as a notification — the chat won't open, so it's how they'll know why."
        withInput inputPlaceholder="Type the reason…"
        confirmLabel="Decline & notify" danger
        onCancel={() => setDeclineFor(null)}
        onConfirm={(reason) => { const r = declineFor; setDeclineFor(null); if (r) decline(r, reason); }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink, paddingHorizontal: spacing.xl, paddingTop: 64 },
  seg: { flexDirection: "row", backgroundColor: colors.bgSoft, borderRadius: radius.md, padding: 4, margin: spacing.xl, marginBottom: 8, gap: 4 },
  segBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: radius.sm },
  segBtnOn: { backgroundColor: colors.card },
  segText: { fontFamily: "InterBold", fontSize: 13, color: colors.muted },
  segTextOn: { color: colors.ink },
  badge: { backgroundColor: colors.red, borderRadius: 20, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  badgeText: { fontFamily: "InterBold", fontSize: 10, color: colors.white },

  reqCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16, marginBottom: 12 },
  reqTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  reqName: { fontFamily: "InterBold", fontSize: 14, color: colors.ink },
  reqMeta: { fontFamily: "Inter", fontSize: 12, color: colors.muted, marginTop: 2 },
  reqMsg: { fontFamily: "Inter", fontSize: 13.5, color: colors.ink, marginTop: 12, lineHeight: 20, backgroundColor: colors.bgSoft, borderRadius: radius.md, padding: 12 },
  reqActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  actBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.md, alignItems: "center" },
  actGhost: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  actText: { fontFamily: "InterBold", fontSize: 13.5, color: colors.white },

  searchWrap: { paddingHorizontal: spacing.xl, paddingBottom: 8 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.bgSoft, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11 },
  searchInput: { flex: 1, fontFamily: "Inter", fontSize: 14, color: colors.ink },
  chatRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  chatTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  chatName: { fontFamily: "InterBold", fontSize: 14.5, color: colors.ink, flex: 1 },
  chatLast: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 3 },
  empty: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, textAlign: "center", marginTop: 40 },
});