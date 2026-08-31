import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "../../src/components/Avatar";
import { Button } from "../../src/components/Button";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

export default function ClientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [c, setC] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const { data: client } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
        const { data: projs } = await supabase.from("projects").select("*").eq("client_id", id).order("created_at", { ascending: false });
        setC(client ?? null);
        setProjects(projs ?? []);
        setLoading(false);
      })();
    }, [id])
  );

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  if (!c) {
    return (
      <View style={s.center}>
        <Text style={{ color: colors.muted, fontFamily: "Inter" }}>Client not found.</Text>
        <View style={{ height: 12 }} />
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  async function archive() {
    await supabase.from("clients").update({ archived: true }).eq("id", id);
    Alert.alert("Archived", `${c.contact} was archived (data kept).`);
    router.back();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Pressable onPress={() => router.back()} style={s.backBtn}>
        <Ionicons name="chevron-back" size={22} color={colors.ink} />
      </Pressable>

      <View style={s.head}>
        <Avatar name={c.contact ?? "?"} size={54} />
        <View>
          <Text style={s.name}>{c.contact}</Text>
          <Text style={s.company}>{c.company}</Text>
        </View>
      </View>

      <View style={s.card}>
        <Row k="Email" v={c.email ?? "—"} />
        <Row k="Phone" v={c.phone ?? "—"} />
        <Row k="Address" v={c.address ?? "—"} />
        <Row k="Login" v="Active (portal access)" last />
      </View>

      <Text style={s.section}>Projects ({projects.length})</Text>
      {projects.length === 0 ? (
        <Text style={s.empty}>No projects yet.</Text>
      ) : (
        projects.map((p) => (
          <View key={p.id} style={s.projRow}>
            <Text style={s.projName}>{p.name}</Text>
            <Text style={s.projStatus}>{p.status}</Text>
          </View>
        ))
      )}

      <View style={{ height: 24 }} />
      <Button label="Archive client" variant="ghost" onPress={archive} />
    </ScrollView>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <View style={[rs.row, last && { borderBottomWidth: 0 }]}>
      <Text style={rs.k}>{k}</Text>
      <Text style={rs.v}>{v}</Text>
    </View>
  );
}

const rs = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 12 },
  k: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted },
  v: { fontFamily: "InterBold", fontSize: 13.5, color: colors.ink, flexShrink: 1, textAlign: "right" },
});

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  head: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  name: { fontFamily: "JakartaBold", fontSize: 20, color: colors.ink },
  company: { fontFamily: "Inter", fontSize: 13, color: colors.muted, marginTop: 2 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16 },
  section: { fontFamily: "InterBold", fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 24, marginBottom: 10 },
  empty: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted },
  projRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 14, marginBottom: 10 },
  projName: { fontFamily: "InterBold", fontSize: 14, color: colors.ink },
  projStatus: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted },
});