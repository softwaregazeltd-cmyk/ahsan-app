import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Pill } from "../../src/components/Pill";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

function tone(status: string) {
  if (status === "Paid") return "ok";
  if (status === "Proof submitted") return "primary";
  return "amber";
}

export default function AdminInvoices() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("invoices").select("*, clients(company)").order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.header}>
        <Text style={s.title}>Invoices</Text>
        <Pressable onPress={() => router.push("/(admin)/invoice-new")} style={s.iconBtn}><Ionicons name="add" size={24} color={colors.ink} /></Pressable>
      </View>
      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={rows}
          keyExtractor={(x) => x.id}
          contentContainerStyle={{ padding: spacing.xl, paddingTop: 8 }}
          ListEmptyComponent={<Text style={s.empty}>No invoices yet. Tap + to create one.</Text>}
          renderItem={({ item }) => (
            <Pressable style={s.row} onPress={() => router.push({ pathname: "/(admin)/invoice-detail", params: { id: item.id } })}>
              <View style={s.iconBox}><Ionicons name="receipt-outline" size={20} color={colors.white} /></View>
              <View style={{ flex: 1 }}>
                <View style={s.rowTop}>
                  <Text style={s.num}>{item.number} · ${Number(item.amount).toLocaleString()}</Text>
                  <Pill label={item.status} tone={tone(item.status)} />
                </View>
                <Text style={s.meta}>{item.clients?.company ?? "—"}</Text>
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingTop: 64, paddingBottom: 12 },
  title: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink },
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  num: { fontFamily: "InterBold", fontSize: 14.5, color: colors.ink, flex: 1 },
  meta: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 3 },
  empty: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, textAlign: "center", marginTop: 40 },
});