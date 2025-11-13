
import React, { useState } from 'react';
import { DocumentState } from '../types';
import { FileUp, ClipboardPaste } from 'lucide-react';
import { PdfViewer } from './PdfViewer';
import { runOcrOnImage } from '../services/geminiService';
import { GoogleGenAI } from '@google/genai';

interface DocumentInputProps {
    t: any;
    docState: DocumentState;
    setDocState: React.Dispatch<React.SetStateAction<DocumentState>>;
    theme: any;
    ai: GoogleGenAI | null;
}

export const DocumentInput: React.FC<DocumentInputProps> = ({ t, docState, setDocState, theme, ai }) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
    const [dragActive, setDragActive] = useState(false);
    
    // State for OCR
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [pagePattern, setPagePattern] = useState('1');

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            const fileType = file.name.split('.').pop()?.toLowerCase();
            
            let docType;
            switch(fileType) {
                case 'json': docType = 'json'; break;
                case 'md': docType = 'md'; break;
                case 'pdf': docType = 'pdf'; break;
                default: docType = 'text';
            }

            if (docType === 'pdf') {
                setDocState(prev => ({ ...prev, file, type: 'pdf', content: '' }));
                return;
            }
            
            setDocState(prev => ({ ...prev, file, type: docType, content: '' }));

            const reader = new FileReader();
            reader.onload = (e) => {
                setDocState(prev => ({ ...prev, content: e.target?.result as string }));
            };
            reader.readAsText(file);
        }
    };

    const handleOcrRequest = async (images: { pageNumber: number, data: string }[]) => {
        if (!ai) {
            alert("AI client is not initialized.");
            return;
        }

        setIsOcrLoading(true);
        let fullText = '';
        try {
            const ocrPromises = images.map(async (image) => {
                const base64Data = image.data.split(',')[1];
                if (!base64Data) return { pageNumber: image.pageNumber, text: `// Error: Could not process page ${image.pageNumber} //` };
                const ocrText = await runOcrOnImage(ai, base64Data);
                return { pageNumber: image.pageNumber, text: ocrText };
            });

            const results = await Promise.all(ocrPromises);
            results.sort((a, b) => a.pageNumber - b.pageNumber);
            fullText = results.map(r => `--- Page ${r.pageNumber} ---\n\n${r.text}`).join('\n\n');
            
            setDocState(prev => ({ ...prev, content: fullText }));
            setActiveTab('paste'); // Switch to the text view
        } catch (error) {
            console.error("OCR failed", error);
            alert(`${t.error.ocrError}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setDocState(prev => ({ ...prev, content: 'OCR processing failed.' }));
        } finally {
            setIsOcrLoading(false);
        }
    };
    
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files);
        }
    };

    return (
        <div className="p-4 sm:p-6 rounded-lg shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm h-full flex flex-col">
            <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: theme.accent }}>
                {t.docInput.title} {docState.id}
            </h3>
            <div className="flex border-b border-gray-300 dark:border-gray-600 mb-4">
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'upload' ? 'border-b-2 text-[var(--accent)] border-[var(--accent)]' : 'text-gray-500'}`}
                >
                    <FileUp size={16} className="mr-2"/>{t.docInput.uploadTab}
                </button>
                <button
                    onClick={() => setActiveTab('paste')}
                    className={`px-4 py-2 text-sm font-medium flex items-center ${activeTab === 'paste' ? 'border-b-2 text-[var(--accent)] border-[var(--accent)]' : 'text-gray-500'}`}
                >
                    <ClipboardPaste size={16} className="mr-2"/>{t.docInput.pasteTab}
                </button>
            </div>

            {activeTab === 'upload' && (
                <div onDragEnter={handleDrag} className="flex-grow flex flex-col">
                    {docState.type === 'pdf' && docState.file && !docState.content ? (
                         <div className="animate-fadeIn space-y-4">
                            <div>
                                <label htmlFor={`page-pattern-${docState.id}`} className="text-sm font-semibold">{t.docInput.ocrPages}</label>
                                <input 
                                    id={`page-pattern-${docState.id}`}
                                    type="text"
                                    value={pagePattern} 
                                    onChange={e => setPagePattern(e.target.value)} 
                                    className="w-full p-2 mt-1 border rounded-md bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-[var(--accent)]"
                                    placeholder="e.g., 1, 3-5"
                                />
                            </div>
                            <PdfViewer 
                                file={docState.file}
                                pagePattern={pagePattern}
                                onOcrRequest={handleOcrRequest}
                                t={t}
                                theme={theme}
                                isOcrLoading={isOcrLoading}
                            />
                        </div>
                    ) : (
                        <>
                            <label onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} htmlFor={`dropzone-file-${docState.id}`} className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? 'border-[var(--accent)] bg-gray-100 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileUp className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center">{t.docInput.uploadInstructions}</p>
                                </div>
                                <input id={`dropzone-file-${docState.id}`} type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files)} accept=".txt,.md,.json,.pdf" />
                            </label>
                            {docState.file && <p className="mt-2 text-sm truncate">Selected: {docState.file.name}</p>}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'paste' && (
                <textarea
                    placeholder="..."
                    value={docState.content}
                    onChange={(e) => setDocState({ ...docState, content: e.target.value, file: null, type: 'text' })}
                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] flex-grow"
                    style={{minHeight: '12rem'}}
                />
            )}
        </div>
    );
};
