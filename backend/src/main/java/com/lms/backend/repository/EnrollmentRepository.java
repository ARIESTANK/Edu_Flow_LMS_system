package com.lms.backend.repository;
import com.lms.backend.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByClassEntity_Id(Long classId);
    List<Enrollment> findByUser_Id(Long userId);
    @Query("select e from Enrollment e left join fetch e.classEntity where e.user.id = :userId")
    List<Enrollment> findByUserIdWithClass(@Param("userId") Long userId);

    /** rows of [classId, studentCount] */
    @Query("select e.classEntity.id, count(e) from Enrollment e group by e.classEntity.id")
    List<Object[]> countPerClass();
}
