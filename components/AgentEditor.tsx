
import React from 'react';
import { Agent, LLMModel } from '../types';
import { Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { AVAILABLE_MODELS } from '../constants';

interface AgentEditorProps {
    t: any;
    agents: Agent[];
    onUpdateAgent: (index: number, updatedAgent: Agent) => void;
    agentCount: number;
    setAgentCount: (count: number) => void;
    theme: any;
}

interface AgentCardProps {
    agent: Agent;
    index: number;
    onUpdate: (index: number, updatedAgent: Agent) => void;
    t: any;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, index, onUpdate, t }) => {
    const [isOpen, setIsOpen] = React.useState(index === 0);

    const handleChange = (field: keyof Agent, value: any) => {
        onUpdate(index, { ...agent, [field]: value });
    };

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <div className="font-bold text-left">{index + 1}. {agent.name}</div>
                <div className="flex items-center">
                    <span className="text-xs mr-4 px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full">{agent.model}</span>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
            </button>
            {isOpen && (
                <div className="p-4 space-y-4">
                     <p className="text-sm text-gray-600 dark:text-gray-400">{agent.description}</p>
                    <div>
                        <label className="text-xs font-semibold">{t.agentEditor.systemPrompt}</label>
                        <textarea
                            value={agent.system_prompt}
                            onChange={(e) => handleChange('system_prompt', e.target.value)}
                            rows={4}
                            className="w-full p-2 mt-1 border rounded-md bg-transparent border-gray-300 dark:border-gray-600"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold">{t.agentEditor.model}</label>
                            <select
                                value={agent.model}
                                onChange={(e) => handleChange('model', e.target.value as LLMModel)}
                                className="w-full p-2 mt-1 border rounded-md bg-transparent border-gray-300 dark:border-gray-600"
                            >
                                {AVAILABLE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold">{t.agentEditor.temperature} ({agent.temperature})</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={agent.temperature}
                                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                                className="w-full mt-1 accent-[var(--accent)]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold">{t.agentEditor.maxTokens}</label>
                            <input
                                type="number"
                                value={agent.max_tokens}
                                onChange={(e) => handleChange('max_tokens', parseInt(e.target.value))}
                                className="w-full p-2 mt-1 border rounded-md bg-transparent border-gray-300 dark:border-gray-600"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export const AgentEditor: React.FC<AgentEditorProps> = ({ t, agents, onUpdateAgent, agentCount, setAgentCount, theme }) => {
    return (
        <div className="p-4 sm:p-6 rounded-lg shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm mt-8">
            <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center" style={{ color: theme.accent }}>
                <Bot className="mr-2" />
                {t.agentEditor.title}
            </h3>
            
            <div className="mb-6">
                <label className="font-semibold">{t.agentEditor.agentCount}: {agentCount}</label>
                <input
                    type="range"
                    min="1"
                    max={agents.length}
                    value={agentCount}
                    onChange={(e) => setAgentCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[var(--accent)]"
                />
            </div>
            
            <div className="space-y-4">
                {agents.slice(0, agentCount).map((agent, index) => (
                    <AgentCard key={index} agent={agent} index={index} onUpdate={onUpdateAgent} t={t} />
                ))}
            </div>
        </div>
    );
};
