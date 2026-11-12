import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { Script, words, duration } from "./library";
import { Button, IconButton, s } from "./ui";
export function Editor({
  script,
  onSave,
  onCancel,
}: {
  script: Script;
  onSave: (script: Script) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(script.title);
  const [body, setBody] = useState(script.body);
  const [discard, setDiscard] = useState(false);
  const dirty = title !== script.title || body !== script.body;
  const close = useCallback(
    () => (dirty ? setDiscard(true) : onCancel()),
    [dirty, onCancel],
  );
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [close]);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.editorHeader}>
        <IconButton icon="arrow-left" label="Back to library" onPress={close} />
        <Text style={s.settingLabel}>
          {script.body ? "Edit script" : "A fresh start"}
        </Text>
        <Button
          title="Save script"
          icon="check"
          disabled={!body.trim()}
          onPress={() => onSave({ ...script, title, body })}
        />
      </View>
      <View style={s.editor}>
        <Text style={s.eyebrow}>PUT YOUR THOUGHTS INTO WORDS</Text>
        <TextInput
          accessibilityLabel="Script title"
          placeholder="Give it a title…"
          placeholderTextColor="#AFB5AC"
          value={title}
          onChangeText={setTitle}
          maxLength={120}
          style={s.titleInput}
        />
        <Text style={[s.small, { marginBottom: 24 }]}>
          Write freely, or paste your script below. You can find your pace
          later.
        </Text>
        <TextInput
          accessibilityLabel="Script content"
          placeholder="Every great take starts here…"
          placeholderTextColor="#A2AAA0"
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
          style={s.bodyInput}
        />
        <View style={s.editorBottom}>
          <Text style={s.small}>{words(body)} words</Text>
          <Text style={s.small}>~{duration(words(body), 130)} at 130 wpm</Text>
        </View>
      </View>
      <Modal
        visible={discard}
        transparent
        onRequestClose={() => setDiscard(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.sectionTitle}>Leave without saving?</Text>
            <Text style={[s.subtitle, { marginVertical: 20 }]}>
              You have changes in this script.
            </Text>
            <Button title="Keep editing" onPress={() => setDiscard(false)} />
            <View style={{ height: 10 }} />
            <Button title="Discard changes" secondary onPress={onCancel} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
