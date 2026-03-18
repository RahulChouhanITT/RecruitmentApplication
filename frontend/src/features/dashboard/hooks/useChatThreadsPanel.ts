import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "../../../app/hooks";
import { useSocket } from "../../../app/socket/useSocket";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useMarkSeenMutation,
  useSendMessageMutation,
  useStartCandidateHrConversationMutation,
} from "../api/chatApi";
import type { ChatThreadsPanelProps, ChatMessageItem } from "../types/dashboardTypes";
import { formatMessageDateLabel, getMessageDateKey } from "../utils/chatThreadHelpers";

export const useChatThreadsPanel = ({
  hideConversationList = false,
  forcedConversationId,
}: ChatThreadsPanelProps) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { socket } = useSocket();
  const currentUserId = currentUser?._id ?? "";
  const [activeConversationId, setActiveConversationId] = useState("");
  const [isConversationPickerOpen, setIsConversationPickerOpen] = useState(!hideConversationList);
  const [draft, setDraft] = useState("");
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const { data: conversationsResponse } = useGetConversationsQuery();
  const [markSeen] = useMarkSeenMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [startCandidateHrConversation, { isLoading: isStartingChat }] = useStartCandidateHrConversationMutation();
  const conversations = useMemo(() => conversationsResponse?.data ?? [], [conversationsResponse?.data]);

  const { data: messagesResponse, refetch: refetchMessages } = useGetMessagesQuery(
    { conversationId: activeConversationId },
    { skip: !activeConversationId }
  );
  const messages = messagesResponse?.data ?? [];
  const activeConversationIdRef = useRef(activeConversationId);
  const currentUserIdRef = useRef(currentUserId);
  const refetchMessagesRef = useRef(refetchMessages);
  const markSeenRef = useRef(markSeen);

  const messageItems = useMemo<ChatMessageItem[]>(() => {
    const items: ChatMessageItem[] = [];

    let previousDateKey = "";
    for (const message of messages) {
      const nextDateKey = getMessageDateKey(message.createdAt);
      if (nextDateKey !== previousDateKey) {
        items.push({
          type: "date",
          key: `date-${nextDateKey}`,
          label: formatMessageDateLabel(message.createdAt),
        });
        previousDateKey = nextDateKey;
      }

      items.push({
        type: "message",
        key: message._id,
        message,
      });
    }

    return items;
  }, [messages]);

  useEffect(() => {
    if (!forcedConversationId && !activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0]._id);
      if (hideConversationList) {
        setIsConversationPickerOpen(false);
      }
    }
  }, [activeConversationId, conversations, forcedConversationId, hideConversationList]);

  useEffect(() => {
    if (forcedConversationId) {
      setActiveConversationId(forcedConversationId);
      setIsConversationPickerOpen(false);
      return;
    }

    if (hideConversationList) {
      setIsConversationPickerOpen(false);
    }
  }, [forcedConversationId, hideConversationList]);

  useEffect(() => {
    if (!hideConversationList) {
      setIsConversationPickerOpen(true);
    }
  }, [hideConversationList]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }
    void markSeen({ conversationId: activeConversationId });
  }, [activeConversationId, markSeen]);

  useEffect(() => {
    const listElement = messageListRef.current;
    if (!listElement) {
      return;
    }
    listElement.scrollTop = listElement.scrollHeight;
  }, [activeConversationId, messages.length]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    refetchMessagesRef.current = refetchMessages;
  }, [refetchMessages]);

  useEffect(() => {
    markSeenRef.current = markSeen;
  }, [markSeen]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const onChatMessage = (payload: { conversationId?: string; sender?: { _id?: string } }) => {
      const conversationId = activeConversationIdRef.current;
      const userId = currentUserIdRef.current;

      if (conversationId) {
        void refetchMessagesRef.current();
      }
      if (
        payload?.conversationId &&
        payload.conversationId === conversationId &&
        payload.sender?._id &&
        payload.sender._id !== userId
      ) {
        void markSeenRef.current({ conversationId });
      }
    };

    const onConversationUpdated = (payload: { conversationId?: string }) => {
      if (payload?.conversationId && payload.conversationId === activeConversationIdRef.current) {
        void refetchMessagesRef.current();
      }
    };

    socket.on("chat:message", onChatMessage);
    socket.on("chat:conversation_updated", onConversationUpdated);

    return () => {
      socket.off("chat:message", onChatMessage);
      socket.off("chat:conversation_updated", onConversationUpdated);
    };
  }, [socket]);

  const onStartCandidateChat = async (): Promise<void> => {
    const response = await startCandidateHrConversation().unwrap();
    if (response.data?._id) {
      setActiveConversationId(response.data._id);
    }
  };

  const activeConversation = conversations.find((conversation) => conversation._id === activeConversationId) ?? null;
  const activeParticipant = activeConversation?.participants.find((participant) => participant._id !== currentUserId) ?? null;
  const activeTitle = activeParticipant?.name ?? "Conversation";
  const activePresence = activeParticipant?.isOnline ? "online" : "offline";
  const shouldShowConversationList = !hideConversationList || isConversationPickerOpen;
  const shouldShowMessagePane = (!hideConversationList || !isConversationPickerOpen) && Boolean(activeConversationId);

  const onConversationSelect = (conversationId: string): void => {
    setActiveConversationId(conversationId);
    if (hideConversationList) {
      setIsConversationPickerOpen(false);
    }
  };

  const submitMessage = async (): Promise<void> => {
    if (!activeConversationId || !draft.trim()) {
      return;
    }

    await sendMessage({ conversationId: activeConversationId, message: draft.trim() });
    setDraft("");
    await markSeen({ conversationId: activeConversationId });
  };

  const onSendMessage = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    await submitMessage();
  };

  const onComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!draft.trim() || isSending) {
        return;
      }
      void submitMessage();
    }
  };

  return {
    currentUser,
    currentUserId,
    activeConversationId,
    isConversationPickerOpen,
    draft,
    setDraft,
    messageListRef,
    conversations,
    messageItems,
    isSending,
    isStartingChat,
    onStartCandidateChat,
    activeTitle,
    activePresence,
    shouldShowConversationList,
    shouldShowMessagePane,
    onConversationSelect,
    onSendMessage,
    onComposerKeyDown,
  };
};
