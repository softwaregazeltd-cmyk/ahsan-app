import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Card } from "../../src/components/Card";
import { colors } from "../../src/theme/tokens";

const SERVICES = ["WordPress Website Design", "Landing Page", "E-commerce", "SEO", "AI Automation"];

export default function Services() {
  const router = useRouter();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Text style={s.h1}>Services</Text>
      {SERVICES.map((name) => (
        <Pressable key={name} onPress={() => router.push({ pathname: "/(public)/service-detail", params: { name } })}>
          <Card style={{ marginBottom: 12 }}>
            <Text style={s.name}>{name}</Text>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  wrap: { padding: 24, paddingTop: 64 },
  h1: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink, marginBottom: 16 },
  name: { fontFamily: "InterBold", fontSize: 15, color: colors.ink },
});