export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  imageUrls?: string[];
  sources?: { uri: string; title: string }[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}
