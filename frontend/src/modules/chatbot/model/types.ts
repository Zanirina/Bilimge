export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  created_at?: string;
};

export type ChatRequest = {
  message: string;
  chat_history: ChatMessage[];
};

export type ChatResponse = {
  response: string;
};
