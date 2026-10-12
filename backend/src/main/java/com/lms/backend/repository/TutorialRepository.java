package com.lms.backend.repository;
import com.lms.backend.entity.Tutorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface TutorialRepository extends JpaRepository<Tutorial, Long> {
    List<Tutorial> findByCourse_Id(Long courseId);
    List<Tutorial> findByCourse_IdAndClassEntity_Id(Long courseId, Long classId);
    List<Tutorial> findByCreatedBy_Id(Long teacherId);
    List<Tutorial> findByStudent_Id(Long studentId);
    List<Tutorial> findByCourse_IdAndStudent_Id(Long courseId, Long studentId);
    List<Tutorial> findByCourse_IdAndStudent_IdAndPublishedTrue(Long courseId, Long studentId);
    
    @Query("select t from Tutorial t where t.course.id = :courseId and t.classEntity.id = :classId and t.published = true")
    List<Tutorial> findPublishedByCourseAndClass(@Param("courseId") Long courseId, @Param("classId") Long classId);
    
    @Query("select t from Tutorial t where t.course.id = :courseId and t.published = true")
    List<Tutorial> findPublishedByCourse(@Param("courseId") Long courseId);
    
    @Query("select t from Tutorial t where t.id = :tutorialId and t.student.id = :studentId")
    Optional<Tutorial> findByIdAndStudent(@Param("tutorialId") Long tutorialId, @Param("studentId") Long studentId);
}