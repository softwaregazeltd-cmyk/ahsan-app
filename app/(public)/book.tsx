import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { colors, radius, spacing } from "../../src/theme/tokens";

const CALENDLY = "https://calendly.com/rahatul/30min"; // admin will set this later

export default function Book() {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Pressable onPress={() => router.back()} style={s.backBtn}>
        <Ionicons name="chevron-back" size={22} color={colors.ink} />
      </Pressable>

      <Text style={s.h1}>Book a free call</Text>
      <Text style={s.sub}>A quick 30-minute intro call to talk through your project — no pressure.</Text>

      <View style={s.card}>
        <View style={s.rowItem}><Ionicons name="time-outline" size={18} color={colors.primary} /><Text style={s.rowText}>30 minutes</Text></View>
        <View style={s.rowItem}><Ionicons name="videocam-outline" size={18} color={colors.primary} /><Text style={s.rowText}>Video call</Text></View>
        <View style={s.rowItem}><Ionicons name="globe-outline" size={18} color={colors.primary} /><Text style={s.rowText}>Time zone handled by Calendly</Text></View>
      </View>

      <View style={{ height: 20 }} />
      <Button label="Choose a time" onPress={() => Linking.openURL(CALENDLY)} />
      <Text style={s.note}>Opens Calendly to pick a slot. (In-app embedded calendar comes with the admin's scheduling setup.)</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink },
  sub: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, marginTop: 6, lineHeight: 20 },
  card: { backgroundColor: colors.bgSoft, borderRadius: radius.lg, padding: 18, marginTop: 20, gap: 12 },
  rowItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowText: { fontFamily: "InterBold", fontSize: 14, color: colors.ink },
  note: { fontFamily: "Inter", fontSize: 11.5, color: colors.muted, marginTop: 12, lineHeight: 17 },
});