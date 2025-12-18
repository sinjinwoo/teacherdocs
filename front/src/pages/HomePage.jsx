import React, { useState } from 'react';
import Header from '../components/Header';
import DocumentForm from '../components/DocumentForm';
import Preview from '../components/Preview';

const HomePage = () => {
    const [activeTab, setActiveTab] = useState('form'); // 'form' or 'preview'
    const [formData, setFormData] = useState({
        school: '',
        template: '',
        commonData: {
            teacherName: '',
            teacherPhone: '',
        },
        students: [{
            id: 1,
            name: '',
            grade: '',
            classNo: '',
            studentNo: '',
            startDate: '',
            endDate: '',
            reason: '',
            document: ''
        }],
        file: null,
        signature: null
    });

    const handleFormChange = (newData) => {
        setFormData(newData);
    };

    return (
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {/* Tab Navigation */}
            <div className="mb-6">
                <div className="border-b border-slate-200">
                    <nav className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('form')}
                            className={`pb-4 px-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'form'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            📝 문서 작성
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`pb-4 px-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'preview'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            👁️ 미리보기
                            {formData.students.filter(s => s.name && s.studentNo).length > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                                    {formData.students.filter(s => s.name && s.studentNo).length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-fadeIn">
                {activeTab === 'form' ? (
                    <DocumentForm
                        formData={formData}
                        onFormChange={handleFormChange}
                    />
                ) : (
                    <Preview
                        data={formData}
                    />
                )}
            </div>
        </div>
    );
};


export default HomePage;
