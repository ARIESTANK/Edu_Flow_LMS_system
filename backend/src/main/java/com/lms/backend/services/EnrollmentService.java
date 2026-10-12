package com.lms.backend.services;

import com.lms.backend.Dtos.EnrollmentCreateDto;
import com.lms.backend.Dtos.EnrollmentMoveDto;
import com.lms.backend.Dtos.EnrollmentResponseDto;
import com.lms.backend.Dtos.EnrollmentResultDto;
import com.lms.backend.Dtos.MyEnrollmentDto;
import com.lms.backend.Enum.User.Role;
import com.lms.backend.entity.Class;
import com.lms.backend.entity.Enrollment;
import com.lms.backend.entity.User;
import com.lms.backend.repository.ClassRepository;
import com.lms.backend.repository.EnrollmentRepository;
import com.lms.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;

/**
 * Puts students into classes. The class's gradeNo is copied onto the enrollment, so each student's grade is stored.
 * Rule: a student can have only ONE enrollment. They cannot be enrolled again until that enrollment is removed
 * ("move" changes the class of the existing enrollment, it does not create a second one).
 */
@Service
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository, ClassRepository classRepository, UserRepository userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    /** @param classId optional filter */
    public List<EnrollmentResponseDto> list(Long classId) {
        List<Enrollment> rows = classId == null
                ? enrollmentRepository.findAll()
                : enrollmentRepository.findByClassEntity_Id(classId);
        return rows.stream().map(this::toDto).toList();
    }

    @Transactional
    public EnrollmentResultDto enroll(EnrollmentCreateDto in) {
        if (in == null || in.getClassId() == null) throw bad("Choose a class.");
        if (in.getStudentIds() == null || in.getStudentIds().isEmpty()) throw bad("Select at least one student.");

        Class cls = classRepository.findById(in.getClassId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found."));

        List<String> skipped = new ArrayList<>();
        int created = 0;

        for (Long studentId : new LinkedHashSet<>(in.getStudentIds())) {
            User student = studentId == null ? null : userRepository.findById(studentId).orElse(null);
            if (student == null) { skipped.add("User " + studentId + " was not found."); continue; }
            if (student.getRole() != Role.STUDENT) { skipped.add(student.getUsername() + " is not a student."); continue; }
            List<Enrollment> existing = enrollmentRepository.findByUser_Id(student.getId());
            if (!existing.isEmpty()) {
                Class current = existing.get(0).getClassEntity();
                skipped.add(student.getUsername() + " is already enrolled"
                        + (current == null ? "" : " in class " + current.getCode()) + ". Remove that enrollment first.");
                continue;
            }

            Enrollment e = new Enrollment();
            e.setUser(student);
            e.setClassEntity(cls);
            e.setGradeNo(cls.getGradeNo());   // the grade is stored with the enrollment
            e.setEnrollmentDate(new Date());
            enrollmentRepository.save(e);
            created++;
        }
        return new EnrollmentResultDto(created, skipped);
    }

    /** Moves a student to another class (their stored grade follows the new class). */
    public EnrollmentResponseDto move(Long id, EnrollmentMoveDto in) {
        Enrollment e = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found."));
        if (in == null || in.getClassId() == null) throw bad("Choose a class.");
        Class target = classRepository.findById(in.getClassId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found."));

        e.setClassEntity(target);
        e.setGradeNo(target.getGradeNo());
        return toDto(enrollmentRepository.save(e));
    }

    public void remove(Long id) {
        if (!enrollmentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found.");
        }
        enrollmentRepository.deleteById(id);
    }

    /** The signed-in student's own enrollment (enrolled=false when they have none). */
    public MyEnrollmentDto myEnrollment(Long userId) {
        return enrollmentRepository.findByUserIdWithClass(userId).stream().findFirst()
                .map(e -> new MyEnrollmentDto(true,
                        e.getClassEntity() == null ? null : e.getClassEntity().getId(),
                        e.getClassEntity() == null ? null : e.getClassEntity().getCode(),
                        e.getGradeNo()))
                .orElse(new MyEnrollmentDto(false, null, null, null));
    }

    private EnrollmentResponseDto toDto(Enrollment e) {
        User u = e.getUser();
        Class c = e.getClassEntity();
        Date d = e.getEnrollmentDate();
        return new EnrollmentResponseDto(e.getId(),
                u == null ? null : u.getId(), u == null ? "" : u.getUsername(), u == null ? "" : u.getEmail(),
                c == null ? null : c.getId(), c == null ? "" : c.getCode(),
                e.getGradeNo(), d == null ? null : Instant.ofEpochMilli(d.getTime()).toString());
    }

    private static ResponseStatusException bad(String m) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, m); }
    private static ResponseStatusException conflict(String m) { return new ResponseStatusException(HttpStatus.CONFLICT, m); }
}
