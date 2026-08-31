import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { supabase } from "../../src/lib/supabase";
import { colors, spacing } from "../../src/theme/tokens";

export default function ClientNew() {
  const router = useRouter();
  const [f, setF] = useState({ contact: "", company: "", email: "", password: "", phone: "", address: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  async function create() {
    if (!f.contact || !f.email || !f.password || !f.phone) {
      Alert.alert("Missing info", "Name, email, password and phone are required.");
      return;
    }
    setBusy(true);
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    const { data, error } = await supabase.functions.invoke("create-client", {
      body: f,
      headers: { Authorization: `Bearer ${token}` },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      Alert.alert("Could not create client", (data as any)?.error ?? error?.message ?? "Unknown error");
      return;
    }
    Alert.alert("Client created", `${f.contact} can now log in with the email + password you set.`);
    router.back();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Pressable onPress={() => router.back()} style={s.backBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
      <Text style={s.h1}>New client</Text>
      <View style={{ height: 16 }} />
      <Input label="FULL NAME" placeholder="e.g. Sarah Lawson" value={f.contact} onChangeText={set("contact")} />
      <Input label="COMPANY" placeholder="e.g. Bright Brew" value={f.company} onChangeText={set("company")} />
      <Input label="EMAIL · their login" placeholder="name@company.com" autoCapitalize="none" keyboardType="email-address" value={f.email} onChangeText={set("email")} />
      <Input label="PASSWORD · shared with the client" placeholder="Set a password" value={f.password} onChangeText={set("password")} autoCapitalize="none" />
      <Input label="PHONE" placeholder="+1 416 555 0142" keyboardType="phone-pad" value={f.phone} onChangeText={set("phone")} />
      <Input label="ADDRESS" placeholder="Street, city, province" value={f.address} onChangeText={set("address")} multiline style={{ height: 70, textAlignVertical: "top" }} />
      <View style={s.note}><Text style={s.noteText}>🔑 The email & password become the client's login to their portal.</Text></View>
      <View style={{ height: 8 }} />
      <Button label={busy ? "Creating…" : "Create client"} onPress={create} />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  wrap: { padding: spacing.xl, paddingTop: 60, paddingBottom: 40 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  h1: { fontFamily: "JakartaBold", fontSize: 24, color: colors.ink },
  note: { backgroundColor: colors.bgSoft, borderRadius: 12, padding: 12, marginTop: 4 },
  noteText: { fontFamily: "Inter", fontSize: 12, color: colors.muted, lineHeight: 18 },
});