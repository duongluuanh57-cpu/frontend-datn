import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  isError?: boolean;
  rating?: number;
}

export interface ChatState {
  isOpen: boolean;
  sessionId: string | null;
  isFeedbackOpen: boolean;
  currentIntent: string | null;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface ChatActions {
  setIsOpen: (isOpen: boolean) => void;
  setSessionId: (id: string | null) => void;
  setIsFeedbackOpen: (isOpen: boolean) => void;
  setCurrentIntent: (intent: string | null) => void;
  incrementUnread: () => void;
  resetUnread: () => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  updateLastMessage: (content: string) => void;
  setMessageRating: (messageId: string, rating: number) => void;
  clearMessages: () => void;
}

export type ChatStore = ChatState & ChatActions;

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Chào mừng bạn đến với L'essence. Mình có thể giúp gì cho bạn hôm nay? ✨"
};

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        isOpen: false,
        sessionId: null,
        isFeedbackOpen: false,
        currentIntent: null,
        unreadCount: 0,
        messages: [INITIAL_WELCOME_MESSAGE],

        setIsOpen: (isOpen) => set({ isOpen, unreadCount: isOpen ? 0 : 0 }),
        setSessionId: (sessionId) => set({ sessionId }),
        setIsFeedbackOpen: (isFeedbackOpen) => set({ isFeedbackOpen }),
        setCurrentIntent: (currentIntent) => set({ currentIntent }),
        incrementUnread: () => set((state) => ({ unreadCount: state.isOpen ? 0 : state.unreadCount + 1 })),
        resetUnread: () => set({ unreadCount: 0 }),
        
        addMessage: (message) => set((state) => ({ 
          messages: [...state.messages, message] 
        })),
        
        setMessages: (messages) => set({ messages }),
        
        updateLastMessage: (content) => set((state) => {
          const newMessages = [...state.messages];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content
            };
          }
          return { messages: newMessages };
        }),

        setMessageRating: (messageId, rating) => set((state) => ({
          messages: state.messages.map(m => 
            m.id === messageId ? { ...m, rating } : m
          )
        })),

        clearMessages: () => set({ messages: [INITIAL_WELCOME_MESSAGE] }),
      }),
      {
        name: 'lessence-chat-storage',
      }
    )
  )
);
