import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import mammoth from 'mammoth';
import { downloadDoc } from '../services/api';
import { extractDateParts, calculateDaysBetween } from './variableMapping';

/**
 * DOCX XML에서 분리된 텍스트 태그를 병합
 * Word가 자동으로 텍스트를 여러 <w:t> 태그로 분리하는 문제 해결
 */
const fixDocxXML = (zip) => {
  try {
    const documentXml = zip.file('word/document.xml').asText();

    // 연속된 <w:t> 태그 병합
    const fixed = documentXml.replace(
      /<\/w:t><w:t[^>]*>/g,
      ''
    );

    zip.file('word/document.xml', fixed);
    return zip;
  } catch (error) {
    console.warn('XML 정리 실패, 원본 사용:', error);
    return zip;
  }
};

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
    // ts: formData.signature || '', // 서명 이미지 (이미지 처리는 별도 플러그인 필요)

    // 학교 정보
    sc: schoolName || '',
  };
};

/**
 * 단일 학생 문서 생성
 */
export const generateSingleDocument = async (templateData, variables) => {
  try {
    // DOCX 파일을 PizZip으로 로드
    let zip = new PizZip(templateData);

    // XML 정리 (분리된 태그 병합)
    zip = fixDocxXML(zip);

    // Docxtemplater 인스턴스 생성
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '', // 빈 값을 빈 문자열로 처리
      delimiters: {
        start: '{{',
        end: '}}'
      }
    });

    // 변수 설정
    doc.setData(variables);

    // 템플릿 렌더링
    try {
      doc.render();
    } catch (renderError) {
      if (renderError.properties && renderError.properties.errors) {
        console.error('렌더링 오류:', renderError.properties.errors);
        const firstError = renderError.properties.errors[0];
        throw new Error(`템플릿 오류: ${firstError.properties.explanation || firstError.message}`);
      }
      throw renderError;
    }

    // 생성된 문서를 Blob으로 반환
    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    return blob;
  } catch (error) {
    console.error('문서 생성 오류:', error);
    throw new Error(`문서 생성 실패: ${error.message}`);
  }
};

/**
 * 여러 학생의 문서를 생성하고 ZIP으로 패키징
 */
export const generateMultipleDocuments = async (formData, templateId, templateName, schoolName) => {
  try {
    // 1. 템플릿 파일 다운로드
    console.log('템플릿 다운로드 중...');
    const templateBlob = await downloadDoc(templateId);
    const templateData = await templateBlob.arrayBuffer();

    // 2. 유효한 학생 목록 필터링 (이름이 있는 학생만)
    const validStudents = formData.students.filter(s => s.name && s.name.trim() !== '');

    if (validStudents.length === 0) {
      throw new Error('문서를 생성할 학생이 없습니다.');
    }

    // 3. 단일 학생인 경우 - 바로 다운로드
    if (validStudents.length === 1) {
      console.log('단일 학생 문서 생성 중...');
      const student = validStudents[0];
      const variables = convertToTemplateVariables(formData, student, schoolName);
      const docBlob = await generateSingleDocument(templateData, variables);

      // 파일명 생성
      const fileName = `${templateName}_${student.name}.docx`;
      saveAs(docBlob, fileName);

      return {
        success: true,
        count: 1,
        fileName
      };
    }

    // 4. 여러 학생인 경우 - ZIP으로 패키징
    console.log(`${validStudents.length}명의 문서 생성 중...`);
    const zip = new JSZip();

    for (let i = 0; i < validStudents.length; i++) {
      const student = validStudents[i];
      console.log(`문서 생성 중... (${i + 1}/${validStudents.length}): ${student.name}`);

      const variables = convertToTemplateVariables(formData, student, schoolName);
      const docBlob = await generateSingleDocument(templateData, variables);

      // ZIP에 파일 추가
      const fileName = `${templateName}_${student.name}.docx`;
      zip.file(fileName, docBlob);
    }

    // 5. ZIP 파일 생성 및 다운로드
    console.log('ZIP 파일 생성 중...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFileName = `${templateName}_${validStudents.length}명.zip`;
    saveAs(zipBlob, zipFileName);

    return {
      success: true,
      count: validStudents.length,
      fileName: zipFileName
    };
  } catch (error) {
    console.error('문서 생성 실패:', error);
    throw error;
  }
};

/**
 * 실제 템플릿 기반 미리보기 HTML 생성 (첫 번째 학생)
 */
export const generatePreviewFromTemplate = async (formData, templateId, schoolName) => {
  try {
    if (!formData.students || formData.students.length === 0) {
      return '<p style="text-align: center; padding: 40px; color: #666;">학생 정보가 없습니다.</p>';
    }

    // 1. 템플릿 파일 다운로드
    console.log('템플릿 다운로드 중... (미리보기)');
    const templateBlob = await downloadDoc(templateId);
    const templateData = await templateBlob.arrayBuffer();

    // 2. 첫 번째 학생의 변수 생성
    const student = formData.students[0];
    const variables = convertToTemplateVariables(formData, student, schoolName);

    // 3. docxtemplater로 변수 치환
    let zip = new PizZip(templateData);

    // XML 정리 (분리된 태그 병합)
    zip = fixDocxXML(zip);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '', // 빈 값을 빈 문자열로 처리
      delimiters: {
        start: '{{',
        end: '}}'
      }
    });

    try {
      doc.setData(variables);
      doc.render();
    } catch (error) {
      // Docxtemplater 오류 상세 정보 출력
      if (error.properties && error.properties.errors) {
        console.error('Docxtemplater 상세 오류:', error.properties.errors);
        const firstError = error.properties.errors[0];
        throw new Error(`템플릿 변수 오류: ${firstError.properties.explanation || firstError.message}\n위치: ${firstError.properties.xtag || 'unknown'}`);
      }
      throw error;
    }

    // 4. 치환된 DOCX를 Blob으로 변환
    const generatedBlob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // 5. mammoth로 DOCX → HTML 변환
    const arrayBuffer = await generatedBlob.arrayBuffer();
    const result = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Title'] => h1.title:fresh",
        ],
      }
    );

    // 6. HTML에 기본 스타일 추가
    const styledHTML = `
      <div style="font-family: 'Malgun Gothic', '맑은 고딕', 'Noto Sans KR', sans-serif; padding: 40px; max-width: 210mm; margin: 0 auto; background: white; line-height: 1.6;">
        ${result.value}
      </div>
    `;

    // 경고 메시지가 있으면 콘솔에 출력
    if (result.messages.length > 0) {
      console.warn('Mammoth 변환 경고:', result.messages);
    }

    return styledHTML;
  } catch (error) {
    console.error('미리보기 생성 오류:', error);
    return `<p style="text-align: center; padding: 40px; color: #e74c3c;">미리보기 생성 실패: ${error.message}</p>`;
  }
};

/**
 * 폴백용 간단한 미리보기 HTML 생성 (템플릿 다운로드 실패 시)
 */
export const generatePreviewHTML = (formData, schoolName, templateName) => {
  if (!formData.students || formData.students.length === 0) {
    return '<p>학생 정보가 없습니다.</p>';
  }

  const student = formData.students[0];
  const variables = convertToTemplateVariables(formData, student, schoolName);

  return `
    <div style="font-family: 'Noto Sans KR', sans-serif; padding: 40px; max-width: 210mm; margin: 0 auto; background: white;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">${variables.sc}</h1>
        <h2 style="font-size: 20px; font-weight: bold; text-decoration: underline;">${templateName}</h2>
      </div>

      <div style="margin-bottom: 30px; text-align: right;">
        <p>작성일: ${variables.ty}년 ${variables.tm}월 ${variables.td}일</p>
      </div>

      <div style="border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 20px; margin: 30px 0;">
        <p style="margin: 8px 0;"><strong style="display: inline-block; width: 100px;">학년/반:</strong> ${variables.g}학년 ${variables.c}반</p>
        <p style="margin: 8px 0;"><strong style="display: inline-block; width: 100px;">번호:</strong> ${variables.sn}번</p>
        <p style="margin: 8px 0;"><strong style="display: inline-block; width: 100px;">이름:</strong> ${variables.nm}</p>
      </div>

      ${variables.sy && variables.ey ? `
        <div style="margin: 30px 0;">
          <p style="margin: 8px 0;"><strong>결석 기간:</strong></p>
          <p style="margin: 8px 0; margin-left: 20px;">
            ${variables.sy}년 ${variables.sm}월 ${variables.sd}일부터
            ${variables.sum ? `(${variables.sum}일간)` : ''}
          </p>
          <p style="margin: 8px 0; margin-left: 20px;">
            ${variables.ey}년 ${variables.em}월 ${variables.ed}일까지
          </p>
        </div>
      ` : ''}

      ${variables.r ? `
        <div style="margin: 30px 0;">
          <p style="margin: 8px 0;"><strong>사유:</strong> ${variables.r}</p>
        </div>
      ` : ''}

      ${variables.d ? `
        <div style="margin: 30px 0;">
          <p style="margin: 8px 0;"><strong>첨부 서류:</strong> ${variables.d}</p>
        </div>
      ` : ''}

      <div style="margin-top: 60px; text-align: center;">
        <p style="margin-bottom: 40px;">위와 같이 신청합니다.</p>
        <p style="font-size: 18px; font-weight: bold;">담임교사: ${variables.tn || '(서명)'}</p>
      </div>
    </div>
  `;
};
