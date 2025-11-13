
import React from 'react';
import { Agent, Theme } from '../types';
import { Bot, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AgentExecutionViewProps {
    t: any;
    agents: Agent[];
    agentCount: number;
    agentOutputs: string[];
    currentlyExecutingAgentIndex: number | null;
    theme: Theme;
    error: string | null;
}

export const AgentExecutionView: React.FC<AgentExecutionViewProps> = ({ t, agents, agentCount, agentOutputs, currentlyExecutingAgentIndex, theme, error }) => {
    return (
        <div className="animate-fadeIn space-y-6">
            <h2 className="text-2xl font-bold text-[var(--accent)] flex items-center">
                <Bot className="mr-3" />
                {t.loading.agents}
            </h2>
            <p>{t.loading.agentsDesc}</p>
            
            {error && currentlyExecutingAgentIndex !== null && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg" role="alert">
                    <p className="font-bold">{t.error.title}</p>
                    <p>{error}</p>
                </div>
            )}

            <div className="space-y-4">
                {agents.slice(0, agentCount).map((agent, index) => {
                    const isExecuting = currentlyExecutingAgentIndex === index;
                    const isCompleted = agentOutputs[index] && agentOutputs[index] !== '';
                    const hasError = error && isExecuting;

                    let statusIcon;
                    if (hasError) {
                        statusIcon = <XCircle className="text-red-500" />;
                    } else if (isExecuting) {
                        statusIcon = <Loader2 className="animate-spin text-[var(--accent)]" />;
                    } else if (isCompleted) {
                        statusIcon = <CheckCircle2 className="text-green-500" />;
                    } else {
                        statusIcon = <div className="w-6 h-6 flex-shrink-0 rounded-full border-2 border-gray-400 dark:border-gray-500"></div>;
                    }

                    return (
                        <div key={index} className="p-4 rounded-lg shadow-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-lg flex items-center">
                                    <span className="mr-3">{statusIcon}</span>
                                    {index + 1}. {agent.name}
                                </h4>
                                <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full">{agent.model}</span>
                            </div>
                            {isCompleted && !hasError && (
                                <div className="mt-4 pl-9">
                                    <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md h-48 overflow-y-auto">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {agentOutputs[index]}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
             
             {currentlyExecutingAgentIndex === null && !error && agentOutputs[agentCount-1] && (
                 <div className="text-center p-8 rounded-lg bg-white/50 dark:bg-gray-800/50">
                     <Loader2 className="animate-spin text-[var(--accent)] mx-auto mb-2" />
                     <p>Finalizing summary and insights...</p>
                 </div>
             )}
        </div>
    );
};
