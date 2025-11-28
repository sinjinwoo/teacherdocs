package io.dedny.jwlabs.absent.docs.service;

import io.dedny.jwlabs.absent.docs.dto.DocsResponse;
import io.dedny.jwlabs.absent.docs.dto.DocsUploadRequest;
import io.dedny.jwlabs.absent.docs.entity.Docs;
import io.dedny.jwlabs.absent.docs.entity.Docs.TemplateVariable;
import io.dedny.jwlabs.absent.schools.entity.School;
import io.dedny.jwlabs.absent.docs.repository.DocsRepository;
import io.dedny.jwlabs.absent.schools.repository.SchoolRepository;
import io.dedny.jwlabs.absent.util.DocxTemplateParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocsService {

    private final DocsRepository docsRepository;
    private final SchoolRepository schoolRepository;
    private final DocxTemplateParser templateParser;

    @Transactional
    public DocsResponse uploadDocs(DocsUploadRequest request, MultipartFile file) throws IOException {
        School school = schoolRepository.findById(request.getSchoolId())
                .orElseThrow(() -> new IllegalArgumentException("School not found with id: " + request.getSchoolId()));

        byte[] fileData = file.getBytes();

        // variables가 제공되지 않았으면 자동 추출
        List<TemplateVariable> variables = request.getVariables();
        if (variables == null || variables.isEmpty()) {
            log.info("No variables provided, extracting from DOCX file...");
            variables = templateParser.extractVariables(fileData);
            log.info("Extracted {} variables from template", variables.size());
        }

        Docs docs = Docs.builder()
                .name(request.getName())
                .school(school)
                .fileData(fileData)
                .variables(variables)
                .build();

        Docs savedDocs = docsRepository.save(docs);
        return DocsResponse.from(savedDocs);
    }

    public List<DocsResponse> getDocsBySchool(Long schoolId) {
        return docsRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId)
                .stream()
                .map(DocsResponse::from)
                .collect(Collectors.toList());
    }

    public DocsResponse getDocsById(Long id) {
        Docs docs = docsRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Docs not found with id: " + id));
        return DocsResponse.from(docs);
    }

    public byte[] downloadDocs(Long id) {
        Docs docs = docsRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Docs not found with id: " + id));
        return docs.getFileData();
    }

    @Transactional
    public void deleteDocs(Long id) {
        if (!docsRepository.existsById(id)) {
            throw new IllegalArgumentException("Docs not found with id: " + id);
        }
        docsRepository.deleteById(id);
    }

    public List<DocsResponse> getAllDocs() {
        return docsRepository.findAll()
                .stream()
                .map(DocsResponse::from)
                .collect(Collectors.toList());
    }
}