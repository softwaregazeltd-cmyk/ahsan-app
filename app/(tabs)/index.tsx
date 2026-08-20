import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { Card } from "../../src/components/Card";
import { Input } from "../../src/components/Input";
import { Pill } from "../../src/components/Pill";
import { colors, spacing } from "../../src/theme/tokens";

export default function HomeScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.wrap}>
      <Text style={styles.h1}>RAHATUL</Text>
      <Pill label="Senior WordPress Developer" tone="lime" />

      <Text style={styles.section}>Buttons</Text>
      <Button label="Primary button" onPress={() => {}} />
      <View style={{ height: 10 }} />
      <Button label="Ghost button" variant="ghost" onPress={() => {}} />

      <Text style={styles.section}>Status pills</Text>
      <View style={styles.row}>
        <Pill label="In progress" tone="primary" />
        <Pill label="Paid" tone="ok" />
        <Pill label="On hold" tone="amber" />
        <Pill label="Cancelled" tone="red" />
      </View>

      <Text style={styles.section}>Card</Text>
      <Card>
        <Text style={styles.cardTitle}>Online ordering rebuild</Text>
        <Text style={styles.cardSub}>AYA Coffee · In progress</Text>
      </Card>

      <Text style={styles.section}>Input</Text>
      <Input label="EMAIL" placeholder="name@company.com" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingTop: 64, gap: 6 },
  h1: { fontFamily: "JakartaBold", fontSize: 30, color: colors.ink, letterSpacing: 1 },
  section: { fontFamily: "InterBold", fontSize: 12, color: colors.muted, marginTop: 24, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cardTitle: { fontFamily: "JakartaBold", fontSize: 16, color: colors.ink },
  cardSub: { fontFamily: "Inter", fontSize: 13, color: colors.muted, marginTop: 4 },
});