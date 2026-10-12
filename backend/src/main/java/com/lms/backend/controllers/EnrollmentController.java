package com.lms.backend.controllers;

import com.lms.backend.Dtos.EnrollmentCreateDto;
import com.lms.backend.Dtos.EnrollmentMoveDto;
import com.lms.backend.Dtos.EnrollmentResponseDto;
import com.lms.backend.Dtos.EnrollmentResultDto;
import com.lms.backend.Dtos.MyEnrollmentDto;
import com.lms.backend.security.AuthUser;
import com.lms.backend.services.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** /api/enrollments/** is ADMIN only (see SecurityConfig). /api/me/enrollment is for the signed-in user. */
@RestController
@RequestMapping("/api")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    // GET /api/me/enrollment   the signed-in student's own enrollment (any signed-in user)
    @GetMapping("/me/enrollment")
    public MyEnrollmentDto myEnrollment(@AuthenticationPrincipal AuthUser me) {
        return enrollmentService.myEnrollment(me.userId());
    }

    // GET /api/enrollments            all
    // GET /api/enrollments?classId=3  one class
    @GetMapping("/enrollments")
    public List<EnrollmentResponseDto> list(@RequestParam(required = false) Long classId) {
        return enrollmentService.list(classId);
    }

    // POST /api/enrollments  { classId, studentIds: [..] }
    @PostMapping("/enrollments")
    public ResponseEntity<EnrollmentResultDto> enroll(@RequestBody EnrollmentCreateDto body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentService.enroll(body));
    }

    // PUT /api/enrollments/{id}  { classId }   move to another class
    @PutMapping("/enrollments/{id}")
    public EnrollmentResponseDto move(@PathVariable Long id, @RequestBody EnrollmentMoveDto body) {
        return enrollmentService.move(id, body);
    }

    @DeleteMapping("/enrollments/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        enrollmentService.remove(id);
        return ResponseEntity.noContent().build();
    }
}
