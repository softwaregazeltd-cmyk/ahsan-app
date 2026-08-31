import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "../../src/components/Avatar";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

export default function Clients() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("clients").select("*").eq("archived", false).order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = rows.filter((c) => {
    const s = q.toLowerCase();
    return !s || (c.contact ?? "").toLowerCase().includes(s) || (c.company ?? "").toLowerCase().includes(s);
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.iconBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
        <Text style={s.title}>Clients</Text>
        <Pressable onPress={() => router.push("/(admin)/client-new")} style={s.iconBtn}><Ionicons name="add" size={24} color={colors.ink} /></Pressable>
      </View>

      <View style={s.searchWrap}>
        <View style={s.search}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput placeholder="Search by client or company…" placeholderTextColor={colors.muted} value={q} onChangeText={setQ} style={s.searchInput} />
        </View>
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: spacing.xl, paddingTop: 4 }}
          ListEmptyComponent={<Text style={s.empty}>No clients yet. Tap + to add one.</Text>}
          renderItem={({ item, index }) => (
            <Pressable style={s.row} onPress={() => router.push({ pathname: "/(admin)/client-detail", params: { id: item.id } })}>
              <Avatar name={item.contact} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.contact}</Text>
                <Text style={s.meta}>{item.company}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  iconBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "JakartaBold", fontSize: 18, color: colors.ink },
  searchWrap: { padding: spacing.xl, paddingBottom: 8 },
  search: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.bgSoft, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 11 },
  searchInput: { flex: 1, fontFamily: "Inter", fontSize: 14, color: colors.ink },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  name: { fontFamily: "InterBold", fontSize: 15, color: colors.ink },
  meta: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 3 },
  empty: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, textAlign: "center", marginTop: 40 },
});