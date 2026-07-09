import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ChatApiResponse, ChatConversation, ChatMessage } from '../../../types/chatTypes';
import type { ApiQueryError } from '../../../types/apiTypes';
import { createAxiosBaseQuery } from '../../../utils/api/axiosBaseQuery';

const axiosBaseQuery = createAxiosBaseQuery('Chat request failed');

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fakeBaseQuery<ApiQueryError>(),
  tagTypes: ['ChatConversations', 'ChatMessages'],
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  endpoints: (builder) => ({
    getConversations: builder.query<ChatApiResponse<ChatConversation[]>, void>({
      queryFn: () =>
        axiosBaseQuery<ChatApiResponse<ChatConversation[]>>({
          url: '/api/chats/conversations',
          method: 'GET',
        }),
      providesTags: (result) => [
        { type: 'ChatConversations', id: 'LIST' },
        ...((result?.data ?? []).map((conversation) => ({
          type: 'ChatConversations' as const,
          id: conversation._id,
        })) ?? []),
      ],
    }),
    getMessages: builder.query<ChatApiResponse<ChatMessage[]>, { conversationId: string }>({
      queryFn: ({ conversationId }) =>
        axiosBaseQuery<ChatApiResponse<ChatMessage[]>>({
          url: `/api/chats/conversations/${conversationId}/messages`,
          method: 'GET',
        }),
      providesTags: (_result, _error, { conversationId }) => [
        { type: 'ChatMessages', id: conversationId },
      ],
    }),
    sendMessage: builder.mutation<
      ChatApiResponse<ChatMessage>,
      { conversationId: string; message: string }
    >({
      queryFn: ({ conversationId, message }) =>
        axiosBaseQuery<ChatApiResponse<ChatMessage>>({
          url: `/api/chats/conversations/${conversationId}/messages`,
          method: 'POST',
          data: { message },
        }),
      async onQueryStarted({ conversationId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const createdMessage = data.data;

          if (!createdMessage) {
            return;
          }

          dispatch(
            chatApi.util.updateQueryData('getMessages', { conversationId }, (draft) => {
              const messages = draft.data ?? [];
              const exists = messages.some((message) => message._id === createdMessage._id);

              if (!exists) {
                messages.push(createdMessage);
                draft.data = messages;
              }
            }),
          );
        } catch {
          return;
        }
      },
    }),
    markSeen: builder.mutation<ChatApiResponse, { conversationId: string }>({
      queryFn: ({ conversationId }) =>
        axiosBaseQuery<ChatApiResponse>({
          url: `/api/chats/conversations/${conversationId}/seen`,
          method: 'PATCH',
        }),
      async onQueryStarted({ conversationId }, { dispatch, queryFulfilled }) {
        const patchConversations = dispatch(
          chatApi.util.updateQueryData('getConversations', undefined, (draft) => {
            const conversations = draft.data ?? [];
            const targetConversation = conversations.find(
              (conversation) => conversation._id === conversationId,
            );

            if (targetConversation) {
              targetConversation.unreadCount = 0;
            }
          }),
        );

        const patchMessages = dispatch(
          chatApi.util.updateQueryData('getMessages', { conversationId }, (draft) => {
            const messages = draft.data ?? [];
            messages.forEach((message) => {
              message.status = 'SEEN';
            });
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchConversations.undo();
          patchMessages.undo();
        }
      },
    }),
    startCandidateHrConversation: builder.mutation<ChatApiResponse<ChatConversation>, void>({
      queryFn: () =>
        axiosBaseQuery<ChatApiResponse<ChatConversation>>({
          url: '/api/chats/conversations/start-candidate-hr',
          method: 'POST',
        }),
      invalidatesTags: [{ type: 'ChatConversations', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useMarkSeenMutation,
  useSendMessageMutation,
  useStartCandidateHrConversationMutation,
} = chatApi;
