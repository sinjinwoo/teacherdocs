package io.dedny.jwlabs.absent.schools.controller;

import io.dedny.jwlabs.absent.schools.dto.SchoolRequest;
import io.dedny.jwlabs.absent.schools.dto.SchoolResponse;
import io.dedny.jwlabs.absent.schools.service.SchoolService;
import kr.co.ouroboros.core.global.annotation.ApiState;
import kr.co.ouroboros.core.global.annotation.ApiState.State;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;

    @ApiState(state = State.COMPLETED)
    @GetMapping
    public ResponseEntity<List<SchoolResponse>> getAllSchools() {
        List<SchoolResponse> schools = schoolService.getAllSchools();
        return ResponseEntity.ok(schools);
    }

    @ApiState(state = State.COMPLETED)
    @GetMapping("/{id}")
    public ResponseEntity<SchoolResponse> getSchoolById(@PathVariable Long id) {
        SchoolResponse school = schoolService.getSchoolById(id);
        return ResponseEntity.ok(school);
    }


    // 이름으로 검색
    @ApiState(state = State.COMPLETED)
    @GetMapping("/search")
    public ResponseEntity<List<SchoolResponse>> searchSchools(@RequestParam String name) {
        List<SchoolResponse> schools = schoolService.searchByName(name);
        return ResponseEntity.ok(schools);
    }

    // CSV 임포트
    @ApiState(state = State.COMPLETED)
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importCsv(@RequestParam("file") MultipartFile file) {
        try {
            int count = schoolService.importFromCsv(file);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", count);
            response.put("message", count + "개 학교 데이터 임포트 완료");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "CSV 임포트 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

}
