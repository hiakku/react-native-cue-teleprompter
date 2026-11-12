import React, { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Script,
  Preferences,
  INITIAL_SCRIPTS,
  DEFAULT_PREFERENCES,
  words,
  duration,
  parseLibrary,
} from "./src/library";
import { Brand, Button, C, Icon, IconButton, SettingSlider, s } from "./src/ui";
import { Editor } from "./src/Editor";
import { Reader } from "./src/Reader";

const KEY = "cue.library.v1";
export default function App() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [screen, setScreen] = useState<"library" | "editor" | "reader">(
    "library",
  );
  const [active, setActive] = useState<Script | null>(null);
  const [settings, setSettings] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Script | null>(null);
  const [filter, setFilter] = useState<"all" | "starred">("all");
  const [query, setQuery] = useState("");
  const { width } = useWindowDimensions();
  const wide = width >= 1050;
  const writes = useRef(Promise.resolve());
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const data = raw
          ? parseLibrary(raw)
          : { scripts: INITIAL_SCRIPTS, preferences: DEFAULT_PREFERENCES };
        if (alive) {
          setScripts(data.scripts);
          setPrefs(data.preferences);
          setReady(true);
        }
      })
      .catch(() => {
        if (alive)
          setError(
            "Your library could not be loaded. Close and reopen Cue to try again. Existing data has not been overwritten.",
          );
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const data = JSON.stringify({ version: 1, scripts, preferences: prefs });
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(KEY, data))
      .then(() => setError(""))
      .catch(() =>
        setError("Changes could not be saved. Keep Cue open and retry saving."),
      );
  }, [scripts, prefs, ready, retry]);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "reader") {
        setScreen("library");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [screen]);
  const edit = (script?: Script) => {
    setActive(
      script || {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title: "",
        body: "",
        starred: false,
        updatedAt: new Date().toISOString(),
      },
    );
    setScreen("editor");
  };
  const read = (script: Script) => {
    setActive(script);
    setScreen("reader");
  };
  const save = (script: Script) => {
    const next = {
      ...script,
      title: script.title.trim() || "Untitled script",
      body: script.body.trim(),
      updatedAt: new Date().toISOString(),
    };
    setScripts((old) => [next, ...old.filter((x) => x.id !== next.id)]);
    setActive(next);
    setScreen("library");
  };
  const toggleStar = (script: Script) =>
    setScripts((old) =>
      old.map((x) => (x.id === script.id ? { ...x, starred: !x.starred } : x)),
    );
  const filtered = scripts.filter(
    (x) =>
      (filter === "all" || x.starred) &&
      `${x.title} ${x.body}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <SafeAreaProvider>
      {screen === "reader" && active ? (
        <Reader
          script={active}
          prefs={prefs}
          setPrefs={setPrefs}
          onClose={() => setScreen("library")}
        />
      ) : (
        <SafeAreaView style={s.safe}>
          <StatusBar style="dark" />
          {screen === "editor" && active ? (
            <Editor
              key={active.id}
              script={active}
              onSave={save}
              onCancel={() => setScreen("library")}
            />
          ) : (
            <View style={s.shell}>
              {wide && (
                <View style={s.sidebar}>
                  <Brand />
                  <Text style={s.sideLabel}>WORKSPACE</Text>
                  <Pressable
                    accessibilityRole="button"
                    style={[s.navItem, filter === "all" && s.navActive]}
                    onPress={() => setFilter("all")}
                  >
                    <Icon name="file-text" size={18} />
                    <Text style={s.navText}>My scripts</Text>
                    <Text style={s.navCount}>{scripts.length}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    style={[s.navItem, filter === "starred" && s.navActive]}
                    onPress={() => setFilter("starred")}
                  >
                    <Icon name="star" size={18} />
                    <Text style={s.navText}>Favourites</Text>
                    <Text style={s.navCount}>
                      {scripts.filter((x) => x.starred).length}
                    </Text>
                  </Pressable>
                  <View style={{ flex: 1 }} />
                  <View style={s.sideNote}>
                    <Icon name="shield" color="#637460" />
                    <Text style={s.sideNoteTitle}>Your words. Your space.</Text>
                    <Text style={s.small}>
                      Scripts stay on this device. No account needed.
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    style={s.navItem}
                    onPress={() => setSettings(true)}
                  >
                    <Icon name="sliders" size={18} />
                    <Text style={s.navText}>Preferences</Text>
                  </Pressable>
                  <Text style={s.version}>CUE TELEPROMPTER · V1.0</Text>
                </View>
              )}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[s.content, !wide && { padding: 22 }]}
                keyboardShouldPersistTaps="handled"
              >
                {!wide && (
                  <View style={s.rowBetween}>
                    <Brand />
                    <IconButton
                      icon="sliders"
                      label="Preferences"
                      onPress={() => setSettings(true)}
                    />
                  </View>
                )}
                <View
                  style={[
                    s.rowBetween,
                    { marginTop: wide ? 0 : 30, gap: 18, flexWrap: "wrap" },
                  ]}
                >
                  <View>
                    <Text style={s.eyebrow}>
                      A LITTLE PREPARATION. A BETTER TAKE.
                    </Text>
                    <Text style={s.pageTitle}>
                      {filter === "starred"
                        ? "Your favourites."
                        : "Find your flow."}
                    </Text>
                    <Text style={s.subtitle}>
                      Your next great take starts with a few words.
                    </Text>
                  </View>
                  <Button
                    title="New script"
                    icon="plus"
                    disabled={!ready}
                    onPress={() => edit()}
                  />
                </View>
                {error ? (
                  <View style={s.error}>
                    <Text style={{ color: "#973B25", flex: 1 }}>{error}</Text>
                    {ready && (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setRetry((x) => x + 1)}
                      >
                        <Text style={{ fontWeight: "700" }}>Retry save</Text>
                      </Pressable>
                    )}
                  </View>
                ) : null}
                <View style={[s.hero, !wide && { padding: 24, marginTop: 28 }]}>
                  <View style={{ flex: 1, zIndex: 1 }}>
                    <View style={s.pill}>
                      <View style={s.dot} />
                      <Text style={s.pillText}>LESS HESITATION. MORE YOU.</Text>
                    </View>
                    <Text style={[s.heroTitle, !wide && { fontSize: 30 }]}>
                      Speak naturally.{"\n"}Stay in the moment.
                    </Text>
                    <Text style={s.heroBody}>
                      Let your words lead the way. Cue keeps your script
                      {wide ? "\n" : " "}moving, so you can focus on showing up.
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      style={s.heroLink}
                      onPress={() =>
                        read(
                          scripts.find((x) => x.id === "welcome") ||
                            INITIAL_SCRIPTS[0],
                        )
                      }
                    >
                      <Text style={{ fontWeight: "700", color: C.ink }}>
                        Try the teleprompter
                      </Text>
                      <Icon name="arrow-up-right" size={17} />
                    </Pressable>
                  </View>
                  {wide && (
                    <View style={s.heroArt}>
                      <View style={s.artTop}>
                        <View style={[s.dot, { backgroundColor: C.orange }]} />
                        <Text style={s.artLabel}>READY WHEN YOU ARE</Text>
                      </View>
                      <Text style={s.artMuted}>Take a breath.</Text>
                      <View style={s.artFocus}>
                        <View style={s.artMarker} />
                        <Text style={s.artWords}>You’ve got this.</Text>
                      </View>
                      <Text style={s.artMuted}>Make it your own.</Text>
                      <View style={s.artBottom}>
                        <Icon name="play" color={C.orange} size={14} />
                        <View style={s.artTrack}>
                          <View style={s.artProgress} />
                        </View>
                        <Text style={s.artLabel}>01:24</Text>
                      </View>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    s.rowBetween,
                    {
                      marginTop: 36,
                      marginBottom: 22,
                      flexWrap: "wrap",
                      gap: 16,
                    },
                  ]}
                >
                  <View style={s.inline}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setFilter("all")}
                      style={[s.tab, filter === "all" && s.tabActive]}
                    >
                      <Text
                        style={[
                          s.tabText,
                          filter === "all" && { color: C.ink },
                        ]}
                      >
                        My scripts
                      </Text>
                      <Text style={s.count}>{scripts.length}</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setFilter("starred")}
                      style={[s.tab, filter === "starred" && s.tabActive]}
                    >
                      <Icon
                        name="star"
                        size={15}
                        color={filter === "starred" ? C.ink : C.muted}
                      />
                      <Text style={s.tabText}>Favourites</Text>
                    </Pressable>
                  </View>
                  <View style={[s.search, !wide && { width: "100%" }]}>
                    <Icon name="search" size={17} color={C.muted} />
                    <TextInput
                      accessibilityLabel="Search scripts"
                      placeholder="Search your scripts"
                      placeholderTextColor={C.muted}
                      value={query}
                      onChangeText={setQuery}
                      style={s.searchInput}
                    />
                    {query.length > 0 && (
                      <IconButton
                        icon="x"
                        label="Clear search"
                        onPress={() => setQuery("")}
                      />
                    )}
                  </View>
                </View>
                {!ready ? (
                  <Text style={s.subtitle}>
                    {error
                      ? "Your saved library is protected."
                      : "Opening your library…"}
                  </Text>
                ) : (
                  <View style={s.grid}>
                    {filtered.map((script, i) => (
                      <View
                        key={script.id}
                        style={[s.card, { width: wide ? "48.5%" : "100%" }]}
                      >
                        <View style={s.rowBetween}>
                          <View
                            style={[
                              s.scriptIcon,
                              {
                                backgroundColor: [
                                  "#EEF1E9",
                                  "#F8EEE8",
                                  "#EBEEF4",
                                ][i % 3],
                              },
                            ]}
                          >
                            <Icon
                              name="align-left"
                              color={["#6A7B60", "#B17B58", "#6C809A"][i % 3]}
                            />
                          </View>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${script.starred ? "Unfavourite" : "Favourite"} ${script.title}`}
                            onPress={() => toggleStar(script)}
                            style={s.iconButton}
                          >
                            <Icon
                              name="star"
                              size={18}
                              color={script.starred ? C.orange : "#B5BBB3"}
                            />
                          </Pressable>
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Open ${script.title}`}
                          onPress={() => edit(script)}
                        >
                          <Text numberOfLines={1} style={s.cardTitle}>
                            {script.title}
                          </Text>
                          <Text numberOfLines={2} style={s.cardPreview}>
                            {script.body.replace(/\n/g, " ")}
                          </Text>
                        </Pressable>
                        <View style={s.metadata}>
                          <Text style={s.small}>
                            {words(script.body)} words
                          </Text>
                          <View style={s.metaDot} />
                          <Icon name="clock" size={12} color={C.muted} />
                          <Text style={s.small}>
                            {duration(words(script.body), prefs.wpm)} read
                          </Text>
                        </View>
                        <View style={s.cardFooter}>
                          <Text style={s.date}>
                            {new Date(script.updatedAt).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )}
                          </Text>
                          <View style={s.inline}>
                            <IconButton
                              icon="trash-2"
                              label={`Delete ${script.title}`}
                              onPress={() => setPendingDelete(script)}
                            />
                            <IconButton
                              icon="edit-3"
                              label={`Edit ${script.title}`}
                              onPress={() => edit(script)}
                            />
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`Read ${script.title}`}
                              onPress={() => read(script)}
                              style={s.readButton}
                            >
                              <Icon name="play" size={14} color={C.orange} />
                              <Text style={s.readButtonText}>Read</Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    ))}
                    {filtered.length === 0 && (
                      <View style={s.empty}>
                        <Icon
                          name={query ? "search" : "file-plus"}
                          size={32}
                          color={C.muted}
                        />
                        <Text style={s.cardTitle}>
                          {query
                            ? "No matching scripts"
                            : filter === "starred"
                              ? "Keep your favourites close"
                              : "Make room for your first take"}
                        </Text>
                        <Text style={s.subtitle}>
                          {query
                            ? "Try a different word or clear your search."
                            : filter === "starred"
                              ? "Tap the star on a script to find it here."
                              : "Write a script or paste one you already have."}
                        </Text>
                        {filter === "all" && !query && (
                          <Button
                            title="Create a script"
                            icon="plus"
                            onPress={() => edit()}
                          />
                        )}
                      </View>
                    )}
                  </View>
                )}
                <View style={s.footerNote}>
                  <Icon name="coffee" size={15} color={C.muted} />
                  <Text style={s.small}>
                    Take a breath. Find your pace. Make it yours.
                  </Text>
                </View>
              </ScrollView>
            </View>
          )}
          <Modal
            visible={settings}
            transparent
            animationType="fade"
            onRequestClose={() => setSettings(false)}
          >
            <View style={s.modalOverlay}>
              <ScrollView
                style={{ maxHeight: "95%", width: "100%", maxWidth: 480 }}
                contentContainerStyle={s.modalCard}
              >
                <View style={s.rowBetween}>
                  <Text style={s.sectionTitle}>Make yourself comfortable.</Text>
                  <IconButton
                    icon="x"
                    label="Close preferences"
                    onPress={() => setSettings(false)}
                  />
                </View>
                <Text style={s.subtitle}>
                  Your reading preferences, saved for every take.
                </Text>
                <SettingSlider
                  label="Reading speed"
                  value={prefs.wpm}
                  unit="wpm"
                  min={60}
                  max={240}
                  step={5}
                  onChange={(wpm) => setPrefs((x) => ({ ...x, wpm }))}
                />
                <SettingSlider
                  label="Text size"
                  value={prefs.fontSize}
                  unit="px"
                  min={24}
                  max={64}
                  step={2}
                  onChange={(fontSize) => setPrefs((x) => ({ ...x, fontSize }))}
                />
                <View style={s.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.settingLabel}>Mirror text</Text>
                    <Text style={s.small}>For a teleprompter glass setup</Text>
                  </View>
                  <Switch
                    accessibilityLabel="Mirror text by default"
                    value={prefs.mirror}
                    onValueChange={(mirror) =>
                      setPrefs((x) => ({ ...x, mirror }))
                    }
                    trackColor={{ true: C.orange }}
                  />
                </View>
                <View style={s.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.settingLabel}>3-second countdown</Text>
                    <Text style={s.small}>
                      A moment to get ready before starting
                    </Text>
                  </View>
                  <Switch
                    accessibilityLabel="Three second countdown"
                    value={prefs.countdown}
                    onValueChange={(countdown) =>
                      setPrefs((x) => ({ ...x, countdown }))
                    }
                    trackColor={{ true: C.orange }}
                  />
                </View>
                <View style={s.privacyBox}>
                  <Icon name="lock" size={16} color={C.muted} />
                  <Text style={[s.small, { flex: 1 }]}>
                    Cue stores scripts on this device. No account, ads, or
                    analytics. Uninstalling the app or clearing its data removes
                    your library.
                  </Text>
                </View>
                <Button title="Done" onPress={() => setSettings(false)} />
              </ScrollView>
            </View>
          </Modal>
          <Modal
            visible={!!pendingDelete}
            transparent
            animationType="fade"
            onRequestClose={() => setPendingDelete(null)}
          >
            <View style={s.modalOverlay}>
              <View style={s.modalCard}>
                <Text style={s.sectionTitle}>Delete this script?</Text>
                <Text style={[s.subtitle, { marginVertical: 20 }]}>
                  “{pendingDelete?.title}” will be removed from this device.
                  This cannot be undone.
                </Text>
                <Button
                  title="Delete script"
                  icon="trash-2"
                  onPress={() => {
                    setScripts((old) =>
                      old.filter((x) => x.id !== pendingDelete?.id),
                    );
                    setPendingDelete(null);
                  }}
                />
                <View style={{ height: 10 }} />
                <Button
                  title="Keep script"
                  secondary
                  onPress={() => setPendingDelete(null)}
                />
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}
