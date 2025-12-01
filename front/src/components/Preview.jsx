import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, EmptyState } from './ui';
import { generatePreviewFromTemplate } from '../utils/documentGenerator';
import { getAllSchools, getDocById } from '../services/api';

const Preview = ({ data, onDownload }) => {
    const [schoolName, setSchoolName] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [previewHTML, setPreviewHTML] = useState('');
    const [loading, setLoading] = useState(false);

    const validStudents = data.students.filter(s => s.name && s.name.trim() !== '');
    const studentCount = validStudents.length;
    const hasData = data.school && data.template && studentCount > 0;

    // 실제 템플릿 기반 미리보기 생성
    useEffect(() => {
        const generatePreview = async () => {
            if (!data.school || !data.template || validStudents.length === 0) {
                setPreviewHTML('');
                return;
            }

            try {
                setLoading(true);

                // 학교명 가져오기
                const schools = await getAllSchools();
                const school = schools.find(s => s.id === data.school);
                const template = await getDocById(data.template);

                setSchoolName(school?.name || '');
                setTemplateName(template?.name || '');

                // 실제 템플릿으로 미리보기 생성
                const html = await generatePreviewFromTemplate(
                    data,
                    data.template,
                    school?.name || ''
                );
                setPreviewHTML(html);
            } catch (error) {
                console.error('미리보기 생성 실패:', error);
                setPreviewHTML(`<p style="text-align: center; padding: 40px; color: #e74c3c;">미리보기 생성 실패: ${error.message}</p>`);
            } finally {
                setLoading(false);
            }
        };

        generatePreview();
    }, [data.school, data.template, data.students, data.commonData]);

    if (!hasData) {
        return (
            <Card padding="lg" className="min-h-[500px]">
                <EmptyState
                    icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    title="미리보기"
                    description="문서 작성 탭에서 학교, 양식, 학생 정보를 입력하면 여기에 실시간으로 미리보기가 표시됩니다."
                />
            </Card>
        );
    }

    return (
        <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">문서 미리보기</h3>
                <Badge variant="primary" size="md">
                    {studentCount}명
                </Badge>
            </div>

            {loading ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-6 h-[600px] flex items-center justify-center">
                    <p className="text-slate-500">미리보기를 불러오는 중...</p>
                </div>
            ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-6 overflow-y-auto max-h-[600px] shadow-inner">
                    {/* 실제 템플릿 기반 미리보기 */}
                    <div
                        className="bg-white shadow-sm min-h-[500px] w-full mx-auto max-w-[210mm]"
                        dangerouslySetInnerHTML={{ __html: previewHTML }}
                    />

                    {studentCount > 1 && (
                        <div className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                            <p className="text-sm text-indigo-700">
                                📄 첫 번째 학생의 문서만 미리보기됩니다
                            </p>
                            <p className="text-xs text-indigo-600 mt-1">
                                + 외 {studentCount - 1}명의 문서가 추가로 생성됩니다
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-end gap-3">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={onDownload}
                    disabled={loading}
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    다운로드 (DOCX) - {studentCount}명
                </Button>
            </div>
        </Card>
    );
};

export default Preview;
