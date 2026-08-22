import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../src/theme/tokens";
export default function More() {
  return (
    <View style={s.wrap}><Text style={s.h1}>More</Text><Text style={s.body}>About, dark mode, contact, and settings go here.</Text></View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 64 },
  h1: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink, marginBottom: 8 },
  body: { fontFamily: "Inter", fontSize: 14, color: colors.muted },
});