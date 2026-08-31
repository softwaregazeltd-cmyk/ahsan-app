import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/tokens";

type Props = { name?: string; uri?: string; size?: number };

export function Avatar({ name = "", uri, size = 44 }: Props) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const style = { width: size, height: size, borderRadius: size / 3 };
  if (uri) return <Image source={{ uri }} style={[style, { backgroundColor: colors.bgSoft }]} />;
  return (
    <View style={[style, s.fallback]}>
      <Text style={[s.initials, { fontSize: size * 0.36 }]}>{initials || "R"}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  fallback: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  initials: { color: colors.white, fontFamily: "JakartaBold" },
});