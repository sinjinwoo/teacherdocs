package io.dedny.jwlabs.absent.docs.repository;

import io.dedny.jwlabs.absent.docs.entity.Docs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocsRepository extends JpaRepository<Docs, Long> {
    List<Docs> findBySchoolId(Long schoolId);
    List<Docs> findBySchoolIdOrderByCreatedAtDesc(Long schoolId);
}