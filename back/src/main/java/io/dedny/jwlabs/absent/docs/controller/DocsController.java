package io.dedny.jwlabs.absent.docs.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.dedny.jwlabs.absent.docs.dto.DocsResponse;
import io.dedny.jwlabs.absent.docs.dto.DocsUploadRequest;
import io.dedny.jwlabs.absent.docs.service.DocsService;
import kr.co.ouroboros.core.global.annotation.ApiState;
import kr.co.ouroboros.core.global.annotation.ApiState.State;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/docs")
@RequiredArgsConstructor
public class DocsController {

    private final DocsService docsService;
    private final ObjectMapper objectMapper;

    @ApiState(state = State.COMPLETED)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocsResponse> uploadDocs(
            @RequestPart("data") String data,
            @RequestPart("file") MultipartFile file) throws IOException {

        // 디버깅: 받은 데이터 확인
        System.out.println("=== Received data ===");
        System.out.println("data: " + data);
        System.out.println("data type: " + data.getClass().getName());
        System.out.println("data length: " + data.length());
        System.out.println("=====================");

        DocsUploadRequest request = objectMapper.readValue(data, DocsUploadRequest.class);
        DocsResponse response = docsService.uploadDocs(request, file);
        return ResponseEntity.ok(response);
    }

    @ApiState(state = State.COMPLETED)
    @GetMapping
    public ResponseEntity<List<DocsResponse>> getAllDocs() {
        List<DocsResponse> docs = docsService.getAllDocs();
        return ResponseEntity.ok(docs);
    }

    @ApiState(state = State.COMPLETED)
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<DocsResponse>> getDocsBySchool(@PathVariable Long schoolId) {
        List<DocsResponse> docs = docsService.getDocsBySchool(schoolId);
        return ResponseEntity.ok(docs);
    }

    @ApiState(state = State.COMPLETED)
    @GetMapping("/{id}")
    public ResponseEntity<DocsResponse> getDocsById(@PathVariable Long id) {
        DocsResponse docs = docsService.getDocsById(id);
        return ResponseEntity.ok(docs);
    }

    @ApiState(state = State.COMPLETED)
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocs(@PathVariable Long id) {
        DocsResponse docsInfo = docsService.getDocsById(id);
        byte[] fileData = docsService.downloadDocs(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + docsInfo.getName() + ".docx\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(fileData);
    }

    @ApiState(state = State.COMPLETED)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocs(@PathVariable Long id) {
        docsService.deleteDocs(id);
        return ResponseEntity.noContent().build();
    }
}