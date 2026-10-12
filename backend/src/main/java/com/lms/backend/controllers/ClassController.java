package com.lms.backend.controllers;

import com.lms.backend.Dtos.ClassRequestDto;
import com.lms.backend.Dtos.ClassResponseDto;
import com.lms.backend.services.ClassService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** All routes are ADMIN only (see SecurityConfig). */
@RestController
@RequestMapping("/api")
public class ClassController {
    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    @GetMapping("/classes")
    public List<ClassResponseDto> allClasses() {
        return classService.allClasses();
    }

    @PostMapping("/classes")
    public ResponseEntity<ClassResponseDto> createClass(@RequestBody ClassRequestDto body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classService.createClass(body));
    }

    @PutMapping("/classes/{id}")
    public ClassResponseDto updateClass(@PathVariable Long id, @RequestBody ClassRequestDto body) {
        return classService.updateClass(id, body);
    }

    @DeleteMapping("/classes/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id) {
        classService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/classes/{classId}/courses/{courseId}")
    public ClassResponseDto addCourseToClass(@PathVariable Long classId, @PathVariable Long courseId) {
        return classService.addCourseToClass(classId, courseId);
    }

    @DeleteMapping("/classes/{classId}/courses/{courseId}")
    public ClassResponseDto removeCourseFromClass(@PathVariable Long classId, @PathVariable Long courseId) {
        return classService.removeCourseFromClass(classId, courseId);
    }
}
