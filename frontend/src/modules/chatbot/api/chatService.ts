import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import type { ChatMessage, ChatRequest, ChatResponse } from "../model/types";

export const chatService = {
  getHistory: () =>
    http.get<ChatMessage[]>(endpoints.chat.root),

  sendMessage: (message: string, chatHistory: ChatMessage[]) =>
    http.post<ChatResponse>(endpoints.chat.root, {
      message,
      chat_history: chatHistory.slice(-10),
    } satisfies ChatRequest),

  clearHistory: () =>
    http.delete(endpoints.chat.root),
};
