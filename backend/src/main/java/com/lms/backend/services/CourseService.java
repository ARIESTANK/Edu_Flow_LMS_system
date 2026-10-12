package com.lms.backend.services;

import com.lms.backend.Dtos.CourseCreate;
import com.lms.backend.Dtos.CourseResponseDto;
import com.lms.backend.Dtos.CourseUpdate;
import com.lms.backend.Dtos.StudentCourseDto;
import com.lms.backend.Enum.User.Role;
import com.lms.backend.entity.Course;
import com.lms.backend.entity.Class;
import com.lms.backend.entity.Enrollment;
import com.lms.backend.entity.Teaches;
import com.lms.backend.repository.CourseRepository;
import com.lms.backend.repository.ClassRepository;
import com.lms.backend.repository.EnrollmentRepository;
import com.lms.backend.repository.TeachesRepository;
import com.lms.backend.security.AuthUser;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class CourseService {
    private static final Pattern CODE = Pattern.compile("^[A-Za-z]{2,4}\\d{2,4}$");

    private final CourseRepository courseRepository;
    private final ClassRepository classRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TeachesRepository teachesRepository;

    public CourseService(CourseRepository courseRepository, ClassRepository classRepository,
                         EnrollmentRepository enrollmentRepository,
                         TeachesRepository teachesRepository) {
        this.courseRepository = courseRepository;
        this.classRepository = classRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.teachesRepository = teachesRepository;
    }

    // ===== get requests =====
    /**
     * Admins and teachers see every course. A student sees only the courses of their own grade,
     * and nothing at all while they have no enrollment.
     */
    public List<CourseResponseDto> allCourses(AuthUser caller) {
        if (isStudent(caller)) {
            Optional<Integer> grade = studentGrade(caller.userId());
            if (grade.isEmpty()) return List.of();
            return courseRepository.findByGradeNo(grade.get()).stream().map(this::toDto).toList();
        }
        return courseRepository.findAll().stream().map(this::toDto).toList();
    }

    /** The signed-in student's courses (every course of their enrollment's grade) with the assigned teachers. Empty if not enrolled. */
    public List<StudentCourseDto> myCourses(AuthUser caller) {
        if (!isStudent(caller)) return List.of();

        Optional<Integer> grade = studentGrade(caller.userId());
        if (grade.isEmpty()) return List.of();

        List<Course> courses = courseRepository.findByGradeNo(grade.get());
        if (courses.isEmpty()) return List.of();

        Map<Long, List<String>> teachers = new HashMap<>();
        for (Teaches t : teachesRepository.findByCourse_IdIn(courses.stream().map(Course::getId).toList())) {
            if (t.getTeacher() == null || t.getCourse() == null) continue;
            teachers.computeIfAbsent(t.getCourse().getId(), k -> new ArrayList<>())
                    .add(t.getTeacher().getUsername());
        }

        return courses.stream()
                .map(c -> new StudentCourseDto(c.getId(), c.getTitle(), c.getCode(), c.getGradeNo(),
                        teachers.getOrDefault(c.getId(), List.of())))
                .toList();
    }

    public CourseResponseDto getCourse(Long id, AuthUser caller) {
        Course course = find(id);
        if (isStudent(caller)) {
            Optional<Integer> grade = studentGrade(caller.userId());
            if (grade.isEmpty() || !Objects.equals(grade.get(), course.getGradeNo())) throw notFound();
        }
        return toDto(course);
    }

    /** Get courses for a specific class (admin/teacher use). */
    public List<CourseResponseDto> getCoursesByClass(Long classId) {
        Optional<Class> classOpt = classRepository.findByIdWithCourses(classId);
        if (classOpt.isEmpty()) return List.of();
        return classOpt.get().getCourses().stream().map(this::toDto).toList();
    }

    // ===== post requests =====
    public CourseResponseDto createCourse(CourseCreate in) {
        String title = clean(in.getTitle());
        String code = clean(in.getCode()).toUpperCase();
        validate(title, code, in.getGradeNo());

        courseRepository.findByCodeIgnoreCase(code).ifPresent(c -> { throw conflict("A course with this code already exists."); });
        courseRepository.findByTitleIgnoreCase(title).ifPresent(c -> { throw conflict("A course with this title already exists."); });

        Course course = new Course();
        course.setTitle(title);
        course.setCode(code);
        course.setGradeNo(in.getGradeNo());
        return toDto(courseRepository.save(course));
    }

    // ===== put requests =====
    public CourseResponseDto updateCourse(Long id, CourseUpdate in) {
        Course course = find(id);
        if (in == null) throw bad("Request body is required.");

        String title = clean(in.getTitle());
        String code = clean(in.getCode()).toUpperCase();
        validate(title, code, in.getGradeNo());

        courseRepository.findByCodeIgnoreCase(code).filter(c -> !c.getId().equals(id))
                .ifPresent(c -> { throw conflict("Another course already uses this code."); });
        courseRepository.findByTitleIgnoreCase(title).filter(c -> !c.getId().equals(id))
                .ifPresent(c -> { throw conflict("Another course already uses this title."); });

        course.setTitle(title);
        course.setCode(code);
        course.setGradeNo(in.getGradeNo());
        return toDto(courseRepository.save(course));
    }

    // ===== delete requests =====
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) throw notFound();
        try {
            courseRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw conflict("This course is still assigned to a teacher or a class. Remove that first.");
        }
    }

    // ===== helpers =====
    private static boolean isStudent(AuthUser caller) {
        return caller != null && caller.role() == Role.STUDENT;
    }

    private Optional<Integer> studentGrade(Long userId) {
        return enrollmentRepository.findByUser_Id(userId).stream()
                .map(Enrollment::getGradeNo).filter(Objects::nonNull).findFirst();
    }

    private Course find(Long id) {
        return courseRepository.findById(id).orElseThrow(this::notFound);
    }

    private void validate(String title, String code, Integer gradeNo) {
        if (title.length() < 3 || title.length() > 150) throw bad("Enter a course title (3 to 150 characters).");
        if (!CODE.matcher(code).matches()) throw bad("Use a course code like CS101.");
        if (gradeNo == null || gradeNo < 1 || gradeNo > 12) throw bad("Choose a grade from 1 to 12.");
    }

    private CourseResponseDto toDto(Course c) {
        return new CourseResponseDto(c.getId(), c.getTitle(), c.getCode(), c.getGradeNo());
    }

    private static String clean(String s) { return s == null ? "" : s.trim(); }
    private ResponseStatusException notFound() { return new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found."); }
    private static ResponseStatusException bad(String m) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, m); }
    private static ResponseStatusException conflict(String m) { return new ResponseStatusException(HttpStatus.CONFLICT, m); }
}
