
import { GoogleGenAI, Type as GenAiType } from '@google/genai';
import { Agent } from '../types';

export const runAgentExecution = async (ai: GoogleGenAI, agents: Agent[], doc1Text: string, doc2Text: string): Promise<string[]> => {
    let currentInput = `Document A:\n---\n${doc1Text}\n---\n\nDocument B:\n---\n${doc2Text}\n---`;
    const outputs: string[] = [];

    for (const agent of agents) {
        const fullPrompt = `${agent.system_prompt}\n\nTask:\n${currentInput}`;
        
        // Fix: Add thinkingConfig for flash models when maxOutputTokens is set to prevent token exhaustion.
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
        outputs.push(outputText);
        // The output of the current agent becomes part of the input for the next agent
        currentInput += `\n\n--- Analysis from ${agent.name} ---\n${outputText}`;
    }

    return outputs;
};

export const generateSummaryAndKeywords = async (ai: GoogleGenAI, finalAgentOutput: string, doc1Text: string, doc2Text: string): Promise<{ summary: string; keywords: string[] }> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Based on the following analysis of two documents, perform two tasks:
        1.  Write a comprehensive, well-structured summary of the entire analysis in Markdown format.
        2.  Extract the top 20 most relevant keywords from the analysis.

        Return the response as a single JSON object with the following structure: { "summary": "...", "keywords": ["...", "..."] }.

        Original Document A:
        ${doc1Text.substring(0, 2000)}...

        Original Document B:
        ${doc2Text.substring(0, 2000)}...

        Agent Analysis:
        ${finalAgentOutput}`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: GenAiType.OBJECT,
                properties: {
                    summary: { type: GenAiType.STRING },
                    keywords: {
                        type: GenAiType.ARRAY,
                        items: { type: GenAiType.STRING }
                    },
                }
            }
        }
    });

    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);

    return {
        summary: parsed.summary,
        keywords: parsed.keywords,
    };
};

export const generateFollowUpQuestions = async (ai: GoogleGenAI, summary: string): Promise<string[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the following summary of a document comparison, generate 3-5 insightful follow-up questions that a user might have. These questions should prompt deeper investigation or clarification. Return only a simple JSON array of strings.

        Summary:
        ${summary}`,
        // Fix: Enforce JSON output with responseMimeType and responseSchema for more reliable parsing.
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: GenAiType.ARRAY,
                items: { type: GenAiType.STRING }
            }
        }
    });

    try {
        // Fix: Trim the response and parse directly. The markdown/json cleaning is no longer needed with responseMimeType.
        const text = response.text.trim();
        const questions = JSON.parse(text);
        return Array.isArray(questions) ? questions : [];
    } catch (e) {
        console.error("Failed to parse follow-up questions:", e);
        // Fallback to splitting by newline if JSON parsing fails
        return response.text.split('\n').map(q => q.replace(/^- /, '')).filter(Boolean);
    }
};
