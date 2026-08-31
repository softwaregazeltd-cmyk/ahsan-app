import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../src/theme/tokens";
export default function AdminProjects() {
  return <View style={s.wrap}><Text style={s.h1}>Projects</Text><Text style={s.sub}>Create & manage projects — built in 5B-3.</Text></View>;
}
const s = StyleSheet.create({ wrap: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 64 }, h1: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink }, sub: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, marginTop: 8 } });