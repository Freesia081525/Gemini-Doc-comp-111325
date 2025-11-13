import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Wand, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
    file: File;
    pagePattern: string;
    onOcrRequest: (images: { pageNumber: number, data: string }[]) => void;
    t: any;
    theme: any;
    isOcrLoading: boolean;
}

const parsePagePattern = (pattern: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    if (!pattern) return [];
    
    const parts = pattern.split(',').map(p => p.trim());
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    if (i > 0 && i <= maxPages) pages.add(i);
                }
            }
        } else {
            const pageNum = Number(part);
            if (!isNaN(pageNum) && pageNum > 0 && pageNum <= maxPages) {
                pages.add(pageNum);
            }
        }
    }
    return Array.from(pages).sort((a, b) => a - b);
};

export const PdfViewer: React.FC<PdfViewerProps> = ({ file, pagePattern, onOcrRequest, t, theme, isOcrLoading }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setCurrentPage(1);
    };

    const handleOcr = async () => {
        if (!numPages || !file) return;
        const pagesToOcr = parsePagePattern(pagePattern, numPages);
        if (pagesToOcr.length === 0) {
            alert("No valid pages selected for OCR.");
            return;
        }

        const images: { pageNumber: number, data: string }[] = [];
        try {
            const loadingTask = pdfjs.getDocument(URL.createObjectURL(file));
            const pdf = await loadingTask.promise;
        
            for (const pageNum of pagesToOcr) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // FIX: Add canvas to render parameters to satisfy TypeScript types for page.render.
                // The RenderParameters type seems to require the 'canvas' property.
                await page.render({ canvasContext: context, viewport, canvas }).promise;
                images.push({ pageNumber: pageNum, data: canvas.toDataURL('image/png') });
            }
            onOcrRequest(images);
        } catch (error) {
            console.error('Error rendering PDF for OCR:', error);
            alert('Failed to prepare PDF pages for OCR.');
        }
    };

    const pagesForOcr = numPages ? parsePagePattern(pagePattern, numPages) : [];

    return (
        <div className="space-y-4">
            <div className="relative w-full border rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-900">
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page 
                      key={`page_${currentPage}`}
                      pageNumber={currentPage}
                      renderTextLayer={false}
                    />
                </Document>
            </div>
             {numPages && (
                 <div className="flex justify-between items-center">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"><ChevronLeft/></button>
                    <span>Page {currentPage} of {numPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"><ChevronRight/></button>
                </div>
            )}
            <button
                onClick={handleOcr}
                disabled={isOcrLoading || pagesForOcr.length === 0}
                className="w-full mt-2 px-4 py-2 bg-[var(--accent)] text-white font-bold rounded-lg shadow-md hover:opacity-80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
            >
                {isOcrLoading ? (
                    <Loader2 className="animate-spin mr-2" />
                ) : (
                    <Wand className="mr-2" />
                )}
                {isOcrLoading ? t.docInput.ocrProcessing : `${t.docInput.runOcr} (${pagesForOcr.length} pages)`}
            </button>
        </div>
    );
};