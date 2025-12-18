import React, { useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';

const DocxViewer = ({ file, className = "" }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!file || !containerRef.current) return;

        const renderDocx = async () => {
            try {
                // Clear previous content
                containerRef.current.innerHTML = '';
                
                // Render with standard options
                await renderAsync(file, containerRef.current, undefined, {
                    className: "docx-viewer", // default class
                    inWrapper: true, // enables render in wrapper
                    ignoreWidth: false,
                    ignoreHeight: false,
                    ignoreFonts: false,
                    breakPages: true,
                    ignoreLastRenderedPageBreak: true,
                    experimental: false,
                    trimXmlDeclaration: true,
                    useBase64URL: false,
                    useMathMLPolyfill: false,
                    showChanges: false,
                    debug: false,
                });
            } catch (error) {
                console.error("Failed to render docx:", error);
                if (containerRef.current) {
                    containerRef.current.innerHTML = `<div class="p-4 text-red-500">문서를 불러오는 중 오류가 발생했습니다.<br/>${error.message}</div>`;
                }
            }
        };

        renderDocx();
    }, [file]);

    return (
        <div 
            ref={containerRef} 
            className={`docx-container bg-white shadow-sm min-h-[500px] w-full mx-auto overflow-auto ${className}`}
        />
    );
};

export default DocxViewer;
