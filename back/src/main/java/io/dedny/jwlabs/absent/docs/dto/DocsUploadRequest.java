package io.dedny.jwlabs.absent.docs.dto;

import io.dedny.jwlabs.absent.docs.entity.Docs.TemplateVariable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 문서 업로드 요청 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DocsUploadRequest {
    /** 문서명 (필수) */
    private String name;

    /** 학교 ID (필수) */
    private Long schoolId;

    /**
     * 템플릿 변수 목록 (선택)
     * null이거나 비어있으면 DOCX 파일에서 자동으로 추출됨
     */
    private List<TemplateVariable> variables;
}