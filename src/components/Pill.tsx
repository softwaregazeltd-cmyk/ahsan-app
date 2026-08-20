import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme/tokens";

type Tone = "primary" | "lime" | "ok" | "amber" | "red";

const tones: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: colors.primarySoft, fg: colors.primary },
  lime: { bg: colors.lime, fg: colors.limeInk },
  ok: { bg: colors.okSoft, fg: colors.ok },
  amber: { bg: colors.amberSoft, fg: colors.amber },
  red: { bg: colors.redSoft, fg: colors.red },
};

export function Pill({ label, tone = "primary" }: { label: string; tone?: Tone }) {
  const t = tones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  text: { fontFamily: "InterBold", fontSize: 11 },
});