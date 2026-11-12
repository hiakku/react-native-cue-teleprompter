import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import { Preferences, Script } from "./library";
import { C, Icon, IconButton, SettingSlider } from "./ui";

export function Reader({
  script,
  prefs,
  setPrefs,
  onClose,
}: {
  script: Script;
  prefs: Preferences;
  setPrefs: React.Dispatch<React.SetStateAction<Preferences>>;
  onClose: () => void;
}) {
  useKeepAwake();
  const [playing, setPlaying] = useState(false);
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [controls, setControls] = useState(false);
  const [viewport, setViewport] = useState({ width: 400, height: 600 });
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const offset = useRef(0);
  const contentHeight = useRef(0);
  const maxOffset = useCallback(
    () => Math.max(0, contentHeight.current - viewport.height),
    [viewport.height],
  );
  const reset = () => {
    setPlaying(false);
    setCount(0);
    offset.current = 0;
    scroll.current?.scrollTo({ y: 0, animated: false });
    setProgress(0);
  };
  const toggle = () => {
    if (playing || count) {
      setPlaying(false);
      setCount(0);
    } else {
      if (offset.current >= maxOffset() - 1) {
        offset.current = 0;
        scroll.current?.scrollTo({ y: 0, animated: false });
      }
      if (prefs.countdown) setCount(3);
      else setPlaying(true);
    }
  };
  useEffect(() => {
    if (!count) return;
    const timer = setTimeout(() => {
      if (count === 1) {
        setCount(0);
        setPlaying(true);
      } else setCount(count - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [count]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        setPlaying(false);
        setCount(0);
      }
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let previous = 0;
    const usableWidth = Math.max(120, Math.min(viewport.width - 72, 828));
    const wordsPerLine = Math.max(2, usableWidth / (prefs.fontSize * 0.52 * 6));
    const pixelsPerSecond =
      (prefs.wpm / 60 / wordsPerLine) * prefs.fontSize * 1.65;
    const tick = (time: number) => {
      if (previous) {
        offset.current = Math.min(
          maxOffset(),
          offset.current +
            (Math.min(time - previous, 100) / 1000) * pixelsPerSecond,
        );
        scroll.current?.scrollTo({ y: offset.current, animated: false });
        setProgress(maxOffset() ? offset.current / maxOffset() : 0);
        if (offset.current >= maxOffset()) {
          setPlaying(false);
          return;
        }
      }
      previous = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, viewport, prefs.wpm, prefs.fontSize, maxOffset]);
  return (
    <SafeAreaView style={r.reader}>
      <StatusBar style="light" />
      <View style={r.header}>
        <IconButton
          light
          icon="x"
          label="Close teleprompter"
          onPress={onClose}
        />
        <Text numberOfLines={1} style={r.title}>
          {script.title}
        </Text>
        <IconButton
          light
          icon="sliders"
          label="Reading controls"
          onPress={() => {
            setControls((x) => !x);
            setPlaying(false);
            setCount(0);
          }}
        />
      </View>
      <View
        style={r.viewport}
        onLayout={(e) => {
          setPlaying(false);
          setCount(0);
          const { width, height } = e.nativeEvent.layout;
          setViewport((old) =>
            old.width === width && old.height === height
              ? old
              : { width, height },
          );
        }}
      >
        <ScrollView
          ref={scroll}
          onContentSizeChange={(_, h) => {
            contentHeight.current = h;
          }}
          scrollEventThrottle={32}
          onScrollBeginDrag={() => {
            setPlaying(false);
            setCount(0);
          }}
          onScroll={(e) => {
            offset.current = e.nativeEvent.contentOffset.y;
            setProgress(
              maxOffset()
                ? Math.max(0, Math.min(1, offset.current / maxOffset()))
                : 0,
            );
          }}
          contentContainerStyle={{
            paddingTop: viewport.height * 0.32,
            paddingBottom: viewport.height * 0.68,
            paddingHorizontal: 36,
          }}
          style={{ transform: [{ scaleX: prefs.mirror ? -1 : 1 }] }}
        >
          <Text
            style={[
              r.text,
              { fontSize: prefs.fontSize, lineHeight: prefs.fontSize * 1.65 },
            ]}
          >
            {script.body}
          </Text>
        </ScrollView>
        <View
          pointerEvents="none"
          style={[r.guide, { top: viewport.height * 0.32 }]}
        >
          <View style={r.triangle} />
        </View>
        {count > 0 && (
          <View pointerEvents="none" style={r.overlay}>
            <Text style={r.count}>{count}</Text>
            <Text style={{ color: "white" }}>Find your breath.</Text>
          </View>
        )}
      </View>
      {controls && (
        <View style={r.settings}>
          <SettingSlider
            dark
            label="Reading speed"
            value={prefs.wpm}
            unit="wpm"
            min={60}
            max={240}
            step={5}
            onChange={(wpm) => setPrefs((x) => ({ ...x, wpm }))}
          />
          <SettingSlider
            dark
            label="Text size"
            value={prefs.fontSize}
            unit="px"
            min={24}
            max={64}
            step={2}
            onChange={(fontSize) => setPrefs((x) => ({ ...x, fontSize }))}
          />
          <View style={r.settingRow}>
            <Text style={{ color: "#DCE3DA" }}>Mirror text</Text>
            <Switch
              accessibilityLabel="Mirror text"
              value={prefs.mirror}
              onValueChange={(mirror) => setPrefs((x) => ({ ...x, mirror }))}
              trackColor={{ true: C.orange }}
            />
          </View>
        </View>
      )}
      <View style={r.progress}>
        <View
          style={{
            height: 3,
            width: `${progress * 100}%`,
            backgroundColor: C.orange,
          }}
        />
      </View>
      <View style={r.footer}>
        <IconButton
          light
          icon="rotate-ccw"
          label="Restart script"
          onPress={reset}
        />
        <View style={{ alignItems: "center" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              playing || count ? "Pause scrolling" : "Start scrolling"
            }
            onPress={toggle}
            style={r.play}
          >
            <Icon
              name={playing || count ? "pause" : "play"}
              color="white"
              size={26}
            />
          </Pressable>
          <Text style={r.hint}>
            {playing
              ? "Tap to pause"
              : count
                ? "Getting ready…"
                : progress >= 0.999
                  ? "Finished · tap to read again"
                  : "Ready when you are"}
          </Text>
        </View>
        <View style={{ width: 54, alignItems: "center" }}>
          <Text style={{ color: "#EBA486", fontWeight: "700" }}>
            {prefs.wpm}
          </Text>
          <Text style={r.hint}>wpm</Text>
        </View>
      </View>
      <Text style={[r.hint, { textAlign: "center", marginBottom: 10 }]}>
        Estimated pace · swipe the script to adjust your position
      </Text>
    </SafeAreaView>
  );
}
const r = StyleSheet.create({
  reader: { flex: 1, backgroundColor: "#17211C" },
  header: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: { flex: 1, color: "#B0BCB2", fontSize: 13, textAlign: "center" },
  viewport: { flex: 1, overflow: "hidden" },
  text: {
    color: "#F5F4EA",
    fontWeight: "500",
    maxWidth: 828,
    width: "100%",
    alignSelf: "center",
  },
  guide: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 65,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#DA9E6530",
    backgroundColor: "#D3DDB408",
  },
  triangle: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 9,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: C.orange,
    marginTop: 18,
    marginLeft: 10,
  },
  settings: {
    backgroundColor: "#233028",
    paddingHorizontal: 28,
    maxHeight: 310,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  progress: { height: 3, backgroundColor: "#374439" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 16,
    paddingBottom: 12,
  },
  play: {
    backgroundColor: C.orange,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: { fontSize: 10, color: "#91A093", marginTop: 8 },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#17211CEB",
    alignItems: "center",
    justifyContent: "center",
  },
  count: { fontSize: 110, color: "#EBA486", fontWeight: "600" },
});
