
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BrainCircuit, Tags, Share2 } from 'lucide-react';
import { WordGraph } from './WordGraph';
import { GraphData } from '../types';

interface SummaryViewProps {
    t: any;
    summary: string;
    keywords: string[];
    graphData: GraphData | null;
    theme: any;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ t, summary, keywords, theme, graphData }) => {
    return (
        <div className="p-4 sm:p-6 rounded-lg shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center" style={{ color: theme.accent }}>
                <BrainCircuit className="mr-2" />
                {t.summary.title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md h-[600px] overflow-y-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {summary}
                        </ReactMarkdown>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center"><Tags className="mr-2" />{t.summary.keywords}</h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {keywords.map((kw, i) => (
                                <span key={i} className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: `${theme.primary}40`, color: theme.accent }}>{kw}</span>
                            ))}
                        </div>
                    </div>

                    <div>
                         <h4 className="font-semibold mb-2 flex items-center"><Share2 className="mr-2" />{t.summary.keywordGraph}</h4>
                         <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                            {graphData && graphData.nodes && graphData.nodes.length > 0 ? (
                                <WordGraph graphData={graphData} theme={theme} />
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">{t.summary.noGraph}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
