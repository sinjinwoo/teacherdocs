package io.dedny.jwlabs.absent.util;

import io.dedny.jwlabs.absent.docs.entity.Docs.TemplateVariable;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * DOCX 파일에서 {{variableName}} 형식의 자리표시자를 추출하는 유틸리티
 */
@Slf4j
@Component
public class DocxTemplateParser {

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}");

    /**
     * DOCX 파일에서 모든 자리표시자 추출
     * @param fileData DOCX 바이너리 데이터
     * @return 추출된 변수 목록
     */
    public List<TemplateVariable> extractVariables(byte[] fileData) throws IOException {
        Set<String> variableKeys = new LinkedHashSet<>();

        try (ByteArrayInputStream bis = new ByteArrayInputStream(fileData);
             XWPFDocument document = new XWPFDocument(bis)) {

            // 1. 본문 단락에서 추출
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                String text = paragraph.getText();
                extractVariablesFromText(text, variableKeys);
            }

            // 2. 표(Table)에서 추출
            for (XWPFTable table : document.getTables()) {
                for (XWPFTableRow row : table.getRows()) {
                    for (XWPFTableCell cell : row.getTableCells()) {
                        String text = cell.getText();
                        extractVariablesFromText(text, variableKeys);
                    }
                }
            }

            // 3. 헤더에서 추출
            for (XWPFHeader header : document.getHeaderList()) {
                for (XWPFParagraph paragraph : header.getParagraphs()) {
                    String text = paragraph.getText();
                    extractVariablesFromText(text, variableKeys);
                }
            }

            // 4. 푸터에서 추출
            for (XWPFFooter footer : document.getFooterList()) {
                for (XWPFParagraph paragraph : footer.getParagraphs()) {
                    String text = paragraph.getText();
                    extractVariablesFromText(text, variableKeys);
                }
            }
        }

        log.info("Extracted {} variables from DOCX: {}", variableKeys.size(), variableKeys);

        // Set을 List<TemplateVariable>로 변환
        List<TemplateVariable> variables = new ArrayList<>();
        for (String key : variableKeys) {
            variables.add(new TemplateVariable(key, true)); // 기본값: required=true
        }

        return variables;
    }

    /**
     * 텍스트에서 {{variableName}} 패턴 추출
     */
    private void extractVariablesFromText(String text, Set<String> variableKeys) {
        if (text == null || text.isEmpty()) {
            return;
        }

        Matcher matcher = VARIABLE_PATTERN.matcher(text);
        while (matcher.find()) {
            String variableName = matcher.group(1).trim();
            variableKeys.add(variableName);
        }
    }

    /**
     * 추출된 변수 목록이 비어있는지 확인
     */
    public boolean hasVariables(List<TemplateVariable> variables) {
        return variables != null && !variables.isEmpty();
    }
}