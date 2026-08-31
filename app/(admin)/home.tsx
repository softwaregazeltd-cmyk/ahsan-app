import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "../../src/components/Avatar";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

export default function AdminHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ projects: 0, requests: 0, clients: 0 });
  const [requests, setRequests] = useState<any[]>([]);

  const load = useCallback(async () => {
    const [p, c, r] = await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase.from("clients").select("id", { count: "exact", head: true }).eq("archived", false),
      supabase.from("chat_requests").select("*").eq("status", "pending").order("created_at", { ascending: false }),
    ]);
    setStats({ projects: p.count ?? 0, clients: c.count ?? 0, requests: r.data?.length ?? 0 });
    setRequests(r.data ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const cards = [
    { n: stats.projects, label: "Active projects", icon: "folder-outline", tint: colors.primary, bg: colors.primarySoft, go: "/(admin)/projects" },
    { n: stats.requests, label: "Chat requests", icon: "chatbubble-outline", tint: colors.primary, bg: colors.primarySoft, go: "/(admin)/chats" },
    { n: stats.clients, label: "Clients", icon: "people-outline", tint: colors.ok, bg: colors.okSoft, go: "/(admin)/menu" },
    { n: "—", label: "Revenue · this month", icon: "cash-outline", tint: colors.ok, bg: colors.okSoft, go: "/(admin)/invoices" },
  ] as const;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      {/* Top bar */}
      <View style={s.topbar}>
        <Avatar name="Rahatul Ahsan" size={44} />
        <View style={{ flex: 1 }}>
          <View style={s.welcomeRow}>
            <Text style={s.welcome}>Welcome back</Text>
            <View style={s.badge}><Text style={s.badgeText}>ADMIN</Text></View>
          </View>
          <Text style={s.name}>Rahatul</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Stat cards */}
          <View style={s.grid}>
            {cards.map((c) => (
              <Pressable key={c.label} style={s.stat} onPress={() => router.push(c.go as any)}>
                <View style={[s.statIcon, { backgroundColor: c.bg }]}>
                  <Ionicons name={c.icon as any} size={20} color={c.tint} />
                </View>
                <Text style={s.statN}>{c.n}</Text>
                <Text style={s.statLabel}>{c.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Action needed */}
          <View style={s.sectionRow}>
            <Text style={s.section}>Action needed</Text>
            {requests.length > 0 ? <View style={s.count}><Text style={s.countText}>{requests.length}</Text></View> : null}
          </View>

          {requests.length === 0 ? (
            <Text style={s.empty}>No pending chat requests right now.</Text>
          ) : (
            requests.map((r) => (
              <View key={r.id} style={s.reqCard}>
                <View style={s.reqTop}>
                  <Avatar name={r.name} size={38} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.reqName}>{r.name}</Text>
                    <Text style={s.reqMeta}>{r.email}</Text>
                  </View>
                  <View style={s.newTag}><Text style={s.newTagText}>NEW CHAT</Text></View>
                </View>
                {r.message ? <Text style={s.reqMsg}>"{r.message}"</Text> : null}
                <Pressable style={s.reviewBtn} onPress={() => router.push("/(admin)/chats")}>
                  <Text style={s.reviewText}>Review in Chats</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </Pressable>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingTop: 64, paddingBottom: 40 },
  topbar: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 22 },
  welcomeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  welcome: { fontFamily: "Inter", fontSize: 13, color: colors.muted },
  badge: { backgroundColor: colors.ink, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontFamily: "InterBold", fontSize: 9, color: colors.white, letterSpacing: 0.5 },
  name: { fontFamily: "JakartaBold", fontSize: 20, color: colors.ink, marginTop: 2 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  stat: { width: "47%", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16 },
  statIcon: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  statN: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink },
  statLabel: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 2 },

  sectionRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 28, marginBottom: 12 },
  section: { fontFamily: "JakartaBold", fontSize: 18, color: colors.ink },
  count: { backgroundColor: colors.red, borderRadius: 20, minWidth: 22, height: 22, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  countText: { fontFamily: "InterBold", fontSize: 11, color: colors.white },
  empty: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted },

  reqCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16, marginBottom: 12 },
  reqTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  reqName: { fontFamily: "InterBold", fontSize: 14, color: colors.ink },
  reqMeta: { fontFamily: "Inter", fontSize: 12, color: colors.muted, marginTop: 2 },
  newTag: { backgroundColor: colors.primarySoft, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  newTagText: { fontFamily: "InterBold", fontSize: 9, color: colors.primary },
  reqMsg: { fontFamily: "Inter", fontSize: 13.5, color: colors.ink, marginTop: 12, lineHeight: 20, backgroundColor: colors.bgSoft, borderRadius: radius.md, padding: 12 },
  reviewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 12 },
  reviewText: { fontFamily: "InterBold", fontSize: 13, color: colors.primary },
});