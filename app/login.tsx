import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { supabase } from "../src/lib/supabase";
import { colors } from "../src/theme/tokens";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { Alert.alert("Login failed", error.message); return; }
    router.replace("/"); // root will route by role
  }

  return (
    <View style={s.wrap}>
      <Text style={s.h1}>Sign in</Text>
      <Text style={s.sub}>Access your portal.</Text>
      <View style={{ height: 20 }} />
      <Input label="EMAIL" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input label="PASSWORD" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
      <View style={{ height: 8 }} />
      <Button label={busy ? "Signing in…" : "Sign in"} onPress={signIn} />
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 90 },
  h1: { fontFamily: "JakartaBold", fontSize: 28, color: colors.ink },
  sub: { fontFamily: "Inter", fontSize: 14, color: colors.muted, marginTop: 6 },
});