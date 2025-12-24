package io.dedny.jwlabs.absent.schools.service;

import io.dedny.jwlabs.absent.schools.dto.SchoolRequest;
import io.dedny.jwlabs.absent.schools.dto.SchoolResponse;
import io.dedny.jwlabs.absent.schools.entity.School;
import io.dedny.jwlabs.absent.schools.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
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

    // 이름 검색
    public List<SchoolResponse> searchByName(String name) {
        return schoolRepository.findByNameContaining(name)
                .stream()
                .map(SchoolResponse::from)
                .collect(Collectors.toList());
    }

    // CSV 임포트 (교육청 데이터 포맷)
    @Transactional
    public int importFromCsv(MultipartFile file) throws IOException {
        log.info("CSV 임포트 시작: {}", file.getOriginalFilename());

        List<School> schools = new ArrayList<>();

        // 교육청 CSV는 보통 EUC-KR 또는 CP949 인코딩
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), "EUC-KR"));
             CSVParser parser = new CSVParser(reader,
                     CSVFormat.DEFAULT.builder()
                             .setHeader()
                             .setSkipHeaderRecord(true)
                             .build())) {

            // 헤더 확인 로그
            log.info("CSV 헤더: {}", parser.getHeaderMap().keySet());

            for (CSVRecord record : parser) {
                try {
                    String schoolName = record.get("학교명");

                    // 학교명이 비어있지 않은 경우만 추가
                    if (schoolName != null && !schoolName.trim().isEmpty()) {
                        School school = School.builder()
                                .name(schoolName.trim())
                                .build();
                        schools.add(school);
                    }
                } catch (IllegalArgumentException e) {
                    log.error("'학교명' 컬럼을 찾을 수 없습니다. 사용 가능한 컬럼: {}", record.toMap().keySet());
                    throw new IOException("CSV 헤더에 '학교명' 컬럼이 없습니다.", e);
                }
            }
        } catch (Exception e) {
            log.error("CSV 파싱 실패", e);
            throw new IOException("CSV 파싱 실패: " + e.getMessage(), e);
        }

        // 배치 저장
        schoolRepository.saveAll(schools);
        log.info("CSV 임포트 완료: {} 개 학교 저장", schools.size());

        return schools.size();
    }

    // 전체 삭제 (재임포트용)
    @Transactional
    public void deleteAll() {
        long count = schoolRepository.count();
        schoolRepository.deleteAll();
        log.info("전체 학교 삭제: {} 개", count);
    }
}