-- ================================================================
-- Spring Boot 초기화 스크립트 (자동 실행)
-- GIN 인덱스 설정
-- ================================================================

-- pg_trgm 확장 설치
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN 인덱스 생성 (이미 존재하면 무시)
CREATE INDEX IF NOT EXISTS idx_school_name_gin
ON schools USING gin(name gin_trgm_ops);
