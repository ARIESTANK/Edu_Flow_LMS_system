package com.lms.backend.repository;
import com.lms.backend.entity.Teaches;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TeachesRepository extends JpaRepository<Teaches, Long> {
    Optional<Teaches> findByTeacher_IdAndCourse_Id(Long teacherId, Long courseId);
    List<Teaches> findByCourse_IdIn(Collection<Long> courseIds);
}
