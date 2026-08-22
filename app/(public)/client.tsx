import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { colors } from "../../src/theme/tokens";
export default function Client() {
  return (
    <View style={s.wrap}>
      <Text style={s.h1}>Client area</Text>
      <Text style={s.body}>Locked. Log in to access your projects and invoices.</Text>
      <View style={{ height: 16 }} />
      <Button label="Log in" onPress={() => {}} />
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 64 },
  h1: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink, marginBottom: 8 },
  body: { fontFamily: "Inter", fontSize: 14, color: colors.muted },
});