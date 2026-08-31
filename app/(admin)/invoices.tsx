import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../src/theme/tokens";
export default function AdminInvoices() {
  return <View style={s.wrap}><Text style={s.h1}>Invoices</Text><Text style={s.sub}>Generate invoices & confirm payments — built in 5B-3.</Text></View>;
}
const s = StyleSheet.create({ wrap: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 64 }, h1: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink }, sub: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, marginTop: 8 } });