import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../src/auth";
import { Button } from "../../src/components/Button";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme/tokens";

export default function Client() {
  const router = useRouter();
  const { session, role } = useAuth();

  if (!session) {
    return (
      <View style={s.wrap}>
        <Text style={s.h1}>Client area</Text>
        <Text style={s.body}>Locked. Log in to access your projects and invoices.</Text>
        <View style={{ height: 16 }} />
        <Button label="Log in" onPress={() => router.push("/login")} />
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <Text style={s.h1}>Welcome back</Text>
      <Text style={s.body}>Signed in as: {session.user.email}</Text>
      <Text style={s.body}>Role: {role}</Text>
      <View style={{ height: 16 }} />
      <Button label="Log out" variant="ghost" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 64 },
  h1: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink, marginBottom: 8 },
  body: { fontFamily: "Inter", fontSize: 15, color: colors.muted, marginBottom: 4 },
});