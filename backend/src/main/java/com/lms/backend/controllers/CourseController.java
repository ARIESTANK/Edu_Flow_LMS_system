package com.lms.backend.controllers;

import com.lms.backend.Dtos.CourseCreate;
import com.lms.backend.Dtos.CourseResponseDto;
import com.lms.backend.Dtos.CourseUpdate;
import com.lms.backend.Dtos.StudentCourseDto;
import com.lms.backend.security.AuthUser;
import com.lms.backend.services.CourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CourseController {
    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // GET /api/courses          admin/teacher: all courses. Student: only their grade's courses (none if not enrolled)
    @GetMapping("/courses")
    public List<CourseResponseDto> getAllCourses(@AuthenticationPrincipal AuthUser caller) {
        return courseService.allCourses(caller);
    }

    // GET /api/courses?classId=1  courses for a specific class (admin/teacher)
    @GetMapping("/courses/class/{classId}")
    public List<CourseResponseDto> getCoursesByClass(@PathVariable Long classId, @AuthenticationPrincipal AuthUser caller) {
        return courseService.getCoursesByClass(classId);
    }

    // GET /api/me/courses      the signed-in student's own courses, with teachers (empty if not enrolled)
    @GetMapping("/me/courses")
    public List<StudentCourseDto> myCourses(@AuthenticationPrincipal AuthUser caller) {
        return courseService.myCourses(caller);
    }

    // GET /api/courses/{id}     same visibility rule
    @GetMapping("/courses/{id}")
    public CourseResponseDto getCourse(@PathVariable Long id, @AuthenticationPrincipal AuthUser caller) {
        return courseService.getCourse(id, caller);
    }

    // POST /api/courses         (ADMIN)
    @PostMapping("/courses")
    public ResponseEntity<CourseResponseDto> createCourse(@RequestBody CourseCreate newCourse) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourse(newCourse));
    }

    // PUT /api/courses/{id}     (ADMIN)
    @PutMapping("/courses/{id}")
    public CourseResponseDto updateCourse(@PathVariable Long id, @RequestBody CourseUpdate body) {
        return courseService.updateCourse(id, body);
    }

    // DELETE /api/courses/{id}  (ADMIN)
    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}
