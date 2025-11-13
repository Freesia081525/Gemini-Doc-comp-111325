
import { GoogleGenAI, Type as GenAiType } from '@google/genai';
import { Agent, GraphData } from '../types';

export const runOcrOnImage = async (ai: GoogleGenAI, imageDataBase64: string): Promise<string> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: imageDataBase64,
    },
  };
  const textPart = {
    text: "Perform OCR on this image. Extract all text accurately, preserving the original line breaks and structure as much as possible. Do not describe the image, only return the transcribed text."
  };
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    return response.text;
  } catch (error) {
    console.error("Error performing OCR:", error);
    throw new Error("Failed to perform OCR with Gemini API.");
  }
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

export const generateKeywordGraph = async (ai: GoogleGenAI, keywords: string[], summary: string): Promise<GraphData> => {
    if (keywords.length < 2) {
        return { nodes: keywords.map(kw => ({ id: kw })), links: [] };
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following summary and list of keywords, identify the top 5-10 most significant relationships between the keywords. A relationship exists if two keywords are strongly connected in the context of the summary.

            Return ONLY a valid JSON object with two keys: "nodes" and "links".
            - "nodes" must be an array of objects, each with an "id" property for a keyword from the provided list. Include all keywords in the nodes array.
            - "links" must be an array of objects, each with "source" and "target" properties, representing a relationship between two keyword IDs.

            Example format:
            {
              "nodes": [{"id": "keyword1"}, {"id": "keyword2"}],
              "links": [{"source": "keyword1", "target": "keyword2"}]
            }

            Summary:
            ${summary.substring(0, 4000)}

            Keywords:
            [${keywords.join(', ')}]`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: GenAiType.OBJECT,
                    properties: {
                        nodes: {
                            type: GenAiType.ARRAY,
                            items: {
                                type: GenAiType.OBJECT,
                                properties: {
                                    id: { type: GenAiType.STRING }
                                },
                                required: ['id']
                            }
                        },
                        links: {
                            type: GenAiType.ARRAY,
                            items: {
                                type: GenAiType.OBJECT,
                                properties: {
                                    source: { type: GenAiType.STRING },
                                    target: { type: GenAiType.STRING }
                                },
                                required: ['source', 'target']
                            }
                        }
                    },
                     required: ['nodes', 'links']
                }
            }
        });
        
        const jsonString = response.text.trim();
        const graphData = JSON.parse(jsonString);
        
        if (graphData && Array.isArray(graphData.nodes) && Array.isArray(graphData.links)) {
            // Ensure all original keywords are present as nodes
            const nodeIds = new Set(graphData.nodes.map((n: {id: string}) => n.id));
            const missingNodes = keywords.filter(kw => !nodeIds.has(kw)).map(kw => ({ id: kw }));
            graphData.nodes.push(...missingNodes);
            return graphData;
        }
         // Fallback if parsing fails or structure is wrong
        return { nodes: keywords.map(kw => ({ id: kw })), links: [] };
    } catch (e) {
        console.error("Failed to parse keyword graph data:", e);
        // Fallback if API call fails
        return { nodes: keywords.map(kw => ({ id: kw })), links: [] };
    }
};
