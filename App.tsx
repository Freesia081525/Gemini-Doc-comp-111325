import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FLOWER_THEMES, TRANSLATIONS, DEFAULT_AGENTS } from './constants';
// CHANGE: Import your new types
import { Language, Theme, ThemeKey, Agent, DocumentState, GraphData, LLMModel } from './types'; 
import { Sidebar } from './components/Sidebar';
import { DocumentInput } from './components/DocumentInput';
import { AgentEditor } from './components/AgentEditor';
import { SummaryView } from './components/SummaryView';
import { generateSummaryAndKeywords, generateFollowUpQuestions, generateKeywordGraph } from './services/geminiService';
import { BookOpen, Bot, BrainCircuit, ChevronRight, FileText, KeyRound, WandSparkles } from 'lucide-react';
import { AgentExecutionView } from './components/AgentExecutionView';

const App: React.FC = () => {
    const [theme, setTheme] = useState<ThemeKey>('櫻花 Cherry Blossom');
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [language, setLanguage] = useState<Language>('en');
    
    const [apiKey, setApiKey] = useState<string>('');
    // CHANGE: Use the LLMModel type for selectedModel state
    const [selectedModel, setSelectedModel] = useState<LLMModel>('gemini-2.5-flash');

    const [doc1, setDoc1] = useState<DocumentState>({ id: 1, content: '', file: null, type: 'text' });
    const [doc2, setDoc2] = useState<DocumentState>({ id: 2, content: '', file: null, type: 'text' });
    const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
    const [agentCount, setAgentCount] = useState<number>(3);
    const [agentOutputs, setAgentOutputs] = useState<string[]>(Array(DEFAULT_AGENTS.length).fill(''));
    
    const [summary, setSummary] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [graphData, setGraphData] = useState<GraphData | null>(null);
    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [currentlyExecutingAgentIndex, setCurrentlyExecutingAgentIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const t = TRANSLATIONS[language];
    const currentTheme: Theme = FLOWER_THEMES[theme];
    
    const ai = useMemo(() => {
        const effectiveApiKey = apiKey || (typeof process !== 'undefined' && process.env.API_KEY);
        if (!effectiveApiKey) {
            return null;
        }
        try {
             return new GoogleGenAI({ apiKey: effectiveApiKey });
        } catch(e: any) {
            console.error("Error initializing GoogleGenAI client:", e);
            setError(`Failed to initialize AI client. Please check the API key format. Details: ${e.message}`);
            return null;
        }
    }, [apiKey]);

    // This effect now works correctly because the types match
    useEffect(() => {
        setAgents(prevAgents =>
            prevAgents.map(agent => ({ ...agent, model: selectedModel }))
        );
    }, [selectedModel]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        root.style.setProperty('--primary', currentTheme.primary);
        root.style.setProperty('--secondary', currentTheme.secondary);
        root.style.setProperty('--accent', currentTheme.accent);
    }, [theme, darkMode, currentTheme]);
    
    const isReadyForProcessing = useMemo(() => {
        const d1 = doc1.content;
        const d2 = doc2.content;
        return d1.trim().length > 0 && d2.trim().length > 0 && !!ai;
    }, [doc1, doc2, ai]);

    const handleAgentExecution = useCallback(async () => {
        if (!isReadyForProcessing) {
            setError(t.error.docsAndApiKey);
            return;
        }
        if (!ai) {
             setError("GoogleGenAI client could not be initialized. Please provide a valid API Key.");
             return;
        }

        setIsLoading(true);
        setError(null);
        setCurrentStep(1);
        setAgentOutputs(Array(agentCount).fill(''));
        setCurrentlyExecutingAgentIndex(0);

        const doc1Text = doc1.content;
        const doc2Text = doc2.content;
        
        let currentInput = `Document A:\n---\n${doc1Text}\n---\n\nDocument B:\n---\n${doc2Text}\n---`;
        let finalAgentOutput = '';

        try {
            for (let i = 0; i < agentCount; i++) {
                setCurrentlyExecutingAgentIndex(i);
                const agent = agents[i];
                
                const fullPrompt = `${agent.system_prompt}\n\nTask:\n${currentInput}`;
                const config: any = {
                    temperature: agent.temperature,
                    maxOutputTokens: agent.max_tokens,
                };
                if (agent.model.includes('gemini-2.5-flash')) {
                    config.thinkingConfig = { thinkingBudget: Math.max(1, Math.floor(agent.max_tokens / 4)) };
                }
                
                const response = await ai.models.generateContent({
                    model: agent.model,
                    contents: fullPrompt,
                    config,
                });
                const outputText = response.text;
                
                setAgentOutputs(currentOutputs => {
                    const newOutputs = [...currentOutputs];
                    newOutputs[i] = outputText;
                    return newOutputs;
                });
                
                currentInput += `\n\n--- Analysis from ${agent.name} ---\n${outputText}`;
                finalAgentOutput = outputText;
            }
            
            setCurrentlyExecutingAgentIndex(null);
            await new Promise(resolve => setTimeout(resolve, 500));

            if(finalAgentOutput) {
                 const { summary, keywords } = await generateSummaryAndKeywords(ai, finalAgentOutput, doc1Text, doc2Text);
                 setSummary(summary);
                 setKeywords(keywords);
                 
                 if (keywords.length > 0) {
                    const graph = await generateKeywordGraph(ai, keywords, summary);
                    setGraphData(graph);
                 }

                 const questions = await generateFollowUpQuestions(ai, summary);
                 setFollowUpQuestions(questions);
                 setCurrentStep(2);
            }
        } catch (e: any) {
            setError(`${t.error.agentExecution}: ${e.message}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [ai, agents, agentCount, doc1, doc2, isReadyForProcessing, t]);

    const handleUpdateAgent = (index: number, updatedAgent: Agent) => {
        const newAgents = [...agents];
        newAgents[index] = updatedAgent;
        setAgents(newAgents);
    };

    const resetState = () => {
        setDoc1({ id: 1, content: '', file: null, type: 'text' });
        setDoc2({ id: 2, content: '', file: null, type: 'text' });
        setAgents(DEFAULT_AGENTS);
        setAgentCount(3);
        setAgentOutputs(Array(DEFAULT_AGENTS.length).fill(''));
        setSummary('');
        setKeywords([]);
        setGraphData(null);
        setFollowUpQuestions([]);
        setCurrentStep(0);
        setError(null);
    };

    const STEPS = [t.steps.input, t.steps.agents, t.steps.summary];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 ${darkMode ? 'dark bg-gray-900 text-text-dark' : 'bg-gray-50 text-text-light'}`}>
            <Sidebar 
                theme={theme}
                setTheme={setTheme}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                language={language}
                setLanguage={setLanguage}
                t={t}
                currentTheme={currentTheme}
            />

            <main className="pl-0 md:pl-64 transition-all duration-300">
                <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: currentTheme.accent }}>
                           {currentTheme.icon} {t.title}
                        </h1>
                        <p className="text-base sm:text-lg mt-2 opacity-80">{t.subtitle}</p>
                    </header>
                    
                    {error && currentStep !== 1 && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
                            <p className="font-bold">{t.error.title}</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm shadow-md">
                        <div className="flex flex-col">
                           <label htmlFor="apiKey" className="mb-2 font-semibold text-sm flex items-center"><KeyRound className="mr-2 h-4 w-4"/>{t.settings.apiKey}</label>
                            <input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={t.settings.apiKeyPlaceholder}
                                className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-[var(--accent)]"
                            />
                        </div>
                         <div className="flex flex-col">
                           <label htmlFor="model" className="mb-2 font-semibold text-sm flex items-center"><WandSparkles className="mr-2 h-4 w-4"/>{t.settings.model}</label>
                            <select
                                id="model"
                                value={selectedModel}
                                // CHANGE: Cast the value to LLMModel on change
                                onChange={(e) => setSelectedModel(e.target.value as LLMModel)}
                                className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-[var(--accent)]"
                            >
                                <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                                <option value="gpt-4o-mini">gpt-4o-mini</option>
                            </select>
                        </div>
                    </div>

                     <div className="w-full mb-8">
                        {/* Stepper UI remains the same */}
                     </div>

                    {currentStep === 0 && (
                         <div className="animate-fadeIn">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                                {/* The 'selectedModel' prop will no longer cause an error */}
                                <DocumentInput t={t} docState={doc1} setDocState={setDoc1} theme={currentTheme} ai={ai} selectedModel={selectedModel} />
                                <DocumentInput t={t} docState={doc2} setDocState={setDoc2} theme={currentTheme} ai={ai} selectedModel={selectedModel} />
                            </div>
                             <AgentEditor t={t} agents={agents} onUpdateAgent={handleUpdateAgent} agentCount={agentCount} setAgentCount={setAgentCount} theme={currentTheme}/>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleAgentExecution}
                                    disabled={!isReadyForProcessing || isLoading}
                                    className="px-8 py-3 bg-[var(--accent)] text-white font-bold rounded-lg shadow-lg hover:opacity-80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center group"
                                >
                                    {isLoading ? t.buttons.processing : t.buttons.startProcessing}
                                    {!isLoading && <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* The rest of the component remains the same */}
                </div>
            </main>
        </div>
    );
};

export default App;
