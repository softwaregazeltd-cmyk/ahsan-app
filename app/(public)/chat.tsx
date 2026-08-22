import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../src/theme/tokens";
export default function Chat() {
  return (
    <View style={s.wrap}><Text style={s.h1}>Chat</Text><Text style={s.body}>Request-to-chat flow goes here.</Text></View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 64 },
  h1: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink, marginBottom: 8 },
  body: { fontFamily: "Inter", fontSize: 14, color: colors.muted },
});