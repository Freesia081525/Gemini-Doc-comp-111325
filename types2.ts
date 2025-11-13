import { GoogleGenAI } from '@google/genai';

// Defines the specific models you allow
export type LLMModel = 'gemini-2.5-flash' | 'gpt-4o-mini';

// Re-defining other types for clarity
export type Language = 'en' | 'zh';

export interface Theme {
  name: string;
  icon: string;
  primary: string;
  secondary: string;
  accent: string;
}

export type ThemeKey = '櫻花 Cherry Blossom' | '薰衣草 Lavender' | '向日葵 Sunflower' | '海洋 Ocean' | '森林 Forest';

export interface Agent {
  name: string;
  description: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  model: LLMModel; // This now uses our specific type
}

export interface DocumentState {
  id: number;
  content: string;
  file: File | null;
  type: 'text' | 'pdf' | 'image';
}

export interface GraphData {
    nodes: { id: string; group: number }[];
    links: { source: string; target: string; value: number }[];
}

// Props type for DocumentInput component
export interface DocumentInputProps {
    t: any; // Replace with your actual TranslationSet type
    docState: DocumentState;
    setDocState: React.Dispatch<React.SetStateAction<DocumentState>>;
    theme: Theme;
    ai: GoogleGenAI | null;
    selectedModel: LLMModel; // Add the missing prop here
}
