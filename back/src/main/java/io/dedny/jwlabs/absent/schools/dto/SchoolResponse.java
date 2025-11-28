package io.dedny.jwlabs.absent.schools.dto;

import io.dedny.jwlabs.absent.schools.entity.School;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolResponse {
    private Long id;
    private String name;

    public static SchoolResponse from(School school) {
        return SchoolResponse.builder()
                .id(school.getId())
                .name(school.getName())
                .build();
    }
}