package io.dedny.jwlabs.absent.schools.service;

import io.dedny.jwlabs.absent.schools.dto.SchoolRequest;
import io.dedny.jwlabs.absent.schools.dto.SchoolResponse;
import io.dedny.jwlabs.absent.schools.entity.School;
import io.dedny.jwlabs.absent.schools.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SchoolService {

    private final SchoolRepository schoolRepository;

    @Transactional
    public SchoolResponse createSchool(SchoolRequest request) {
        School school = School.builder()
                .name(request.getName())
                .build();
        School savedSchool = schoolRepository.save(school);
        return SchoolResponse.from(savedSchool);
    }

    public List<SchoolResponse> getAllSchools() {
        return schoolRepository.findAll()
                .stream()
                .map(SchoolResponse::from)
                .collect(Collectors.toList());
    }

    public SchoolResponse getSchoolById(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("School not found with id: " + id));
        return SchoolResponse.from(school);
    }

    @Transactional
    public void deleteSchool(Long id) {
        if (!schoolRepository.existsById(id)) {
            throw new IllegalArgumentException("School not found with id: " + id);
        }
        schoolRepository.deleteById(id);
    }
}