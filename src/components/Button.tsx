import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "../theme/tokens";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "ghost";
};

export function Button({ label, onPress, variant = "primary" }: Props) {
  const ghost = variant === "ghost";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        ghost ? styles.ghost : styles.primary,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.label, ghost ? styles.ghostLabel : styles.primaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: radius.md, alignItems: "center" },
  primary: { backgroundColor: colors.primary },
  ghost: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  label: { fontFamily: "InterBold", fontSize: 15 },
  primaryLabel: { color: colors.white },
  ghostLabel: { color: colors.ink },
});