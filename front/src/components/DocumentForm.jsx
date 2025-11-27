import React, { useState } from 'react';
import CSVImportModal from './CSVImportModal';

const DocumentForm = ({ formData, onFormChange }) => {
    const [showCSVModal, setShowCSVModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data - 학교별 양식
    const schoolData = {
        '서울고등학교': [
            { id: 'absent', name: '결석계', desc: '질병 및 기타 사유로 인한 결석' },
            { id: 'early', name: '조퇴계', desc: '병원 진료 등으로 인한 조퇴' },
            { id: 'outing', name: '외출증', desc: '학교장 허가 외출' },
        ],
        '경기과학고등학교': [
            { id: 'absent', name: '결석계', desc: '질병 및 기타 사유로 인한 결석' },
            { id: 'late', name: '지각계', desc: '지각 사유서' },
        ],
        '부산예술고등학교': [
            { id: 'absent', name: '결석계', desc: '질병 및 기타 사유로 인한 결석' },
            { id: 'early', name: '조퇴계', desc: '병원 진료 등으로 인한 조퇴' },
            { id: 'field', name: '현장학습신청서', desc: '교외 활동 신청' },
        ],
    };

    const schools = Object.keys(schoolData);
    const templates = formData.school ? schoolData[formData.school] : [];

    const handleFieldChange = (field, value) => {
        onFormChange({ ...formData, [field]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFieldChange('file', e.target.files[0]);
        }
    };

    const addStudent = () => {
        const newId = Math.max(...formData.students.map(s => s.id), 0) + 1;
        handleFieldChange('students', [
            ...formData.students,
            { id: newId, name: '', studentId: '', grade: '', classNo: '' }
        ]);
    };

    const removeStudent = (id) => {
        handleFieldChange('students', formData.students.filter(s => s.id !== id));
    };

    const updateStudent = (id, field, value) => {
        handleFieldChange('students', formData.students.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const handleCSVImport = (importedStudents) => {
        handleFieldChange('students', [...formData.students, ...importedStudents]);
    };

    // 검색 필터링
    const filteredStudents = formData.students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.includes(searchQuery)
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">문서 작성</h2>

            <div className="space-y-8">
                {/* School Selection */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">학교 선택</label>
                    <select
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-slate-50 hover:bg-white"
                        value={formData.school}
                        onChange={(e) => {
                            handleFieldChange('school', e.target.value);
                            handleFieldChange('template', ''); // 학교 변경시 템플릿 초기화
                        }}
                    >
                        <option value="">학교를 선택해주세요</option>
                        {schools.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Template Selection - 학교 선택 후에만 표시 */}
                {formData.school && (
                    <div className="space-y-3 animate-fadeIn">
                        <label className="block text-sm font-semibold text-slate-700">양식 선택</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {templates.map((t) => (
                                <div
                                    key={t.id}
                                    onClick={() => handleFieldChange('template', t.id)}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.template === t.id
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="font-bold text-slate-800">{t.name}</div>
                                    <div className="text-xs text-slate-500 mt-1">{t.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Teacher Information */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">교사 정보</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="교사 이름"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            value={formData.teacherName}
                            onChange={(e) => handleFieldChange('teacherName', e.target.value)}
                        />
                        <input
                            type="tel"
                            placeholder="연락처 (선택)"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            value={formData.teacherPhone}
                            onChange={(e) => handleFieldChange('teacherPhone', e.target.value)}
                        />
                    </div>
                </div>

                {/* Student Input - Multiple */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-slate-700">
                            학생 정보 ({formData.students.length}명)
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowCSVModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                                CSV 가져오기
                            </button>
                            <button
                                type="button"
                                onClick={addStudent}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                학생 추가
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    {formData.students.length > 3 && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="학생 이름 또는 학번으로 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            />
                            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    )}

                    {/* Student List */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {filteredStudents.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                {searchQuery ? '검색 결과가 없습니다.' : '학생을 추가해주세요.'}
                            </div>
                        ) : (
                            filteredStudents.map((student, index) => (
                                <div key={student.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-slate-600">
                                            학생 {formData.students.findIndex(s => s.id === student.id) + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeStudent(student.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            title="삭제"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <input
                                            type="text"
                                            placeholder="이름"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                                            value={student.name}
                                            onChange={(e) => updateStudent(student.id, 'name', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="학번"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                                            value={student.studentId}
                                            onChange={(e) => updateStudent(student.id, 'studentId', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="학년"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                                            value={student.grade}
                                            onChange={(e) => updateStudent(student.id, 'grade', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="반"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                                            value={student.classNo}
                                            onChange={(e) => updateStudent(student.id, 'classNo', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Proof Upload */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700">증빙 서류 첨부 (선택)</label>
                    <div className="relative">
                        <input
                            type="file"
                            className="hidden"
                            id="proof-upload"
                            onChange={handleFileChange}
                        />
                        <label
                            htmlFor="proof-upload"
                            className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                        >
                            <div className="text-center">
                                {formData.file ? (
                                    <div className="text-indigo-600 font-medium flex items-center gap-2 justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        {formData.file.name}
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-slate-600 font-medium">증빙서류 업로드</div>
                                        <div className="text-xs text-slate-400 mt-1">이미지 또는 PDF 파일</div>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* CSV Import Modal */}
            <CSVImportModal
                isOpen={showCSVModal}
                onClose={() => setShowCSVModal(false)}
                onImport={handleCSVImport}
            />
        </div>
    );
};

export default DocumentForm;
