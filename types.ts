
export type Language = 'en' | 'zh_TW';

export type ThemeKey = 
    | "櫻花 Cherry Blossom" | "玫瑰 Rose" | "薰衣草 Lavender" | "鬱金香 Tulip" | "向日葵 Sunflower" 
    | "蓮花 Lotus" | "蘭花 Orchid" | "茉莉 Jasmine" | "牡丹 Peony" | "百合 Lily"
    | "紫羅蘭 Violet" | "梅花 Plum Blossom" | "茶花 Camellia" | "康乃馨 Carnation" | "海棠 Begonia"
    | "桂花 Osmanthus" | "紫藤 Wisteria" | "水仙 Narcissus" | "杜鵑 Azalea" | "芙蓉 Hibiscus";

export interface Theme {
    primary: string;
    secondary: string;
    accent: string;
    icon: string;
}

export interface TranslationSet {
    [key: string]: any;
}

// Fix: Removed non-Gemini model to align with project's available models.
export type LLMModel = 'gemini-2.5-flash' | 'gemini-2.5-pro';

export interface Agent {
    name: string;
    description: string;
    system_prompt: string;
    model: LLMModel;
    temperature: number;
    max_tokens: number;
}

export type DocType = 'text' | 'pdf' | 'json' | 'md';

export interface DocumentState {
    id: number;
    content: string;
    file: File | null;
    type: DocType;
}

// Fix: Added missing GraphData type for the WordGraph component.
export interface GraphNode {
    id: string;
    [key: string]: any;
}

export interface GraphLink {
    source: string;
    target: string;
    [key: string]: any;
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}
