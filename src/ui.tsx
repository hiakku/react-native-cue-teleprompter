import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Slider from "@react-native-community/slider";
export const C = {
  bg: "#F8F7F3",
  ink: "#232C29",
  muted: "#78807A",
  line: "#E5E7E0",
  orange: "#E76740",
  green: "#EAF0E8",
};
type IconName = React.ComponentProps<typeof Feather>["name"];
export function Icon({
  name,
  size = 20,
  color = C.ink,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} />;
}
export function Button({
  title,
  onPress,
  icon,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && { backgroundColor: "#EBEDE6" },
        { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
      ]}
    >
      {icon && (
        <Icon name={icon} color={secondary ? C.ink : "white"} size={18} />
      )}
      <Text
        style={{
          color: secondary ? C.ink : "white",
          fontWeight: "700",
          fontSize: 13,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function IconButton({
  icon,
  label,
  onPress,
  light = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  light?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.iconButton, { opacity: pressed ? 0.5 : 1 }]}
    >
      <Icon name={icon} color={light ? "#F5F5EE" : C.ink} />
    </Pressable>
  );
}
export function Brand() {
  return (
    <View style={s.brand}>
      <View style={s.logo}>
        <View style={s.logoLine} />
        <View style={[s.logoLine, { width: 12 }]} />
        <View style={s.logoLine} />
      </View>
      <Text style={s.brandName}>
        cue<Text style={{ color: C.orange }}>.</Text>
      </Text>
      <Text style={s.brandSub}>TELEPROMPTER</Text>
    </View>
  );
}
export function SettingSlider({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  dark = false,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  dark?: boolean;
}) {
  return (
    <View style={{ marginTop: 22 }}>
      <View style={s.rowBetween}>
        <Text style={[s.settingLabel, dark && { color: "#DCE3DA" }]}>
          {label}
        </Text>
        <Text style={{ color: dark ? "#EBA486" : C.orange, fontWeight: "700" }}>
          {value} {unit}
        </Text>
      </View>
      <Slider
        accessibilityLabel={label}
        style={{ width: "100%", height: 38, marginTop: 8 }}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={C.orange}
        maximumTrackTintColor={dark ? "#424B45" : "#E0E4DB"}
        thumbTintColor={C.orange}
      />
    </View>
  );
}
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  shell: { flex: 1, flexDirection: "row" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inline: { flexDirection: "row", alignItems: "center", gap: 8 },
  sidebar: {
    width: 230,
    padding: 24,
    borderRightWidth: 1,
    borderRightColor: C.line,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: {
    width: 34,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.orange,
    justifyContent: "center",
    paddingLeft: 9,
    gap: 4,
  },
  logoLine: { width: 17, height: 2, backgroundColor: "white", borderRadius: 2 },
  brandName: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -2,
    color: C.ink,
  },
  brandSub: { fontSize: 8, color: C.muted, letterSpacing: 1.5, marginTop: 8 },
  sideLabel: {
    fontSize: 10,
    letterSpacing: 1.7,
    color: C.muted,
    marginTop: 56,
    marginBottom: 18,
  },
  navItem: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    padding: 13,
    borderRadius: 9,
    marginBottom: 6,
  },
  navActive: { backgroundColor: "#EBEDE5" },
  navText: { fontSize: 13, fontWeight: "600", color: C.ink, flex: 1 },
  navCount: { fontSize: 11, color: C.muted },
  sideNote: {
    backgroundColor: "#EEF0E8",
    padding: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  sideNoteTitle: { color: C.ink, fontSize: 12, fontWeight: "600" },
  version: {
    fontSize: 8,
    color: "#979D93",
    letterSpacing: 1.5,
    marginTop: 25,
    textAlign: "center",
  },
  content: {
    padding: 44,
    maxWidth: 1220,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 30,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.6,
    color: C.muted,
    fontWeight: "700",
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 39,
    fontWeight: "700",
    color: C.ink,
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 22 },
  button: {
    minHeight: 46,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: C.orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  hero: {
    marginTop: 34,
    borderRadius: 18,
    padding: 32,
    backgroundColor: "#EAF0E6",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    gap: 20,
  },
  pill: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    marginBottom: 18,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#879C77" },
  pillText: {
    fontSize: 8,
    letterSpacing: 1.4,
    color: "#6D7F62",
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "600",
    letterSpacing: -1,
    color: C.ink,
    lineHeight: 41,
  },
  heroBody: { fontSize: 12, color: "#74816D", lineHeight: 21, marginTop: 14 },
  heroLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 22,
    alignSelf: "flex-start",
    paddingVertical: 7,
  },
  heroArt: {
    width: 258,
    backgroundColor: "#25312C",
    padding: 21,
    borderRadius: 15,
    transform: [{ rotate: "-4deg" }],
    boxShadow: "0 12px 25px #23332925",
  },
  artTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  artLabel: { fontSize: 7, color: "#A2AFA3", letterSpacing: 1 },
  artMuted: { fontSize: 20, color: "#6B796F", lineHeight: 39, marginLeft: 10 },
  artFocus: {
    backgroundColor: "#35443A",
    paddingVertical: 6,
    marginHorizontal: -7,
    paddingLeft: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  artMarker: {
    width: 3,
    height: 23,
    backgroundColor: "#EBA27D",
    position: "absolute",
    left: 0,
  },
  artWords: { color: "#F3F2E6", fontSize: 22, fontWeight: "600" },
  artBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 22,
  },
  artTrack: { flex: 1, height: 2, backgroundColor: "#4A564D" },
  artProgress: { width: "35%", height: 2, backgroundColor: C.orange },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 12,
    paddingHorizontal: 3,
    marginRight: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: C.orange },
  tabText: { fontSize: 13, fontWeight: "600", color: C.muted },
  count: {
    backgroundColor: "#E9ECE3",
    fontSize: 10,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: "#6A7864",
  },
  search: {
    width: 230,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 12,
    minHeight: 42,
    backgroundColor: "#FFFFFF80",
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: C.ink,
    minWidth: 0,
    paddingVertical: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    padding: 22,
  },
  scriptIcon: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: C.ink,
    marginTop: 18,
    letterSpacing: -0.3,
  },
  cardPreview: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 21,
    marginTop: 10,
    minHeight: 42,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  small: { fontSize: 11, color: C.muted, lineHeight: 18 },
  metaDot: {
    height: 3,
    width: 3,
    borderRadius: 2,
    backgroundColor: "#B1B7AD",
    marginHorizontal: 3,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F0F1EC",
    marginTop: 17,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: { fontSize: 10, color: "#9A9F97" },
  readButton: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#FCF0E9",
    paddingHorizontal: 13,
    paddingVertical: 14,
    borderRadius: 7,
  },
  readButtonText: { color: C.orange, fontSize: 11, fontWeight: "600" },
  footerNote: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  empty: {
    width: "100%",
    padding: 30,
    gap: 18,
    alignItems: "center",
    borderColor: C.line,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 14,
  },
  error: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FCE7DC",
    padding: 16,
    marginTop: 16,
    borderRadius: 9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#15231BC0",
    justifyContent: "center",
    alignItems: "center",
    padding: 22,
  },
  modalCard: {
    width: "100%",
    maxWidth: 480,
    padding: 26,
    backgroundColor: C.bg,
    borderRadius: 18,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "600",
    color: C.ink,
    flexShrink: 1,
  },
  settingLabel: { fontSize: 13, color: C.ink, fontWeight: "600" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginVertical: 16,
  },
  privacyBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#EDF0E7",
    borderRadius: 9,
    padding: 13,
    marginBottom: 22,
  },
  editorHeader: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  editor: {
    flex: 1,
    maxWidth: 850,
    width: "100%",
    alignSelf: "center",
    padding: 24,
  },
  titleInput: {
    fontSize: 30,
    fontWeight: "600",
    color: C.ink,
    paddingVertical: 16,
  },
  bodyInput: {
    flex: 1,
    fontSize: 18,
    lineHeight: 30,
    color: C.ink,
    padding: 0,
  },
  editorBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
});
