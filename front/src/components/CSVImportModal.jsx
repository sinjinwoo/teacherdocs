import React, { useState } from 'react';
import Papa from 'papaparse';

const CSVImportModal = ({ isOpen, onClose, onImport }) => {
    const [csvData, setCsvData] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [mapping, setMapping] = useState({
        name: '',
        studentId: '',
        grade: '',
        classNo: ''
    });

    const requiredFields = [
        { key: 'name', label: '이름', required: true },
        { key: 'studentId', label: '학번', required: true },
        { key: 'grade', label: '학년', required: false },
        { key: 'classNo', label: '반', required: false }
    ];

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            Papa.parse(file, {
                complete: (result) => {
                    if (result.data && result.data.length > 0) {
                        const headers = result.data[0];
                        setHeaders(headers);
                        setCsvData(result.data.slice(1)); // 헤더 제외

                        // 자동 매칭 시도
                        const autoMapping = {};
                        requiredFields.forEach(field => {
                            const matchedHeader = headers.find(h =>
                                h.toLowerCase().includes(field.key.toLowerCase()) ||
                                h.includes(field.label)
                            );
                            if (matchedHeader) {
                                autoMapping[field.key] = matchedHeader;
                            }
                        });
                        setMapping(autoMapping);
                    }
                },
                error: (error) => {
                    alert('CSV 파일을 읽는 중 오류가 발생했습니다.');
                    console.error(error);
                }
            });
        }
    };

    const handleImport = () => {
        if (!mapping.name || !mapping.studentId) {
            alert('이름과 학번은 필수 매핑 항목입니다.');
            return;
        }

        const students = csvData.map((row, index) => {
            const nameIndex = headers.indexOf(mapping.name);
            const studentIdIndex = headers.indexOf(mapping.studentId);
            const gradeIndex = mapping.grade ? headers.indexOf(mapping.grade) : -1;
            const classNoIndex = mapping.classNo ? headers.indexOf(mapping.classNo) : -1;

            return {
                id: Date.now() + index,
                name: row[nameIndex] || '',
                studentId: row[studentIdIndex] || '',
                grade: gradeIndex >= 0 ? row[gradeIndex] : '',
                classNo: classNoIndex >= 0 ? row[classNoIndex] : ''
            };
        }).filter(s => s.name && s.studentId); // 빈 행 제외

        onImport(students);
        handleClose();
    };

    const handleClose = () => {
        setCsvData(null);
        setHeaders([]);
        setMapping({ name: '', studentId: '', grade: '', classNo: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800">CSV 파일로 학생 추가</h3>
                        <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">CSV 파일 선택</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>

                    {/* Field Mapping */}
                    {csvData && headers.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-slate-700">필드 매핑</h4>
                            <p className="text-sm text-slate-500">CSV 파일의 열을 학생 정보 필드에 매핑해주세요.</p>

                            {requiredFields.map(field => (
                                <div key={field.key} className="grid grid-cols-2 gap-4 items-center">
                                    <label className="text-sm font-medium text-slate-700">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <select
                                        value={mapping[field.key]}
                                        onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                                        className="px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                    >
                                        <option value="">선택 안함</option>
                                        {headers.map(header => (
                                            <option key={header} value={header}>{header}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-600">
                                    <strong>{csvData.length}개</strong>의 행이 발견되었습니다.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!csvData}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        가져오기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CSVImportModal;
