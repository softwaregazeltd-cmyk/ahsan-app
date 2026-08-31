import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../src/theme/tokens";

export default function AdminProjects() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.header}>
        <Text style={s.title}>Projects</Text>
        <Pressable onPress={() => router.push("/(admin)/project-new")} style={s.iconBtn}>
          <Ionicons name="add" size={24} color={colors.ink} />
        </Pressable>
      </View>
      <View style={s.body}>
        <Text style={s.sub}>Tap + to create a project. The full list & manager come in 5B-3b.</Text>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingTop: 64, paddingBottom: 12 },
  title: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink },
  iconBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  body: { padding: spacing.xl },
  sub: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted },
});