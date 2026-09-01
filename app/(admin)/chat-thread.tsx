import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "../../src/components/Avatar";
import { supabase } from "../../src/lib/supabase";
import { pickAndUploadImage } from "../../src/lib/upload";
import { colors, radius, spacing } from "../../src/theme/tokens";

export default function ChatThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [chat, setChat] = useState<any>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const scroller = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    const { data: c } = await supabase.from("chats").select("*").eq("id", id).maybeSingle();
    const { data: m } = await supabase.from("messages").select("*").eq("chat_id", id).order("created_at", { ascending: true });
    setChat(c ?? null);
    setMsgs(m ?? []);
    setLoading(false);
    setTimeout(() => scroller.current?.scrollToEnd({ animated: false }), 50);
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function bumpChat(last: string) {
    await supabase.from("chats").update({ last_message: last, updated_at: new Date().toISOString() }).eq("id", id);
  }

  async function send() {
    const body = text.trim();
    if (!body) return;
    setText("");
    await supabase.from("messages").insert({ chat_id: id, sender: "admin", type: "text", body });
    await bumpChat(body);
    load();
  }

  async function attach() {
    try {
      setUploading(true);
      const url = await pickAndUploadImage(`chats/${id}`);
      if (url) {
        await supabase.from("messages").insert({ chat_id: id, sender: "admin", type: "image", file_url: url });
        await bumpChat("📷 Photo");
        load();
      }
    } catch (e: any) {
      Alert.alert("Upload failed", e.message ?? String(e));
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.primary} /></View>;
  if (!chat) return <View style={s.center}><Text style={{ color: colors.muted }}>Chat not found.</Text></View>;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.iconBtn}><Ionicons name="chevron-back" size={22} color={colors.ink} /></Pressable>
        <Avatar name={chat.title ?? "?"} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={s.hName} numberOfLines={1}>{chat.title}</Text>
          <Text style={s.hSub} numberOfLines={1}>{chat.company ?? ""}</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView ref={scroller} contentContainerStyle={s.body} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}>
        {msgs.map((m) => {
          if (m.type === "event" || m.sender === "event") {
            return (
              <View key={m.id} style={s.eventRow}>
                <Text style={s.eventText}>{m.body}</Text>
              </View>
            );
          }
          const mine = m.sender === "admin";
          return (
            <View key={m.id} style={[s.bubbleRow, mine ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
              <View style={[s.bubble, mine ? s.bubbleMine : s.bubbleTheirs]}>
                {m.type === "image" && m.file_url ? (
                  <Image source={{ uri: m.file_url }} style={s.chatImg} />
                ) : (
                  <Text style={[s.bubbleText, mine && { color: colors.white }]}>{m.body}</Text>
                )}
              </View>
            </View>
          );
        })}
        <View style={{ height: 8 }} />
      </ScrollView>

      {/* Input bar */}
      <View style={s.inputBar}>
        <Pressable onPress={attach} disabled={uploading} style={s.plus}>
          <Ionicons name={uploading ? "hourglass-outline" : "add"} size={22} color={colors.muted} />
        </Pressable>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a reply…"
          placeholderTextColor={colors.muted}
          style={s.input}
          onSubmitEditing={send}
        />
        <Pressable onPress={send} style={s.sendBtn}>
          <Ionicons name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: spacing.lg, paddingTop: 58, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  iconBtn: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  hName: { fontFamily: "JakartaBold", fontSize: 15, color: colors.ink },
  hSub: { fontFamily: "Inter", fontSize: 11.5, color: colors.muted, marginTop: 1 },

  body: { padding: spacing.lg, paddingBottom: 16 },
  eventRow: { alignItems: "center", marginVertical: 10 },
  eventText: { fontFamily: "InterBold", fontSize: 11, color: colors.muted, backgroundColor: colors.bgSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  bubbleRow: { flexDirection: "row", marginBottom: 10 },
  bubble: { maxWidth: "78%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 5 },
  bubbleTheirs: { backgroundColor: colors.bgSoft, borderBottomLeftRadius: 5 },
  bubbleText: { fontFamily: "Inter", fontSize: 14, color: colors.ink, lineHeight: 20 },
  chatImg: { width: 200, height: 150, borderRadius: 12, backgroundColor: colors.line },

  inputBar: { flexDirection: "row", alignItems: "center", gap: 9, padding: 12, paddingBottom: 24, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
  plus: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, backgroundColor: colors.bgSoft, borderRadius: 22, paddingHorizontal: 15, paddingVertical: 11, fontFamily: "Inter", fontSize: 14, color: colors.ink },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
});