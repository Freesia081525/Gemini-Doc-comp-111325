
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Fix: Use process.env.API_KEY directly as per guidelines
import { GoogleGenAI } from '@google/genai';
import { FLOWER_THEMES, TRANSLATIONS, DEFAULT_AGENTS } from './constants';
import { Language, Theme, ThemeKey, Agent, DocumentState } from './types';
import { Sidebar } from './components/Sidebar';
import { DocumentInput } from './components/DocumentInput';
import { AgentEditor } from './components/AgentEditor';
import { SummaryView } from './components/SummaryView';
import { generateSummaryAndKeywords, generateFollowUpQuestions, runAgentExecution } from './services/geminiService';
import { BookOpen, Bot, BrainCircuit, ChevronRight, FileText } from 'lucide-react';

const App: React.FC = () => {
    const [theme, setTheme] = useState<ThemeKey>('櫻花 Cherry Blossom');
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [language, setLanguage] = useState<Language>('en');
    
    const [doc1, setDoc1] = useState<DocumentState>({ id: 1, content: '', file: null, type: 'text' });
    const [doc2, setDoc2] = useState<DocumentState>({ id: 2, content: '', file: null, type: 'text' });
    const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
    const [agentCount, setAgentCount] = useState<number>(3);
    const [agentOutputs, setAgentOutputs] = useState<string[]>(Array(DEFAULT_AGENTS.length).fill(''));
    
    const [summary, setSummary] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const t = TRANSLATIONS[language];
    const currentTheme: Theme = FLOWER_THEMES[theme];

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
    
    // Fix: Removed API key from readiness check as it's now handled via environment variables.
    const isReadyForProcessing = useMemo(() => {
        const d1 = doc1.content;
        const d2 = doc2.content;
        return d1.trim().length > 0 && d2.trim().length > 0;
    }, [doc1, doc2]);


    const handleAgentExecution = useCallback(async () => {
        if (!isReadyForProcessing) {
            setError(t.error.docsAndApiKey);
            return;
        }
        setIsLoading(true);
        setError(null);
        setCurrentStep(1); // Move to agent processing view

        // Fix: Initialize GoogleGenAI with process.env.API_KEY as per guidelines. Added non-null assertion assuming it's set.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const doc1Text = doc1.content;
        const doc2Text = doc2.content;
        
        try {
            const outputs = await runAgentExecution(ai, agents.slice(0, agentCount), doc1Text, doc2Text);
            setAgentOutputs(currentOutputs => {
                const newOutputs = [...currentOutputs];
                outputs.forEach((output, i) => newOutputs[i] = output);
                return newOutputs;
            });
            
            const lastOutput = outputs[outputs.length - 1];
            if(lastOutput) {
                 const { summary, keywords } = await generateSummaryAndKeywords(ai, lastOutput, doc1Text, doc2Text);
                 setSummary(summary);
                 setKeywords(keywords);

                 const questions = await generateFollowUpQuestions(ai, summary);
                 setFollowUpQuestions(questions);
                 setCurrentStep(2); // Move to summary view
            }
        } catch (e: any) {
            setError(`${t.error.agentExecution}: ${e.message}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [agents, agentCount, doc1, doc2, isReadyForProcessing, t.error.docsAndApiKey, t.error.agentExecution]);


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
                    
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
                            <p className="font-bold">{t.error.title}</p>
                            <p>{error}</p>
                        </div>
                    )}

                     <div className="w-full mb-8">
                        <div className="flex justify-between items-center">
                            {STEPS.map((step, index) => (
                                <React.Fragment key={step}>
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${index <= currentStep ? 'bg-[var(--accent)] text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                            {index === 0 && <FileText size={20}/>}
                                            {index === 1 && <Bot size={20}/>}
                                            {index === 2 && <BrainCircuit size={20}/>}
                                        </div>
                                        <span className={`ml-2 text-xs sm:text-sm font-medium ${index <= currentStep ? 'text-[var(--accent)]' : 'text-gray-500'}`}>{step}</span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-700 mx-2 sm:mx-4 relative">
                                            <div className="absolute top-0 left-0 h-1 bg-[var(--accent)] transition-all duration-500" style={{width: currentStep > index ? '100%' : '0%'}}></div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>


                    {currentStep === 0 && (
                         <div className="animate-fadeIn">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                                <DocumentInput t={t} docState={doc1} setDocState={setDoc1} theme={currentTheme}/>
                                <DocumentInput t={t} docState={doc2} setDocState={setDoc2} theme={currentTheme}/>
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
                    
                    {currentStep === 1 && isLoading && (
                        <div className="animate-fadeIn text-center p-8 rounded-lg shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                            <div className="flex justify-center items-center mb-4">
                               <Bot size={48} className="text-[var(--accent)] animate-bounce" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--accent)]">{t.loading.agents}</h2>
                            <p className="mt-2">{t.loading.agentsDesc}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
                               <div className="bg-[var(--accent)] h-2.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && !isLoading && (
                        <div className="animate-fadeIn space-y-8">
                            <SummaryView
                                t={t}
                                summary={summary}
                                keywords={keywords}
                                theme={currentTheme}
                            />

                            <div className="grid grid-cols-1 gap-8">
                                <div className="p-6 rounded-lg shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                    <h3 className="text-xl font-bold mb-4 text-[var(--accent)] flex items-center"><BookOpen className="mr-2"/>{t.summary.followUp}</h3>
                                    <ul className="space-y-2 list-disc list-inside">
                                    {followUpQuestions.map((q, i) => <li key={i}>{q}</li>)}
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={resetState}
                                    className="px-8 py-3 bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:bg-gray-600 transition-colors"
                                >
                                    {t.buttons.startOver}
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
