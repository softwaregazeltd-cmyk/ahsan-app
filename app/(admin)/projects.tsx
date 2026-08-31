import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "../../src/components/Avatar";
import { Pill } from "../../src/components/Pill";
import { supabase } from "../../src/lib/supabase";
import { statusTone } from "../../src/statusTone";
import { colors, radius, spacing } from "../../src/theme/tokens";

const FILTERS = ["All", "Planning", "In progress", "On Hold", "Completed", "Cancelled"];

export default function AdminProjects() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("projects")
      .select("*, clients(contact, company)")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = rows.filter((p) => {
    const s = q.toLowerCase();
    const company = p.clients?.company ?? "";
    const matchQ = !s || (p.name ?? "").toLowerCase().includes(s) || company.toLowerCase().includes(s);
    const matchF = filter === "All" || p.status === filter;
    return matchQ && matchF;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.header}>
        <Text style={s.title}>Projects</Text>
        <Pressable onPress={() => router.push("/(admin)/project-new")} style={s.iconBtn}>
          <Ionicons name="add" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <View style={s.searchWrap}>
        <View style={s.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput placeholder="Search by project or company…" placeholderTextColor={colors.muted} value={q} onChangeText={setQ} style={s.searchInput} />
        </View>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {FILTERS.map((f) => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[s.filterChip, f === filter && s.filterChipOn]}>
              <Text style={[s.filterText, f === filter && s.filterTextOn]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: spacing.xl, paddingTop: 8 }}
          ListEmptyComponent={<Text style={s.empty}>No {filter === "All" ? "" : filter.toLowerCase() + " "}projects{q ? ` match "${q}"` : ""}.</Text>}
          renderItem={({ item }) => (
            <Pressable style={s.row} onPress={() => router.push({ pathname: "/(admin)/project-detail", params: { id: item.id } })}>
              <Avatar name={item.clients?.company ?? item.clients?.contact ?? "?"} size={44} />
              <View style={{ flex: 1 }}>
                <View style={s.rowTop}>
                  <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                  <Pill label={item.status} tone={statusTone(item.status)} />
                </View>
                <Text style={s.meta}>{item.clients?.company ?? "—"}</Text>
                <View style={s.bar}><View style={[s.barFill, { width: `${item.pct ?? 0}%` }]} /></View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingTop: 64, paddingBottom: 12 },
  title: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink },
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  searchWrap: { paddingHorizontal: spacing.xl, paddingBottom: 10 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.bgSoft, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11 },
  searchInput: { flex: 1, fontFamily: "Inter", fontSize: 14, color: colors.ink },
  filterRow: { paddingHorizontal: spacing.xl, gap: 8, paddingBottom: 10 },
  filterChip: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 13, paddingVertical: 7 },
  filterChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontFamily: "InterBold", fontSize: 12.5, color: colors.ink },
  filterTextOn: { color: colors.white },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { fontFamily: "InterBold", fontSize: 14.5, color: colors.ink, flex: 1 },
  meta: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 3 },
  bar: { height: 6, backgroundColor: colors.bgSoft, borderRadius: 3, marginTop: 10, overflow: "hidden" },
  barFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  empty: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, textAlign: "center", marginTop: 40 },
});