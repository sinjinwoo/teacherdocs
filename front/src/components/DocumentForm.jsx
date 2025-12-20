import React, { useState, useEffect } from 'react';
import CSVImportModal from './CSVImportModal';
import { Card, Button, Select, Input, SearchInput, FileUpload, IconButton, DatePicker } from './ui';
import SignaturePad from "./ui/SignaturePad.jsx";
import { getAllSchools, getDocsBySchool } from '../services/api';
import { categorizeVariables, VARIABLE_META } from '../utils/variableMapping';

const DocumentForm = ({ formData, onFormChange }) => {
    const [showCSVModal, setShowCSVModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // API 데이터 상태
    const [schools, setSchools] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 선택된 템플릿 정보
    const selectedTemplate = templates.find(t => t.id === formData.template);

    // DEBUG: 만약 템플릿 변수가 없으면 디폴트 변수 사용 (개발용)
    const debugVariables = selectedTemplate?.variables?.length > 0
        ? selectedTemplate.variables
        : [
            { key: 'nm', required: true },
            { key: 'sn', required: true },
            { key: 'g', required: true },
            { key: 'c', required: true },
            { key: 'sy', required: true },
            { key: 'ey', required: true },
            { key: 'r', required: false },
            { key: 'tn', required: true },
        ];

    const categorizedVars = selectedTemplate
        ? categorizeVariables(debugVariables)
        : null;

    // 학교 목록 불러오기
    useEffect(() => {
        const fetchSchools = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAllSchools();
                setSchools(data);
            } catch (err) {
                console.error('학교 목록 조회 실패:', err);
                setError('학교 목록을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchSchools();
    }, []);

    // 학교 선택 시 해당 학교의 문서 목록 불러오기
    useEffect(() => {
        if (!formData.school) {
            setTemplates([]);
            return;
        }

        const fetchDocs = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getDocsBySchool(formData.school);
                setTemplates(data);
            } catch (err) {
                console.error('문서 목록 조회 실패:', err);
                setError('문서 목록을 불러오는데 실패했습니다.');
                setTemplates([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, [formData.school]);

    // 공통 데이터 필드 변경
    const handleCommonDataChange = (field, value) => {
        onFormChange({
            ...formData,
            commonData: {
                ...formData.commonData,
                [field]: value
            }
        });
    };

    // 파일 변경
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFormChange({ ...formData, file: e.target.files[0] });
        }
    };

    // 학생 추가
    const addStudent = () => {
        const newId = Math.max(...formData.students.map(s => s.id), 0) + 1;
        const newStudent = {
            id: newId,
            // 학생 기본 정보
            name: '',
            grade: '',
            classNo: '',
            studentNo: '',
            // 날짜 정보
            startDate: '',
            endDate: '',
            // 기타 정보
            reason: '',
            document: ''
        };
        onFormChange({
            ...formData,
            students: [...formData.students, newStudent]
        });
    };

    // 학생 제거
    const removeStudent = (id) => {
        onFormChange({
            ...formData,
            students: formData.students.filter(s => s.id !== id)
        });
    };

    // 학생 정보 업데이트
    const updateStudent = (id, field, value) => {
        onFormChange({
            ...formData,
            students: formData.students.map(s =>
                s.id === id ? { ...s, [field]: value } : s
            )
        });
    };

    // CSV 가져오기
    const handleCSVImport = (importedStudents) => {
        onFormChange({
            ...formData,
            students: [...formData.students, ...importedStudents]
        });
    };

    // 검색 필터링
    const filteredStudents = formData.students.filter(student =>
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentNo?.includes(searchQuery)
    );

    return (
        <Card padding="lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">문서 작성</h2>

            <div className="space-y-8">
                {/* 학교 선택 */}
                <Select
                    label="학교 선택"
                    value={formData.school}
                    onChange={(e) => {
                        const selectedValue = e.target.value;
                        const schoolId = selectedValue === '' ? '' : Number(selectedValue);

                        onFormChange({
                            ...formData,
                            school: schoolId,
                            template: ''
                        });
                    }}
                    options={schools.map(s => ({ value: s.id, label: s.name }))}
                    placeholder={loading ? "로딩중..." : "학교를 선택해주세요"}
                    fullWidth
                    disabled={loading}
                />

                {/* 에러 메시지 */}
                {error && (
                    <div className="text-sm text-red-600 mt-2">{error}</div>
                )}

                {/* 템플릿 선택 */}
                {formData.school && (
                    <div className="space-y-3 animate-fadeIn">
                        <label className="block text-sm font-semibold text-slate-700">양식 선택</label>

                        {loading ? (
                            <div className="text-center py-8 text-slate-500">
                                문서 목록을 불러오는 중...
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
                                해당 학교의 등록된 문서가 없습니다.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {templates.map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => onFormChange({ ...formData, template: t.id })}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.template === t.id
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="font-bold text-slate-800">{t.name}</div>
                                        {t.desc && <div className="text-xs text-slate-500 mt-1">{t.desc}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 템플릿 선택되지 않았을 때 안내 */}
                {!formData.template && formData.school && templates.length > 0 && (
                    <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                        <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p className="text-lg font-medium">양식을 선택해주세요</p>
                        <p className="text-sm mt-1">위에서 사용할 문서 양식을 선택하면 입력 필드가 나타납니다</p>
                    </div>
                )}

                {/* 템플릿 선택 후 동적 입력 필드 */}
                {formData.template && categorizedVars && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* 교사 정보 */}
                        {categorizedVars.teacher.length > 0 && (
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-700">교사 정보</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {categorizedVars.teacher.map((variable) => (
                                        <Input
                                            key={variable.key}
                                            type="text"
                                            label={variable.label}
                                            placeholder={variable.placeholder}
                                            value={formData.commonData.teacherName || ''}
                                            onChange={(e) => handleCommonDataChange('teacherName', e.target.value)}
                                            required={variable.required}
                                            fullWidth
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 학생 정보 */}
                        {categorizedVars.student.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        학생 정보 ({formData.students.length}명)
                                    </label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="primary"
                                            size="md"
                                            onClick={() => setShowCSVModal(true)}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                            </svg>
                                            CSV 가져오기
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="md"
                                            onClick={addStudent}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                            </svg>
                                            학생 추가
                                        </Button>
                                    </div>
                                </div>

                                {/* 검색 바 */}
                                {formData.students.length > 3 && (
                                    <SearchInput
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="학생 이름 또는 학번으로 검색..."
                                    />
                                )}

                                {/* 학생 목록 */}
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {filteredStudents.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            {searchQuery ? '검색 결과가 없습니다.' : '학생을 추가해주세요.'}
                                        </div>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <div key={student.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-semibold text-slate-600">
                                                        학생 {formData.students.findIndex(s => s.id === student.id) + 1}
                                                    </span>
                                                    <IconButton
                                                        variant="danger"
                                                        size="md"
                                                        onClick={() => removeStudent(student.id)}
                                                        ariaLabel="삭제"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                        </svg>
                                                    </IconButton>
                                                </div>

                                                <div className="space-y-4">
                                                    {/* 학생 기본 정보 */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-2">기본 정보</label>
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                            {categorizedVars.student.map((variable) => {
                                                                const fieldMap = {
                                                                    nm: 'name',
                                                                    g: 'grade',
                                                                    c: 'classNo',
                                                                    sn: 'studentNo'
                                                                };
                                                                const fieldName = fieldMap[variable.key];
                                                                return (
                                                                    <Input
                                                                        key={variable.key}
                                                                        type="text"
                                                                        placeholder={variable.label}
                                                                        value={student[fieldName] || ''}
                                                                        onChange={(e) => updateStudent(student.id, fieldName, e.target.value)}
                                                                        fullWidth
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* 날짜 정보 */}
                                                    {categorizedVars.date.length > 0 && (
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600 mb-2">결석 기간</label>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <DatePicker
                                                                    label="시작일"
                                                                    value={student.startDate || ''}
                                                                    onChange={(e) => updateStudent(student.id, 'startDate', e.target.value)}
                                                                    fullWidth
                                                                />
                                                                <DatePicker
                                                                    label="종료일"
                                                                    value={student.endDate || ''}
                                                                    onChange={(e) => updateStudent(student.id, 'endDate', e.target.value)}
                                                                    fullWidth
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 기타 정보 */}
                                                    {categorizedVars.other.length > 0 && (
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600 mb-2">기타 정보</label>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {categorizedVars.other.map((variable) => {
                                                                    const fieldMap = { r: 'reason', d: 'document' };
                                                                    const fieldName = fieldMap[variable.key];
                                                                    return (
                                                                        <Input
                                                                            key={variable.key}
                                                                            type="text"
                                                                            label={variable.label}
                                                                            placeholder={variable.placeholder}
                                                                            value={student[fieldName] || ''}
                                                                            onChange={(e) => updateStudent(student.id, fieldName, e.target.value)}
                                                                            fullWidth
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 교사 서명 */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-700">교사 서명</label>
                            <div className="max-w-md">
                                <SignaturePad
                                    width={450}
                                    height={150}
                                    onSave={(dataURL) => onFormChange({ ...formData, signature: dataURL })}
                                    onClear={() => onFormChange({ ...formData, signature: null })}
                                />
                            </div>
                            {formData.signature && (
                                <div className="mt-2 p-2 bg-slate-50 rounded-lg max-w-md">
                                    <p className="text-xs text-slate-500 mb-2">저장된 서명:</p>
                                    <img
                                        src={formData.signature}
                                        alt="교사 서명"
                                        className="h-16 border border-slate-200 rounded bg-white"
                                    />
                                </div>
                            )}
                        </div>

                        {/* 증빙 서류 */}
                        <FileUpload
                            label="증빙 서류 첨부 (선택)"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            file={formData.file}
                            placeholder="증빙서류 업로드"
                            helperText="이미지 또는 PDF 파일"
                        />
                    </div>
                )}
            </div>

            {/* CSV Import Modal */}
            <CSVImportModal
                isOpen={showCSVModal}
                onClose={() => setShowCSVModal(false)}
                onImport={handleCSVImport}
            />
        </Card>
    );
};

export default DocumentForm;