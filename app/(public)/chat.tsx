import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { Pill } from "../../src/components/Pill";
import { supabase } from "../../src/lib/supabase";
import { colors, radius, spacing } from "../../src/theme/tokens";

export default function Chat() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    if (!name.trim() || !email.trim()) { setErr("Please add your name and email."); return; }
    setBusy(true);
    const { error } = await supabase.from("chat_requests").insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      service: "General enquiry",
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <View style={s.center}>
        <View style={s.waitIcon}><ActivityIndicator color={colors.primary} /></View>
        <Text style={s.waitTitle}>Request sent</Text>
        <Text style={s.waitSub}>
          Rahatul will review your request and open the chat shortly. You'll get a notification the moment it opens.
        </Text>
        <View style={{ height: 16 }} />
        <Pill label="Awaiting approval" tone="amber" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.wrap}>
      <Text style={s.h1}>Start a chat</Text>
      <Text style={s.sub}>Tell Rahatul a bit about your project. He reviews new chats and opens a live conversation — usually within a day.</Text>

      <View style={s.lockCard}>
        <Ionicons name="lock-closed" size={16} color={colors.muted} />
        <Text style={s.lockText}>Chat opens once your request is approved.</Text>
      </View>

      <View style={{ height: 12 }} />
      <Input label="YOUR NAME" placeholder="Jane Smith" value={name} onChangeText={setName} />
      <Input label="EMAIL" placeholder="jane@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input label="MESSAGE" placeholder="What do you need help with?" value={message} onChangeText={setMessage} multiline style={{ height: 100, textAlignVertical: "top" }} />
      {err ? <Text style={s.err}>{err}</Text> : null}
      <View style={{ height: 6 }} />
      <Button label={busy ? "Sending…" : "Request to chat"} onPress={submit} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 40 },
  waitIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  waitTitle: { fontFamily: "JakartaBold", fontSize: 20, color: colors.ink },
  waitSub: { fontFamily: "Inter", fontSize: 13.5, color: colors.muted, textAlign: "center", marginTop: 8, lineHeight: 20 },
  wrap: { padding: spacing.xl, paddingTop: 64, paddingBottom: 40 },
  h1: { fontFamily: "JakartaBold", fontSize: 26, color: colors.ink },
  sub: { fontFamily: "Inter", fontSize: 13, color: colors.muted, marginTop: 6, lineHeight: 19 },
  lockCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.bgSoft, borderRadius: radius.md, padding: 12, marginTop: 16 },
  lockText: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted },
  err: { fontFamily: "Inter", fontSize: 13, color: colors.red, marginTop: 4 },
});