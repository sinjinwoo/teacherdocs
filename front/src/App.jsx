import React, { useState } from 'react';
import Header from './components/Header';
import DocumentForm from './components/DocumentForm';
import Preview from './components/Preview';

function App() {
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'preview'

  // Form state lifted to App level for real-time preview
  const [formData, setFormData] = useState({
    school: '',
    template: '',
    teacherName: '',
    teacherPhone: '',
    students: [{ id: 1, name: '', studentId: '', grade: '', classNo: '' }],
    file: null
  });

  const handleFormChange = (newData) => {
    setFormData(newData);
  };

  const handleDownload = () => {
    console.log('Downloading documents for:', formData);
    // TODO: Implement actual document generation
    alert(`${formData.students.filter(s => s.name && s.studentId).length}개의 문서를 다운로드합니다.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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
                {formData.students.filter(s => s.name && s.studentId).length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                    {formData.students.filter(s => s.name && s.studentId).length}
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
              onDownload={handleDownload}
            />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; 2024 AbsentDoc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
