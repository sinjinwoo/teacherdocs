package io.dedny.jwlabs.absent.docs.repository;

import io.dedny.jwlabs.absent.docs.entity.Docs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocsRepository extends JpaRepository<Docs, Long> {
    List<Docs> findBySchoolId(Long schoolId);
    List<Docs> findBySchoolIdOrderByCreatedAtDesc(Long schoolId);

    // 내 문서 목록 조회 (user_id 인덱스 활용)
    List<Docs> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 문서명 검색 (name GIN 인덱스 활용)
    List<Docs> findByNameContainingOrderByCreatedAtDesc(String name);
}