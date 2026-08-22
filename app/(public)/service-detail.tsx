import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../src/theme/tokens";

export default function ServiceDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  return (
    <View style={s.wrap}>
      <Pressable onPress={() => router.back()}><Text style={s.back}>‹ Back</Text></Pressable>
      <Text style={s.h1}>{name}</Text>
      <Text style={s.body}>Packages and details for this service go here.</Text>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 64 },
  back: { fontFamily: "InterBold", color: colors.primary, fontSize: 15, marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink, marginBottom: 8 },
  body: { fontFamily: "Inter", fontSize: 14, color: colors.muted },
});