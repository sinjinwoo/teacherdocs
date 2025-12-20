import React, { useState, useRef, useEffect } from 'react';
import { VARIABLE_META } from '../utils/variableMapping';

const generateId = () => Math.random().toString(36).substr(2, 9);

const ImageTemplateEditor = ({ file, onSave, onCancel }) => {
    const containerRef = useRef(null);
    const [image, setImage] = useState(null);
    const [scale, setScale] = useState(1);
    const [variables, setVariables] = useState([]);
    const [selectedVar, setSelectedVar] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // 드래그 상태
    const dragItem = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    // 사용 가능한 변수 목록 생성
    const variableOptions = Object.entries(VARIABLE_META).map(([key, meta]) => ({
        key,
        ...meta
    }));

    // 이미지 로드
    useEffect(() => {
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            setImage(img);
        };

        return () => URL.revokeObjectURL(img.src);
    }, [file]);

    // 캔버스 크기 조정 및 그리기
    useEffect(() => {
        if (!image || !containerRef.current) return;

        const containerWidth = containerRef.current.clientWidth;
        const newScale = containerWidth / image.width;
        setScale(newScale);

        // 초기 변수 위치 설정 (있다면)
    }, [image]);

    // 변수 추가
    const addVariable = (key) => {
        const meta = VARIABLE_META[key];
        const newVar = {
            id: generateId(),
            key,
            label: meta.label,
            x: 0.1, // 기본 위치 (비율)
            y: 0.1,
            fontSize: 16,
            color: '#000000',
        };
        setVariables([...variables, newVar]);
        setSelectedVar(newVar.id);
    };

    // 변수 제거
    const removeVariable = (id) => {
        setVariables(variables.filter(v => v.id !== id));
        if (selectedVar === id) setSelectedVar(null);
    };

    // 마우스 이벤트 핸들러 (드래그)
    const handleMouseDown = (e, id) => {
        e.stopPropagation(); // 캔버스 클릭 방지
        setIsDragging(true);
        dragItem.current = id;
        setSelectedVar(id);

        // 현재 마우스 위치와 요소 위치의 차이 계산
        const varElement = e.currentTarget;
        const varRect = varElement.getBoundingClientRect();

        dragOffset.current = {
            x: e.clientX - varRect.left,
            y: e.clientY - varRect.top
        };
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !dragItem.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();

        // 새 위치 계산 (픽셀)
        let newX = e.clientX - containerRect.left - dragOffset.current.x;
        let newY = e.clientY - containerRect.top - dragOffset.current.y;

        // 비율로 변환 (0.0 ~ 1.0)
        let ratioX = newX / containerRect.width;
        let ratioY = newY / containerRect.height;

        // 0~1 사이로 제한
        ratioX = Math.max(0, Math.min(ratioX, 1));
        ratioY = Math.max(0, Math.min(ratioY, 1));

        setVariables(variables.map(v =>
            v.id === dragItem.current ? { ...v, x: ratioX, y: ratioY } : v
        ));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        dragItem.current = null;
    };

    // 저장 핸들러
    const handleSave = () => {
        // 백엔드 전송을 위한 데이터 구조로 변환
        const templateData = {
            // eslint-disable-next-line no-unused-vars
            variables: variables.map(({ id, ...rest }) => rest) // 내부용 ID 제거
        };
        onSave(templateData);
    };

    return (
        <div className="flex flex-col h-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            {/* 툴바 */}
            <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar max-w-2xl">
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">변수 추가:</span>
                    {variableOptions.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => addVariable(opt.key)}
                            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors whitespace-nowrap"
                        >
                            + {opt.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">취소</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 font-bold">저장</button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* 캔버스 영역 */}
                <div className="flex-1 bg-slate-500 overflow-auto flex items-center justify-center p-8 relative">
                    <div
                        ref={containerRef}
                        className="relative bg-white shadow-2xl"
                        style={{
                            width: image ? image.width * scale : '100%',
                            height: image ? image.height * scale : '600px',
                            backgroundImage: image ? `url(${image.src})` : 'none',
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                        }}
                    >
                        {image && (
                            <img
                                src={image.src}
                                alt="Template Background"
                                className="w-full h-auto pointer-events-none select-none"
                                style={{ display: 'block' }}
                            />
                        )}

                        {/* 변수 오버레이 */}
                        {variables.map(v => (
                            <div
                                key={v.id}
                                onMouseDown={(e) => handleMouseDown(e, v.id)}
                                className={`absolute cursor-move border-2 px-2 py-1 rounded bg-white/80 backdrop-blur-sm text-sm whitespace-nowrap shadow-sm transition-colors ${selectedVar === v.id ? 'border-indigo-600 z-50 ring-2 ring-indigo-200' : 'border-slate-400 z-10 hover:border-indigo-400'
                                    }`}
                                style={{
                                    left: `${v.x * 100}%`,
                                    top: `${v.y * 100}%`,
                                    fontSize: `${v.fontSize}px`,
                                    color: v.color,
                                    transform: 'translate(0, 0)', // 기준점을 좌상단으로 유지 (중앙 정렬 방식도 고려 가능)
                                }}
                            >
                                <span className="font-bold text-indigo-700 mr-1">{`{${v.key}}`}</span>
                                <span className="text-slate-800">{v.label}</span>
                                {selectedVar === v.id && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeVariable(v.id); }}
                                        className="ml-2 text-red-500 hover:text-red-700 font-bold"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 속성 패널 */}
                <div className="w-64 bg-white border-l border-slate-200 p-4 overflow-y-auto">
                    <h3 className="font-bold text-slate-800 mb-4">속성 설정</h3>
                    {selectedVar ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">변수명</label>
                                <div className="px-3 py-2 bg-slate-100 rounded border border-slate-200 text-sm font-mono text-slate-600">
                                    {variables.find(v => v.id === selectedVar)?.label} ({variables.find(v => v.id === selectedVar)?.key})
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">글자 크기 (px)</label>
                                <input
                                    type="number"
                                    value={variables.find(v => v.id === selectedVar)?.fontSize}
                                    onChange={(e) => setVariables(variables.map(v => v.id === selectedVar ? { ...v, fontSize: Number(e.target.value) } : v))}
                                    className="w-full px-3 py-2 border rounded text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">글자 색상</label>
                                <input
                                    type="color"
                                    value={variables.find(v => v.id === selectedVar)?.color}
                                    onChange={(e) => setVariables(variables.map(v => v.id === selectedVar ? { ...v, color: e.target.value } : v))}
                                    className="w-full h-10 border rounded cursor-pointer"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-slate-400 text-center py-8">
                            변수를 선택하면<br />속성을 편집할 수 있습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageTemplateEditor;
