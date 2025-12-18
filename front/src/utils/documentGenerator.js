import { extractDateParts, calculateDaysBetween } from './variableMapping';

/**
 * formData를 템플릿 변수로 변환
 */
export const convertToTemplateVariables = (formData, student, schoolName) => {
  const now = new Date();
  const startDateParts = extractDateParts(student.startDate);
  const endDateParts = extractDateParts(student.endDate);

  return {
    // 학생 정보
    nm: student.name || '',
    g: student.grade || '',
    c: student.classNo || '',
    sn: student.studentNo || '',

    // 날짜 정보 (기간)
    sy: startDateParts.year,
    sm: startDateParts.month,
    sd: startDateParts.day,
    ey: endDateParts.year,
    em: endDateParts.month,
    ed: endDateParts.day,
    sum: calculateDaysBetween(student.startDate, student.endDate),

    // 날짜 정보 (작성일 - 오늘)
    ty: now.getFullYear().toString(),
    tm: (now.getMonth() + 1).toString().padStart(2, '0'),
    td: now.getDate().toString().padStart(2, '0'),

    // 기타 정보
    r: student.reason || '',
    d: student.document || '',

    // 교사 정보
    tn: formData.commonData.teacherName || '',
    ts: formData.signature || '', // 서명 이미지

    // 학교 정보
    sc: schoolName || '',
  };
};



