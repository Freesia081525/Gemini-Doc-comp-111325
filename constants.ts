
import { Theme, Agent, TranslationSet, ThemeKey } from './types';

export const FLOWER_THEMES: Record<ThemeKey, Theme> = {
    "櫻花 Cherry Blossom": { primary: "#FFB7C5", secondary: "#FFC0CB", accent: "#FF69B4", icon: "🌸" },
    "玫瑰 Rose": { primary: "#E91E63", secondary: "#F06292", accent: "#C2185B", icon: "🌹" },
    "薰衣草 Lavender": { primary: "#9C27B0", secondary: "#BA68C8", accent: "#7B1FA2", icon: "💜" },
    "鬱金香 Tulip": { primary: "#FF5722", secondary: "#FF8A65", accent: "#E64A19", icon: "🌷" },
    "向日葵 Sunflower": { primary: "#FFC107", secondary: "#FFD54F", accent: "#FFA000", icon: "🌻" },
    "蓮花 Lotus": { primary: "#E91E8C", secondary: "#F48FB1", accent: "#AD1457", icon: "🪷" },
    "蘭花 Orchid": { primary: "#9C27B0", secondary: "#CE93D8", accent: "#6A1B9A", icon: "🌺" },
    "茉莉 Jasmine": { primary: "#4CAF50", secondary: "#81C784", accent: "#388E3C", icon: "🤍" },
    "牡丹 Peony": { primary: "#E91E63", secondary: "#F06292", accent: "#C2185B", icon: "🌺" },
    "百合 Lily": { primary: "#A5D6A7", secondary: "#C8E6C9", accent: "#388E3C", icon: "⚪" },
    "紫羅蘭 Violet": { primary: "#673AB7", secondary: "#9575CD", accent: "#512DA8", icon: "💜" },
    "梅花 Plum Blossom": { primary: "#E91E63", secondary: "#F48FB1", accent: "#C2185B", icon: "🌸" },
    "茶花 Camellia": { primary: "#D32F2F", secondary: "#EF5350", accent: "#B71C1C", icon: "🌹" },
    "康乃馨 Carnation": { primary: "#F06292", secondary: "#F8BBD0", accent: "#E91E63", icon: "💐" },
    "海棠 Begonia": { primary: "#FF5252", secondary: "#FF8A80", accent: "#D50000", icon: "🌺" },
    "桂花 Osmanthus": { primary: "#FF9800", secondary: "#FFB74D", accent: "#F57C00", icon: "🟡" },
    "紫藤 Wisteria": { primary: "#9C27B0", secondary: "#BA68C8", accent: "#7B1FA2", icon: "💜" },
    "水仙 Narcissus": { primary: "#FFEB3B", secondary: "#FFF59D", accent: "#F9A825", icon: "🌼" },
    "杜鵑 Azalea": { primary: "#E91E63", secondary: "#F06292", accent: "#C2185B", icon: "🌸" },
    "芙蓉 Hibiscus": { primary: "#FF5722", secondary: "#FF8A65", accent: "#E64A19", icon: "🌺" },
};

export const TRANSLATIONS: Record<'en' | 'zh_TW', TranslationSet> = {
    "en": {
        title: "Agentic AI Document Comparison System",
        subtitle: "Intelligent Document Analysis & Comparison AI Agent Platform",
        sidebar: {
            title: "Settings",
            theme: "Floral Theme",
            language: "Language",
            darkMode: "Dark Mode",
        },
        docInput: {
            title: "Document",
            uploadTab: "Upload File",
            pasteTab: "Paste Text",
            uploadInstructions: "Drag & drop or click to upload (PDF, TXT, MD, JSON)",
            ocrSection: "PDF Options",
            ocrPages: "Pages for OCR (e.g., 1, 3-5)",
            ocrModel: "OCR Model",
            runOcr: "Run OCR",
            ocrProcessing: "Processing OCR...",
            ocrResult: "OCR Result (Editable)",
        },
        agentEditor: {
            title: "Agent Configuration",
            agentCount: "Number of Agents to Use",
            agent: "Agent",
            name: "Name",
            description: "Description",
            systemPrompt: "System Prompt",
            model: "Model",
            temperature: "Temperature",
            maxTokens: "Max Tokens",
        },
        buttons: {
            startProcessing: "Start Processing",
            processing: "Processing...",
            startOver: "Start Over",
        },
        summary: {
            title: "Comprehensive Summary",
            keywords: "Keywords",
            highlight: "Highlight Keywords",
            addKeyword: "Add",
            keywordGraph: "Keyword Relationship Graph",
            noGraph: "Graph data could not be generated.",
            followUp: "Suggested Follow-up Questions",
        },
        steps: {
            input: "Input Docs",
            agents: "Configure Agents",
            summary: "View Summary",
        },
        loading: {
            agents: "Agents are processing...",
            agentsDesc: "The AI is analyzing and comparing the documents. This might take a moment."
        },
        error: {
            title: "Error",
            // Fix: Updated error message to remove API key requirement, as it's now handled by environment variables.
            docsAndApiKey: "Please provide content for both documents before processing.",
            agentExecution: "An error occurred during agent execution",
            summaryGeneration: "An error occurred while generating the summary",
            ocrError: "An error occurred during OCR",
        }
    },
    "zh_TW": {
        title: "AI 代理人文件比較系統",
        subtitle: "智慧化文件分析與比較 AI 代理人平台",
        sidebar: {
            title: "設定",
            theme: "花卉主題",
            language: "語言",
            darkMode: "深色模式",
        },
        docInput: {
            title: "文件",
            uploadTab: "上傳檔案",
            pasteTab: "貼上文字",
            uploadInstructions: "拖曳或點擊以上傳 (PDF, TXT, MD, JSON)",
            ocrSection: "PDF 選項",
            ocrPages: "OCR 頁碼 (例如: 1, 3-5)",
            ocrModel: "OCR 模型",
            runOcr: "執行 OCR",
            ocrProcessing: "OCR 處理中...",
            ocrResult: "OCR 結果 (可編輯)",
        },
        agentEditor: {
            title: "代理人設定",
            agentCount: "要使用的代理人數量",
            agent: "代理人",
            name: "名稱",
            description: "描述",
            systemPrompt: "系統提示",
            model: "模型",
            temperature: "溫度",
            maxTokens: "最大 Token 數",
        },
        buttons: {
            startProcessing: "開始處理",
            processing: "處理中...",
            startOver: "重新開始",
        },
        summary: {
            title: "綜合摘要",
            keywords: "關鍵字",
            highlight: "突顯關鍵字",
            addKeyword: "新增",
            keywordGraph: "關鍵字關聯圖",
            noGraph: "無法生成圖表數據。",
            followUp: "建議的後續問題",
        },
        steps: {
            input: "輸入文件",
            agents: "設定代理人",
            summary: "檢視摘要",
        },
        loading: {
            agents: "代理人處理中...",
            agentsDesc: "AI 正在分析與比較文件，請稍候。"
        },
        error: {
            title: "錯誤",
            // Fix: Updated error message to remove API key requirement, as it's now handled by environment variables.
            docsAndApiKey: "在處理前，請為兩個文件提供內容。",
            agentExecution: "代理人執行過程中發生錯誤",
            summaryGeneration: "生成摘要時發生錯誤",
            ocrError: "OCR 過程中發生錯誤",
        }
    }
};

export const DEFAULT_AGENTS: Agent[] = [
    {
        name: "Initial Summarizer",
        description: "Extracts key points and themes from each document individually.",
        system_prompt: "You are an expert analyst. Your task is to concisely summarize the key points, main arguments, and overall tone of each document provided. Do not compare them yet. Present the summaries separately under 'Summary of Document A' and 'Summary of Document B'.",
        model: "gemini-2.5-flash",
        temperature: 0.2,
        max_tokens: 1500,
    },
    {
        name: "Comparison Analyst",
        description: "Identifies key similarities and differences between the two documents.",
        system_prompt: "You are a meticulous comparison analyst. Based on the two documents, identify and list the main points of similarity and difference. Organize your output into two sections: 'Key Similarities' and 'Key Differences'. Be specific and cite examples where possible.",
        model: "gemini-2.5-flash",
        temperature: 0.3,
        max_tokens: 2000,
    },
    {
        name: "Contradiction Detector",
        description: "Pinpoints direct contradictions or conflicting information.",
        system_prompt: "You are a critical thinking expert specializing in logical fallacies and contradictions. Your sole purpose is to identify any direct contradictions, conflicting data, or opposing claims between Document A and Document B. If contradictions exist, list them clearly. If there are no contradictions, state 'No direct contradictions were found'.",
        model: "gemini-2.5-pro",
        temperature: 0.1,
        max_tokens: 1500,
    },
    {
        name: "Sentiment & Tone Analyzer",
        description: "Analyzes and compares the sentiment and underlying tone of the documents.",
        system_prompt: "As a communications expert, analyze the sentiment (positive, negative, neutral) and the underlying tone (e.g., formal, persuasive, critical, objective) of each document. Then, compare them. Is the tone similar or different? How does this affect the overall message? Present your analysis in a comparative table.",
        model: "gemini-2.5-flash",
        temperature: 0.5,
        max_tokens: 1000,
    },
    {
        name: "Synthesis & Conclusion Drafter",
        description: "Synthesizes the findings into a high-level conclusion.",
        system_prompt: "You are a senior strategist. Synthesize the findings from the previous analyses (summaries, comparisons, contradictions). What is the overall relationship between these two documents? Do they support, oppose, or complement each other? Provide a high-level conclusion about their combined implications.",
        model: "gemini-2.5-pro",
        temperature: 0.6,
        max_tokens: 2000,
    },
];

export const AVAILABLE_MODELS: string[] = ['gemini-2.5-flash', 'gemini-2.5-pro'];
