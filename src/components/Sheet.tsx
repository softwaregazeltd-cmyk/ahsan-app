import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";
import { Button } from "./Button";

type Props = {
  visible: boolean;
  title: string;
  note?: string;
  withInput?: boolean;
  inputPlaceholder?: string;
  confirmLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: (text: string) => void;
};

export function Sheet({ visible, title, note, withInput, inputPlaceholder, confirmLabel = "Confirm", danger, onCancel, onConfirm }: Props) {
  const [text, setText] = useState("");
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={s.backdrop} onPress={onCancel} />
      <View style={s.sheet}>
        <Text style={s.title}>{title}</Text>
        {note ? <Text style={s.note}>{note}</Text> : null}
        {withInput ? (
          <TextInput
            placeholder={inputPlaceholder}
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            multiline
            style={s.input}
          />
        ) : null}
        <View style={s.row}>
          <View style={{ flex: 0 }}>
            <Button label="Cancel" variant="ghost" onPress={() => { setText(""); onCancel(); }} />
          </View>
          <View style={{ flex: 1 }}>
            <Pressable
              onPress={() => { if (withInput && !text.trim()) return; onConfirm(text.trim()); setText(""); }}
              style={[s.confirm, { backgroundColor: danger ? colors.red : colors.primary }]}
            >
              <Text style={s.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(20,15,10,0.45)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, paddingBottom: 34 },
  title: { fontFamily: "JakartaBold", fontSize: 19, color: colors.ink },
  note: { fontFamily: "Inter", fontSize: 12.5, color: colors.muted, marginTop: 6, lineHeight: 19 },
  input: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bgSoft, borderRadius: radius.md, padding: 13, minHeight: 90, textAlignVertical: "top", fontFamily: "Inter", fontSize: 14, color: colors.ink, marginTop: 14 },
  row: { flexDirection: "row", gap: 10, marginTop: 16, alignItems: "center" },
  confirm: { paddingVertical: 14, borderRadius: radius.md, alignItems: "center" },
  confirmText: { fontFamily: "InterBold", fontSize: 15, color: colors.white },
});