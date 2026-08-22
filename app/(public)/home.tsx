import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { Card } from "../../src/components/Card";
import { Pill } from "../../src/components/Pill";
import { colors } from "../../src/theme/tokens";

export default function Home() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Text style={s.h1}>RAHATUL</Text>
      <Pill label="Senior WordPress Developer" tone="lime" />
      <View style={{ height: 20 }} />
      <Card>
        <Text style={s.cardTitle}>Turn your visitors into paying clients</Text>
        <View style={{ height: 12 }} />
        <Button label="Book a free call" onPress={() => {}} />
      </Card>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  wrap: { padding: 24, paddingTop: 64 },
  h1: { fontFamily: "JakartaBold", fontSize: 30, color: colors.ink, letterSpacing: 1, marginBottom: 10 },
  cardTitle: { fontFamily: "JakartaBold", fontSize: 18, color: colors.ink },
});