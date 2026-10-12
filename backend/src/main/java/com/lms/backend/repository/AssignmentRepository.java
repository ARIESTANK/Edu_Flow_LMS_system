package com.lms.backend.repository;
import com.lms.backend.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourse_Id(Long courseId);
    List<Assignment> findByCourse_IdAndClassEntity_Id(Long courseId, Long classId);
    List<Assignment> findByCreatedBy_Id(Long teacherId);
    List<Assignment> findByStudent_Id(Long studentId);
    List<Assignment> findByCourse_IdAndStudent_Id(Long courseId, Long studentId);
    List<Assignment> findByCourse_IdAndStudent_IdAndPublishedTrue(Long courseId, Long studentId);
    
    @Query("select a from Assignment a where a.course.id = :courseId and a.classEntity.id = :classId and a.published = true")
    List<Assignment> findPublishedByCourseAndClass(@Param("courseId") Long courseId, @Param("classId") Long classId);
    
    @Query("select a from Assignment a where a.course.id = :courseId and a.published = true")
    List<Assignment> findPublishedByCourse(@Param("courseId") Long courseId);
    
    @Query("select a from Assignment a where a.id = :assignmentId and a.student.id = :studentId")
    Optional<Assignment> findByIdAndStudent(@Param("assignmentId") Long assignmentId, @Param("studentId") Long studentId);
}