import React, { useState } from 'react';
import Papa from 'papaparse';
import { Modal, Button, Select } from './ui';

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="CSV 파일로 학생 추가"
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={handleClose}>
                        취소
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleImport}
                        disabled={!csvData}
                    >
                        가져오기
                    </Button>
                </>
            }
        >
            <div className="space-y-6">
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
                                    <Select
                                        value={mapping[field.key]}
                                        onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                                        options={headers.map(header => ({ value: header, label: header }))}
                                        placeholder="선택 안함"
                                    />
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
        </Modal>
    );
};

export default CSVImportModal;
