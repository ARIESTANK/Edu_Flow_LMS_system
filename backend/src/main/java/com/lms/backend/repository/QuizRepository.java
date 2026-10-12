package com.lms.backend.repository;
import com.lms.backend.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCourse_Id(Long courseId);
    List<Quiz> findByCourse_IdAndClassEntity_Id(Long courseId, Long classId);
    List<Quiz> findByCreatedBy_Id(Long teacherId);
    
    @Query("select q from Quiz q where q.course.id = :courseId and q.classEntity.id = :classId and q.published = true")
    List<Quiz> findPublishedByCourseAndClass(@Param("courseId") Long courseId, @Param("classId") Long classId);
    
    @Query("select q from Quiz q where q.course.id = :courseId and q.published = true")
    List<Quiz> findPublishedByCourse(@Param("courseId") Long courseId);
    
    @Query("select q from Quiz q left join fetch q.course where q.id = :id")
    Optional<Quiz> findByIdWithCourse(@Param("id") Long id);
}