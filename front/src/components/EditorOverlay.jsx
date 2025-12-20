import React from 'react';
import ImageTemplateEditor from './ImageTemplateEditor';

const EditorOverlay = ({ file, onSave, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full h-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">템플릿 편집기</h2>
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-700">✕</button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <ImageTemplateEditor file={file} onSave={onSave} onCancel={onCancel} />
                </div>
            </div>
        </div>
    );
};

export default EditorOverlay;
