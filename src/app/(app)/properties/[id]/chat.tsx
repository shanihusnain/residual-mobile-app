import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useCreateProjectThread,
  useSendProjectMessage,
} from "@/api/mutations/useProjectCommunications";
import { useGetOwnerProjectDetail } from "@/api/queries/useGetOwnerProjectDetail";
import { usePollProjectCommunications } from "@/api/queries/usePollProjectCommunications";
import { fonts } from "@/assets/fonts";
import { AppButton, StatusPill } from "@/components/ui/primitives";
import { getApiErrorMessage, showToast } from "@/config/toastConfig";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useKeyboardBottomInset } from "@/hooks/useKeyboardBottomInset";

export default function PropertyChatTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const keyboardInset = useKeyboardBottomInset();
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();
  const [draft, setDraft] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const sinceRef = useRef<string | null>(null);
  const threadCountRef = useRef(0);

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetOwnerProjectDetail(id, "communications", selectedThreadId);

  const threads = data?.threads ?? [];
  const thread = data?.thread ?? null;
  const activeThreadId = selectedThreadId ?? thread?.id;

  useEffect(() => {
    if (!selectedThreadId && thread?.id) {
      setSelectedThreadId(thread.id);
    }
  }, [selectedThreadId, thread?.id]);

  useEffect(() => {
    const messages = thread?.messages ?? [];
    const latest = messages
      .map((m) => m.sentAtIso)
      .filter(Boolean)
      .sort()
      .at(-1);
    if (latest) sinceRef.current = latest ?? null;
    threadCountRef.current = threads.length;
  }, [thread?.messages, threads.length]);

  const poll = usePollProjectCommunications(
    id,
    sinceRef.current,
    activeThreadId,
    !!id,
  );

  useEffect(() => {
    const pollData = poll.data;
    if (!pollData) return;
    const countChanged = pollData.threadCount !== threadCountRef.current;
    if (pollData.hasNew || countChanged) {
      void refetch();
      if (pollData.latestAt) sinceRef.current = pollData.latestAt;
      threadCountRef.current = pollData.threadCount;
    }
  }, [poll.data, refetch]);

  const sendMessage = useSendProjectMessage();
  const createThread = useCreateProjectThread();
  const messages = thread?.messages ?? [];

  async function onSend() {
    if (!id || !activeThreadId || !draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    try {
      await sendMessage.mutateAsync({
        projectId: id,
        threadId: activeThreadId,
        body,
      });
    } catch {
      setDraft(body);
    }
  }

  async function onCreateThread() {
    if (!id) return;
    if (!newTitle.trim()) {
      showToast("error", "Title is required");
      return;
    }
    try {
      const res = await createThread.mutateAsync({
        projectId: id,
        title: newTitle.trim(),
        body: newBody.trim() || undefined,
      });
      if (res.thread?.id) setSelectedThreadId(res.thread.id);
      setShowNewThread(false);
      setNewTitle("");
      setNewBody("");
    } catch {
      // toast handled in hook
    }
  }

  if (isLoading && !data) {
    return (
      <ActivityIndicator color={Colors.light.primary} style={styles.loader} />
    );
  }

  if (isError) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Couldn’t load communications</Text>
        <Text style={styles.emptyBody}>
          {getApiErrorMessage(error, "Please try again.")}
        </Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.retry}>Tap to retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        {
          paddingBottom: keyboardInset > 0 ? keyboardInset : insets.bottom,
        },
      ]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.threadBar}>
          <FlatList
            horizontal
            data={threads}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.threadList}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <Pressable
                style={styles.newThread}
                onPress={() => setShowNewThread(true)}
              >
                <Text style={styles.newThreadLabel}>+ New</Text>
              </Pressable>
            }
            renderItem={({ item }) => {
              const active = item.id === activeThreadId;
              return (
                <Pressable
                  style={[styles.threadChip, active && styles.threadChipActive]}
                  onPress={() => setSelectedThreadId(item.id)}
                >
                  <Text
                    style={[
                      styles.threadTitle,
                      active && styles.threadTitleActive,
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <StatusPill
                    label={item.status}
                    tone={
                      item.statusRaw === "closed"
                        ? "success"
                        : item.statusRaw === "answered"
                          ? "info"
                          : "warning"
                    }
                  />
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyThreads}>No threads yet</Text>
            }
          />
        </View>
      </TouchableWithoutFeedback>

      {thread ? (
        <Pressable onPress={Keyboard.dismiss} style={styles.threadHeader}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {thread.title}
          </Text>
          <Text style={styles.headerRef}>{thread.reference}</Text>
        </Pressable>
      ) : null}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={Keyboard.dismiss}
        refreshing={isRefetching}
        onRefresh={() => {
          void refetch();
        }}
        ListEmptyComponent={
          <Pressable onPress={Keyboard.dismiss}>
            <Text style={styles.emptyThreads}>
              {threads.length === 0
                ? "Start a new thread to message the team."
                : "No messages in this thread."}
            </Text>
          </Pressable>
        }
        renderItem={({ item }) => {
          const outgoing = item.side === "outgoing";
          return (
            <Pressable onPress={Keyboard.dismiss}>
              <View
                style={[
                  styles.bubble,
                  outgoing ? styles.bubbleOwner : styles.bubbleTenant,
                ]}
              >
                {!outgoing ? (
                  <Text style={styles.sender}>{item.senderName}</Text>
                ) : null}
                <Text
                  style={[
                    styles.bubbleText,
                    outgoing && styles.bubbleTextOwner,
                  ]}
                >
                  {item.body}
                </Text>
                <Text style={[styles.time, outgoing && styles.timeOwner]}>
                  {item.sentAt}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      {activeThreadId ? (
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor="rgba(51,51,51,0.45)"
          />
          <Pressable
            style={[
              styles.send,
              (sendMessage.isPending || !draft.trim()) && styles.sendDisabled,
            ]}
            disabled={sendMessage.isPending || !draft.trim()}
            onPress={() => {
              void onSend();
            }}
          >
            <Text style={styles.sendLabel}>Send</Text>
          </Pressable>
        </View>
      ) : null}

      <Modal visible={showNewThread} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New thread</Text>
            <TextInput
              style={styles.modalInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Subject"
              placeholderTextColor="rgba(51,51,51,0.45)"
            />
            <TextInput
              style={[styles.modalInput, styles.modalBody]}
              value={newBody}
              onChangeText={setNewBody}
              placeholder="Optional first message"
              placeholderTextColor="rgba(51,51,51,0.45)"
              multiline
            />
            <View style={styles.modalActions}>
              <AppButton
                label="Cancel"
                variant="outline"
                onPress={() => setShowNewThread(false)}
              />
              <AppButton
                label="Create"
                loading={createThread.isPending}
                onPress={() => {
                  void onCreateThread();
                }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { marginTop: Spacing.six },
  threadBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
    paddingVertical: Spacing.two,
  },
  threadList: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    alignItems: "center",
  },
  newThread: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.full,
    backgroundColor: "rgba(211,160,93,0.15)",
  },
  newThreadLabel: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 13,
    color: Colors.light.primary,
  },
  threadChip: {
    maxWidth: 200,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.lightGray,
    gap: 4,
  },
  threadChipActive: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  threadTitle: {
    fontFamily: fonts.inter18.medium,
    fontSize: 13,
    color: Colors.light.black,
  },
  threadTitleActive: { color: Colors.light.primary },
  threadHeader: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  headerTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 15,
    color: Colors.light.black,
  },
  headerRef: {
    fontFamily: fonts.inter18.regular,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  list: { padding: Spacing.four, gap: Spacing.two, flexGrow: 1 },
  bubble: {
    maxWidth: "80%",
    borderRadius: 14,
    padding: Spacing.three,
    gap: 4,
  },
  bubbleOwner: {
    alignSelf: "flex-end",
    backgroundColor: Colors.light.primary,
  },
  bubbleTenant: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.lightGray,
  },
  sender: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  bubbleText: {
    fontFamily: fonts.inter18.regular,
    fontSize: 15,
    color: Colors.light.darkGray,
  },
  bubbleTextOwner: { color: Colors.light.white },
  time: {
    fontFamily: fonts.inter18.regular,
    fontSize: 11,
    color: "rgba(51,51,51,0.55)",
    alignSelf: "flex-end",
  },
  timeOwner: { color: "rgba(255,255,255,0.8)" },
  composer: {
    flexDirection: "row",
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.gray,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(51,51,51,0.15)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: fonts.inter18.regular,
    fontSize: 15,
    color: Colors.light.darkGray,
  },
  send: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.5 },
  sendLabel: {
    fontFamily: fonts.inter18.semiBold,
    color: Colors.light.white,
  },
  empty: {
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.six,
  },
  emptyTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 16,
    color: Colors.light.black,
  },
  emptyBody: {
    fontFamily: fonts.inter18.regular,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  emptyThreads: {
    fontFamily: fonts.inter18.regular,
    fontSize: 13,
    color: Colors.light.textSecondary,
    paddingHorizontal: Spacing.two,
  },
  retry: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 14,
    color: Colors.light.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: Spacing.four,
  },
  modalCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: {
    fontFamily: fonts.inter18.semiBold,
    fontSize: 18,
    color: Colors.light.black,
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: fonts.inter18.regular,
    fontSize: 15,
    color: Colors.light.black,
  },
  modalBody: { minHeight: 80, textAlignVertical: "top" },
  modalActions: { gap: Spacing.two },
});
