import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>RAHATUL</Text>
      <Text style={styles.tag}>Senior WordPress Developer</Text>
      <Text style={styles.ok}>App is running ✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  brand: { fontSize: 34, fontWeight: "800", letterSpacing: 1, color: "#1a1512" },
  tag: {
    marginTop: 10,
    backgroundColor: "#C7F24E",
    color: "#31410A",
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
    fontSize: 13,
  },
  ok: { marginTop: 22, color: "#F2751A", fontWeight: "700" },
});