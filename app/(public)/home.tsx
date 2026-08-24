
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme/tokens";

export default function Home() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("clients").select("*").then(({ data, error }) => {
      if (error) setErr(error.message);
      else setRows(data ?? []);
    });
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Text style={s.h1}>Supabase test</Text>
      {err ? <Text style={{ color: "red" }}>{err}</Text> : null}
      {rows.map((r) => (
        <Text key={r.id} style={s.row}>{r.contact} — {r.company}</Text>
      ))}
      {rows.length === 0 && !err ? <Text style={s.row}>No rows yet (or RLS blocking).</Text> : null}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  wrap: { padding: 24, paddingTop: 64 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink, marginBottom: 16 },
  row: { fontFamily: "Inter", fontSize: 15, color: colors.ink, marginBottom: 8 },
});