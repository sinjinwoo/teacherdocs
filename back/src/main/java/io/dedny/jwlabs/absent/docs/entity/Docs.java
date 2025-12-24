package io.dedny.jwlabs.absent.docs.entity;

import io.dedny.jwlabs.absent.schools.entity.School;
import io.dedny.jwlabs.absent.users.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "docs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Docs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @JdbcTypeCode(SqlTypes.VARBINARY)
    @Column(nullable = false, columnDefinition = "BYTEA")
    private byte[] fileData;

    /**
     * 템플릿 자리표시자 정보
     * 예: [{"key":"studentName", "required":true}, {"key":"date", "required":true}]
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<TemplateVariable> variables;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TemplateVariable {
        private String key;
        private String label;
        private Boolean required;
        private Double x;
        private Double y;
        private Integer fontSize;
        private String color;
    }
}
