package com.lms.backend.repository;
import com.lms.backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourse_Id(Long courseId);
    List<Lesson> findByCourse_IdAndClassEntity_Id(Long courseId, Long classId);
    List<Lesson> findByCreatedBy_Id(Long teacherId);
    
    @Query("select l from Lesson l where l.course.id = :courseId and l.classEntity.id = :classId and l.published = true")
    List<Lesson> findPublishedByCourseAndClass(@Param("courseId") Long courseId, @Param("classId") Long classId);
    
    @Query("select l from Lesson l where l.course.id = :courseId and l.published = true")
    List<Lesson> findPublishedByCourse(@Param("courseId") Long courseId);
}