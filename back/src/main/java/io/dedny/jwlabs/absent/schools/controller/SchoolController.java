package io.dedny.jwlabs.absent.schools.controller;

import io.dedny.jwlabs.absent.schools.dto.SchoolRequest;
import io.dedny.jwlabs.absent.schools.dto.SchoolResponse;
import io.dedny.jwlabs.absent.schools.service.SchoolService;
import kr.co.ouroboros.core.global.annotation.ApiState;
import kr.co.ouroboros.core.global.annotation.ApiState.State;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;

    @ApiState(state = State.COMPLETED)
    @PostMapping
    public ResponseEntity<SchoolResponse> createSchool(@RequestBody SchoolRequest request) {
        SchoolResponse response = schoolService.createSchool(request);
        return ResponseEntity.ok(response);
    }

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

    @ApiState(state = State.COMPLETED)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchool(@PathVariable Long id) {
        schoolService.deleteSchool(id);
        return ResponseEntity.noContent().build();
    }
}
