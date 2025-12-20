import React, { useState, useEffect, useRef } from 'react';
import { getAllSchools, downloadDoc, getDocById } from '../services/api';
import jsPDF from 'jspdf';

const Preview = ({ data, onDownload }) => {
    const [previewFile, setPreviewFile] = useState(null); // ImageURL
    const [previewType] = useState('image'); // Hardcode to image
    const [templateVars, setTemplateVars] = useState([]); // For image template
    const [loading, setLoading] = useState(false);

    // Canvas Ref for Image Generation
    const canvasRef = useRef(null);

    // Auto-generate preview on mount
    useEffect(() => {
        if (data.school && data.template) {
            handleGeneratePreview();
        }
    }, []);

    const handleGeneratePreview = async () => {
        if (!data.school || !data.template) {
            return; // Don't alert on auto-mount if not selected
        }

        try {
            setLoading(true);

            // 1. 템플릿 정보 및 파일 가져오기
            const templateInfo = await getDocById(data.template);
            const templateBlob = await downloadDoc(data.template);

            // 이미지 템플릿 처리
            const imageUrl = URL.createObjectURL(templateBlob);
            setPreviewFile(imageUrl);

            // 변수 매핑 (JSON 파싱)
            let vars = [];
            try {
                vars = templateInfo.variables || [];
                if (typeof vars === 'string') vars = JSON.parse(vars);
            } catch (e) {
                console.error('Variables parsing error', e);
            }
            setTemplateVars(vars);

        } catch (error) {
            console.error('미리보기 생성 실패:', error);
            alert('미리보기 생성 실패: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // 이미지 템플릿 렌더링 (Canvas)
    useEffect(() => {
        if (previewFile && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = previewFile;

            img.onload = async () => {
                // 캔버스 크기를 이미지에 맞춤
                canvas.width = img.width;
                canvas.height = img.height;

                // 배경 그리기
                ctx.drawImage(img, 0, 0);

                // 데이터 매핑 준비
                const { convertToTemplateVariables } = await import('../utils/documentGenerator');
                const schools = await getAllSchools();
                const school = schools.find(s => s.id === data.school);

                // Use first student even if name is empty for preview
                const student = data.students[0];
                const variablesData = convertToTemplateVariables(data, student, school?.name || '');

                // 텍스트 및 서명 그리기
                if (Array.isArray(templateVars)) {
                    for (const v of templateVars) {
                        let text = variablesData[v.key] || '';
                        if (!text) continue;

                        if (v.key === 'ts') {
                            // 서명 이미지 처리
                            const sigImg = new Image();
                            sigImg.src = text;
                            await new Promise((resolve) => {
                                sigImg.onload = resolve;
                                sigImg.onerror = resolve;
                            });

                            if (sigImg.complete && sigImg.naturalWidth > 0) {
                                // 서명 크기 결정 (폰트 크기에 비례하여 적절히 조절)
                                const sigHeight = (v.fontSize || 16) * 3;
                                const sigWidth = sigHeight * (sigImg.width / sigImg.height);
                                ctx.drawImage(sigImg, v.x * canvas.width, v.y * canvas.height, sigWidth, sigHeight);
                            }
                        } else {
                            // 일반 텍스트 처리
                            ctx.font = `bold ${v.fontSize || 16}px "Malgun Gothic", sans-serif`;
                            ctx.fillStyle = v.color || '#000';
                            ctx.fillText(text, v.x * canvas.width, v.y * canvas.height + (v.fontSize || 16));
                        }
                    }
                }
            };
        }
    }, [previewFile, templateVars, data]);

    const validStudents = data.students.filter(s => s.name && s.name.trim() !== '');
    const studentCount = validStudents.length;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">문서 미리보기</h3>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                        {studentCount}명 대상 (총 {data.students.length}명)
                    </span>
                    <button
                        onClick={handleGeneratePreview}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="새로고침"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl flex-1 overflow-hidden min-h-[600px] relative">
                {loading && !previewFile ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-slate-500 text-sm">미리보기를 생성하고 있습니다...</p>
                    </div>
                ) : previewFile ? (
                    <div className="h-full overflow-y-auto p-4 custom-scrollbar flex justify-center bg-slate-500">
                        <canvas ref={canvasRef} className="max-w-full shadow-lg bg-white" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">학교와 양식을 선택해주세요</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-sm">
                            문서 작성을 완료한 후 학교와 양식을 선택하면<br />이곳에 미리보기가 자동으로 표시됩니다.
                        </p>
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-6">
                <button
                    onClick={async () => {
                        if (!canvasRef.current || !previewFile) {
                            alert('미리보기가 생성되지 않았습니다.');
                            return;
                        }
                        try {
                            const canvas = canvasRef.current;
                            const imgData = canvas.toDataURL('image/png');
                            const pdf = new jsPDF({
                                orientation: canvas.width > canvas.height ? 'l' : 'p',
                                unit: 'px',
                                format: [canvas.width, canvas.height]
                            });
                            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                            pdf.save(`${data.students[0]?.name || 'document'}.pdf`);
                        } catch (err) {
                            console.error(err);
                            alert('PDF 저장 실패');
                        }
                    }}
                    disabled={!previewFile}
                    className={`px-8 font-bold py-3 rounded-xl shadow-md transition-all flex items-center gap-2 ${!previewFile
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    다운로드 (PDF)
                </button>
            </div>
        </div>
    );
};

export default Preview;
