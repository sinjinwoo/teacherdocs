import React from 'react';

const Preview = ({ data, onDownload }) => {
    const templateNames = {
        'absent': '결 석 계',
        'early': '조 퇴 계',
        'outing': '외 출 증',
        'late': '지 각 계',
        'field': '현장학습신청서'
    };

    const validStudents = data.students.filter(s => s.name && s.studentId);
    const studentCount = validStudents.length;
    const hasData = data.school && data.template && studentCount > 0;

    if (!hasData) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 h-full flex flex-col items-center justify-center text-center min-h-[500px]">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700">미리보기</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs">
                    문서 작성 탭에서 학교, 양식, 학생 정보를 입력하면 여기에 실시간으로 미리보기가 표시됩니다.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">문서 미리보기</h3>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                        {studentCount}명
                    </span>
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-6 overflow-y-auto max-h-[600px] shadow-inner">
                {/* Mock Document Representation - 첫 번째 학생만 미리보기 */}
                <div className="bg-white shadow-sm p-8 min-h-[500px] w-full mx-auto max-w-[210mm]">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold serif mb-2">{data.school}</h1>
                        <h2 className="text-xl font-bold underline decoration-2 underline-offset-4">
                            {templateNames[data.template] || '문서'}
                        </h2>
                    </div>

                    <div className="space-y-6 text-sm leading-relaxed">
                        <div className="flex justify-end">
                            <p>2024년 11월 27일</p>
                        </div>

                        <div className="border-t border-b border-black py-4 my-4">
                            <p><span className="font-bold w-20 inline-block">성 명:</span> {validStudents[0].name}</p>
                            <p><span className="font-bold w-20 inline-block">학 번:</span> {validStudents[0].studentId}</p>
                            {validStudents[0].grade && (
                                <p><span className="font-bold w-20 inline-block">학년/반:</span> {validStudents[0].grade}학년 {validStudents[0].classNo}반</p>
                            )}
                        </div>

                        <p>
                            위 학생은 {data.template === 'absent' ? '질병' : '개인 사정'}으로 인하여
                            {data.template === 'absent' ? ' 결석' : data.template === 'early' ? ' 조퇴' : data.template === 'late' ? ' 지각' : ' 외출'}하고자 하오니 허가하여 주시기 바랍니다.
                        </p>

                        <div className="mt-12 text-center">
                            <p className="mb-16">위와 같이 신청합니다.</p>
                            <p className="font-bold text-lg">담임교사: {data.teacherName || '(서명)'}</p>
                            {data.teacherPhone && (
                                <p className="text-sm mt-2">연락처: {data.teacherPhone}</p>
                            )}
                        </div>
                    </div>

                    {studentCount > 1 && (
                        <div className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                            <p className="text-sm text-indigo-700">
                                + 외 {studentCount - 1}명의 문서가 생성됩니다
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onDownload}
                    className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md shadow-indigo-200 transition-all"
                >
                    다운로드 (DOCX) - {studentCount}명
                </button>
            </div>
        </div>
    );
};

export default Preview;
