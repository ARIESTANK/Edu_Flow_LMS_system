package com.lms.backend.repository;
import com.lms.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.lms.backend.Dtos.CourseCreate;
import java.util.*;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findAll();
    List<Course> findByGradeNo(Integer gradeNo);
    Optional<Course> findByCodeIgnoreCase(String code);
    Optional<Course> findByTitleIgnoreCase(String title);

    @Query("select c from Course c join c.classes cl where cl.id = :classId")
    List<Course> findByClassId(@Param("classId") Long classId);


    default Course createCourse(CourseCreate courseCreate){
        Course newCourse=new Course();
        newCourse.setTitle((courseCreate.getTitle()));
        newCourse.setGradeNo(courseCreate.getGradeNo());
        newCourse.setCode(courseCreate.getCode());
        return save(newCourse);
    }


}

