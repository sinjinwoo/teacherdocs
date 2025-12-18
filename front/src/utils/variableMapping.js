/**
 * 템플릿 변수 매핑 및 카테고리 정의
 */

// 변수 메타데이터
export const VARIABLE_META = {
  // 학생 정보
  g: { label: '학년', type: 'text', category: 'student', placeholder: '예: 3' },
  c: { label: '반', type: 'text', category: 'student', placeholder: '예: 2' },
  sn: { label: '번호', type: 'text', category: 'student', placeholder: '예: 15' },
  nm: { label: '이름', type: 'text', category: 'student', placeholder: '예: 홍길동' },

  // 날짜 정보 (작성일 - 자동)
  ty: { label: '작성 년도', type: 'auto-date', category: 'auto', getValue: () => new Date().getFullYear().toString() },
  tm: { label: '작성 월', type: 'auto-date', category: 'auto', getValue: () => (new Date().getMonth() + 1).toString().padStart(2, '0') },
  td: { label: '작성 일', type: 'auto-date', category: 'auto', getValue: () => new Date().getDate().toString().padStart(2, '0') },

  // 날짜 정보 (기간 - 달력)
  sy: { label: '시작 년도', type: 'date-part', category: 'date', dateField: 'startDate', part: 'year' },
  sm: { label: '시작 월', type: 'date-part', category: 'date', dateField: 'startDate', part: 'month' },
  sd: { label: '시작 일', type: 'date-part', category: 'date', dateField: 'startDate', part: 'day' },
  ey: { label: '종료 년도', type: 'date-part', category: 'date', dateField: 'endDate', part: 'year' },
  em: { label: '종료 월', type: 'date-part', category: 'date', dateField: 'endDate', part: 'month' },
  ed: { label: '종료 일', type: 'date-part', category: 'date', dateField: 'endDate', part: 'day' },
  sum: { label: '기간(일수)', type: 'calculated', category: 'auto', description: '시작일과 종료일 차이를 자동 계산' },

  // 기타 정보
  r: { label: '사유', type: 'text', category: 'other', placeholder: '예: 병원 진료' },
  d: { label: '첨부 서류', type: 'text', category: 'other', placeholder: '예: 진단서 1부' },

  // 교사 정보
  tn: { label: '담임교사 이름', type: 'text', category: 'teacher', placeholder: '예: 김선생' },
  ts: { label: '교사 서명', type: 'signature', category: 'auto', description: '교사 서명 이미지 (자동 삽입)' },

  // 학교 정보
  sc: { label: '학교명', type: 'auto', category: 'auto' },
};

/**
 * 변수를 카테고리별로 분류
 */
export const categorizeVariables = (variables) => {
  const categorized = {
    student: [],
    teacher: [],
    date: [],
    auto: [],
    other: [],
  };

  variables.forEach(({ key, required }) => {
    const meta = VARIABLE_META[key];
    if (meta) {
      categorized[meta.category].push({ key, required, ...meta });
    }
  });

  return categorized;
};

/**
 * 날짜에서 년/월/일 추출
 */
export const extractDateParts = (dateString) => {
  if (!dateString) return { year: '', month: '', day: '' };

  const date = new Date(dateString);
  return {
    year: date.getFullYear().toString(),
    month: (date.getMonth() + 1).toString().padStart(2, '0'),
    day: date.getDate().toString().padStart(2, '0'),
  };
};

/**
 * 년/월/일에서 날짜 문자열 생성
 */
export const combineDateParts = (year, month, day) => {
  if (!year || !month || !day) return '';
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * 두 날짜 사이의 일수 계산 (시작일과 종료일 포함)
 */
export const calculateDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return '';

  const start = new Date(startDate);
  const end = new Date(endDate);

  // 시간 차이를 밀리초로 계산
  const diffTime = Math.abs(end - start);
  // 일수로 변환 (시작일과 종료일 모두 포함하므로 +1)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays.toString();
};

/**
 * 템플릿 변수의 초기값 생성
 */
export const generateInitialValues = (variables, schoolName = '') => {
  const values = {};

  variables.forEach(({ key }) => {
    const meta = VARIABLE_META[key];
    if (!meta) return;

    // 자동 날짜 필드
    if (meta.category === 'auto' && meta.getValue) {
      values[key] = meta.getValue();
    }
    // 학교명
    else if (key === 'sc') {
      values[key] = schoolName;
    }
    // 기타 필드
    else {
      values[key] = '';
    }
  });

  return values;
};

/**
 * 학생별 변수 초기값 생성
 */
export const generateStudentInitialValues = (variables) => {
  const values = {};

  variables.forEach(({ key }) => {
    const meta = VARIABLE_META[key];
    if (meta && meta.category === 'student') {
      values[key] = '';
    }
  });

  return values;
};
