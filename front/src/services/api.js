import axios from 'axios';

// API Base URL - .env 파일에서 읽어오거나 기본값 사용
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초
});

// 요청 인터셉터 (필요시 인증 토큰 추가)
apiClient.interceptors.request.use(
  (config) => {
    // 예: 토큰이 있으면 헤더에 추가
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 서버가 응답했지만 에러 상태 코드
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // 요청은 보냈지만 응답 없음
      console.error('No response from server');
    } else {
      // 요청 설정 중 에러 발생
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// School API
// ============================================

/**
 * 모든 학교 목록 조회
 * GET /api/schools
 */
export const getAllSchools = async () => {
  const response = await apiClient.get('/schools');
  return response.data;
};

/**
 * 특정 학교 조회
 * GET /api/schools/{id}
 */
export const getSchoolById = async (id) => {
  const response = await apiClient.get(`/schools/${id}`);
  return response.data;
};

/**
 * 학교 생성
 * POST /api/schools
 */
export const createSchool = async (schoolData) => {
  const response = await apiClient.post('/schools', schoolData);
  return response.data;
};

/**
 * 학교 삭제
 * DELETE /api/schools/{id}
 */
export const deleteSchool = async (id) => {
  const response = await apiClient.delete(`/schools/${id}`);
  return response.data;
};

// ============================================
// Docs API
// ============================================

/**
 * 전체 문서 목록 조회
 * GET /api/docs
 */
export const getAllDocs = async () => {
  const response = await apiClient.get('/docs');
  return response.data;
};

/**
 * 특정 학교의 문서 목록 조회
 * GET /api/docs/school/{schoolId}
 */
export const getDocsBySchool = async (schoolId) => {
  const response = await apiClient.get(`/docs/school/${schoolId}`);
  return response.data;
};

/**
 * 특정 문서 메타데이터 조회
 * GET /api/docs/{id}
 */
export const getDocById = async (id) => {
  const response = await apiClient.get(`/docs/${id}`);
  return response.data;
};

/**
 * 문서 파일 다운로드
 * GET /api/docs/{id}/download
 */
export const downloadDoc = async (id) => {
  const response = await apiClient.get(`/docs/${id}/download`, {
    responseType: 'blob', // 바이너리 데이터
  });
  return response.data;
};

/**
 * 문서 업로드
 * POST /api/docs
 */
export const uploadDoc = async (formData) => {
  const response = await apiClient.post('/docs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * 문서 삭제
 * DELETE /api/docs/{id}
 */
export const deleteDoc = async (id) => {
  const response = await apiClient.delete(`/docs/${id}`);
  return response.data;
};

export default apiClient;