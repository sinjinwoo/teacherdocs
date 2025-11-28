package io.dedny.jwlabs.absent.docs.dto;

import io.dedny.jwlabs.absent.docs.entity.Docs;
import io.dedny.jwlabs.absent.docs.entity.Docs.TemplateVariable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocsResponse {
    private Long id;
    private String name;
    private Long schoolId;
    private String schoolName;
    private List<TemplateVariable> variables;
    private Long fileSize;
    private LocalDateTime createdAt;

    public static DocsResponse from(Docs docs) {
        return DocsResponse.builder()
                .id(docs.getId())
                .name(docs.getName())
                .schoolId(docs.getSchool().getId())
                .schoolName(docs.getSchool().getName())
                .variables(docs.getVariables())
                .fileSize(docs.getFileData() != null ? (long) docs.getFileData().length : 0L)
                .createdAt(docs.getCreatedAt())
                .build();
    }
}