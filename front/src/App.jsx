import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';

function App() {
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'preview'

  // Form state lifted to App level for real-time preview
  const [formData, setFormData] = useState({
    school: '',
    template: '',
    // 공통 입력 데이터 (교사 정보만)
    commonData: {
      teacherName: '', // tn
    },
    // 학생 목록 (각 학생별로 모든 정보 포함)
    students: [{
      id: 1,
      // 학생 기본 정보
      name: '',        // nm
      grade: '',       // g
      classNo: '',     // c
      studentNo: '',   // sn
      // 날짜 정보 (학생별)
      startDate: '',   // sy, sm, sd
      endDate: '',     // ey, em, ed
      // 기타 정보 (학생별)
      reason: '',      // r
      document: '',    // d
    }],
    signature: null,
    file: null
  });

  const handleFormChange = (newData) => {
    setFormData(newData);
  };

  const handleDownload = async () => {
    try {
      // 유효성 검사
      if (!formData.school || !formData.template) {
        alert('학교와 양식을 선택해주세요.');
        return;
      }

      const validStudents = formData.students.filter(s => s.name && s.name.trim() !== '');
      if (validStudents.length === 0) {
        alert('학생 정보를 입력해주세요.');
        return;
      }

      // 동적 import로 documentGenerator 로드
      const { generateMultipleDocuments } = await import('./utils/documentGenerator');
      const { getAllSchools, getDocById } = await import('./services/api');

      // 학교명과 템플릿명 가져오기
      const schools = await getAllSchools();
      const school = schools.find(s => s.id === formData.school);
      const template = await getDocById(formData.template);

      console.log('문서 생성 시작...', {
        school: school?.name,
        template: template?.name,
        studentCount: validStudents.length
      });

      // 문서 생성
      const result = await generateMultipleDocuments(
        formData,
        formData.template,
        template?.name || '문서',
        school?.name || ''
      );

      alert(`✅ ${result.count}개의 문서가 생성되었습니다.\n파일명: ${result.fileName}`);
    } catch (error) {
      console.error('문서 다운로드 오류:', error);
      alert(`❌ 문서 생성 중 오류가 발생했습니다.\n${error.message}`);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>

        <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm flex flex-col gap-2">
            <span>&copy; 2024 AbsentDoc. All rights reserved.</span>
            <Link to="/admin" className="text-slate-300 hover:text-indigo-400 text-xs transition-colors">Admin Access</Link>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
