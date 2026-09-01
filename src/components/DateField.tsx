import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";

type Props = {
  label?: string;
  value: string;                 // "YYYY-MM-DD" or ""
  onChange: (iso: string) => void;
  placeholder?: string;
};

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function pretty(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function DateField({ label, value, onChange, placeholder = "Select a date" }: Props) {
  const [show, setShow] = useState(false);
  const [temp, setTemp] = useState<Date>(value ? new Date(value + "T00:00:00") : new Date());

  function openPicker() {
    setTemp(value ? new Date(value + "T00:00:00") : new Date());
    setShow(true);
  }

  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <Pressable style={s.field} onPress={openPicker}>
        <Text style={[s.value, !value && { color: colors.muted }]}>{value ? pretty(value) : placeholder}</Text>
        <Ionicons name="calendar-outline" size={18} color={colors.muted} />
      </Pressable>

      {/* iOS: modal popup with solid background */}
      {Platform.OS === "ios" && (
        <Modal visible={show} transparent animationType="fade" onRequestClose={() => setShow(false)}>
          <Pressable style={s.backdrop} onPress={() => setShow(false)} />
          <View style={s.iosSheet}>
            <View style={s.iosHeader}>
              <Pressable onPress={() => setShow(false)}><Text style={s.cancel}>Cancel</Text></Pressable>
              <Text style={s.iosTitle}>{label ?? "Select date"}</Text>
              <Pressable onPress={() => { onChange(fmt(temp)); setShow(false); }}><Text style={s.done}>Done</Text></Pressable>
            </View>
            <DateTimePicker
              value={temp}
              mode="date"
              display="inline"
              themeVariant="light"
              onChange={(_e, selected) => { if (selected) setTemp(selected); }}
              style={{ backgroundColor: colors.bg }}
            />
          </View>
        </Modal>
      )}

      {/* Android: native dialog, closes on select */}
      {Platform.OS === "android" && show && (
        <DateTimePicker
          value={temp}
          mode="date"
          display="default"
          onChange={(event, selected) => {
            setShow(false);
            if (event.type === "set" && selected) onChange(fmt(selected));
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontFamily: "InterBold", fontSize: 12, color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  field: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bgSoft, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13 },
  value: { fontFamily: "Inter", fontSize: 14, color: colors.ink },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(20,15,10,0.45)" },
  iosSheet: { position: "absolute", left: 12, right: 12, top: "22%", backgroundColor: colors.bg, borderRadius: 20, padding: spacing.lg, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  iosHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  iosTitle: { fontFamily: "JakartaBold", fontSize: 14, color: colors.ink },
  cancel: { fontFamily: "InterBold", fontSize: 14, color: colors.muted },
  done: { fontFamily: "InterBold", fontSize: 14, color: colors.primary },
});