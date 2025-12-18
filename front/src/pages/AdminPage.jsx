import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import DocxViewer from '../components/DocxViewer';

const AdminPage = () => {
    const [docs, setDocs] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    // Upload Form State
    const [uploadData, setUploadData] = useState({
        schoolId: '',
        type: 'absent',
        name: '새 양식',
        file: null
    });

    // New School Creation State
    const [isCreatingSchool, setIsCreatingSchool] = useState(false);
    const [newSchoolName, setNewSchoolName] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [docsRes, schoolsRes] = await Promise.all([
                fetch(getApiUrl('/docs')),
                fetch(getApiUrl('/schools'))
            ]);

            if (docsRes.ok) {
                setDocs(await docsRes.json());
            }
            if (schoolsRes.ok) {
                setSchools(await schoolsRes.json());
            }
        } catch (error) {
            console.error(error);
            alert('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateSchool = async () => {
        if (!newSchoolName.trim()) return;
        try {
            const response = await fetch(getApiUrl('/schools'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSchoolName })
            });

            if (response.ok) {
                const newSchool = await response.json();
                setSchools([...schools, newSchool]);
                setUploadData({ ...uploadData, schoolId: newSchool.id });
                setIsCreatingSchool(false);
                setNewSchoolName('');
                alert('학교가 생성되었습니다.');
            } else {
                throw new Error('Failed to create school');
            }
        } catch (error) {
            alert('학교 생성 실패: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            const response = await fetch(getApiUrl(`/docs/${id}`), { method: 'DELETE' });
            if (response.ok) {
                setDocs(docs.filter(d => d.id !== id));
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            alert('삭제 실패: ' + error.message);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setUploadData({ ...uploadData, file: e.target.files[0] });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.file || !uploadData.schoolId) {
            alert('학교와 파일은 필수입니다.');
            return;
        }

        const formData = new FormData();
        const jsonPart = JSON.stringify({
            name: uploadData.name,
            schoolId: Number(uploadData.schoolId),
            // variables: null (let backend extract)
        });

        formData.append('data', jsonPart);
        formData.append('file', uploadData.file);

        try {
            const response = await fetch(getApiUrl('/docs'), {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('업로드 성공!');
                setUploadData({ ...uploadData, name: '새 양식', file: null });
                fetchData(); // Refresh list
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            alert('업로드 실패: ' + error.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">관리자 페이지 - 문서 관리</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <h2 className="text-xl font-semibold mb-4">새 양식 업로드</h2>
                    <form onSubmit={handleUpload} className="space-y-4">

                        {/* School Selection */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-700">학교 선택</label>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingSchool(!isCreatingSchool)}
                                    className="text-xs text-indigo-600 hover:underline"
                                >
                                    {isCreatingSchool ? '목록에서 선택' : '+ 학교 추가'}
                                </button>
                            </div>

                            {isCreatingSchool ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                        placeholder="학교명 입력"
                                        value={newSchoolName}
                                        onChange={e => setNewSchoolName(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreateSchool}
                                        className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                                    >
                                        추가
                                    </button>
                                </div>
                            ) : (
                                <select
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={uploadData.schoolId}
                                    onChange={e => setUploadData({ ...uploadData, schoolId: e.target.value })}
                                >
                                    <option value="">학교를 선택하세요</option>
                                    {schools.map(school => (
                                        <option key={school.id} value={school.id}>{school.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">문서 이름</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg"
                                value={uploadData.name}
                                onChange={e => setUploadData({ ...uploadData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">양식 타입</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg"
                                value={uploadData.type}
                                onChange={e => setUploadData({ ...uploadData, type: e.target.value })}
                            >
                                <option value="absent">결석계</option>
                                <option value="early">조퇴계</option>
                                <option value="outing">외출증</option>
                                <option value="late">지각계</option>
                                <option value="field">현장학습신청서</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">DOCX 파일</label>
                            <input type="file" accept=".docx" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                            업로드
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">등록된 문서 목록</h2>
                        <button onClick={fetchData} className="text-sm text-indigo-600 hover:underline">새로고침</button>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-slate-500">로딩 중...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">학교</th>
                                        <th className="px-4 py-3">이름/타입</th>
                                        <th className="px-4 py-3">파일명</th>
                                        <th className="px-4 py-3">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {docs.length === 0 ? (
                                        <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">데이터가 없습니다.</td></tr>
                                    ) : docs.map(doc => (
                                        <tr key={doc.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono text-xs">{doc.id}</td>
                                            <td className="px-4 py-3 font-medium">{doc.schoolName}</td>
                                            <td className="px-4 py-3">
                                                <div>{doc.name}</div>
                                                {/* <span className="text-xs text-slate-400">{doc.variables?.length || 0} vars</span> */}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate" title={doc.name}>
                                                {doc.name}.docx
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="text-red-500 hover:text-red-700 px-2 py-1 border border-red-200 rounded hover:bg-red-50 transition"
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-slate-700">미리보기 (업로드 파일)</h2>
                {uploadData.file ? (
                    <DocxViewer file={uploadData.file} className="border border-slate-300 rounded-xl" />
                ) : (
                    <div className="h-48 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400">
                        파일을 선택하면 미리보기가 표시됩니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
