package com.lms.backend.services;

import com.lms.backend.Dtos.ClassRequestDto;
import com.lms.backend.Dtos.ClassResponseDto;
import com.lms.backend.entity.Class;
import com.lms.backend.entity.Course;
import com.lms.backend.repository.ClassRepository;
import com.lms.backend.repository.CourseRepository;
import com.lms.backend.repository.EnrollmentRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class ClassService {
    private static final Pattern CODE = Pattern.compile("^[A-Za-z0-9][A-Za-z0-9 _-]{0,19}$");

    private final ClassRepository classRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public ClassService(ClassRepository classRepository, CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.classRepository = classRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public List<ClassResponseDto> allClasses() {
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : enrollmentRepository.countPerClass()) {
            counts.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
        }
        return classRepository.findAll().stream()
                .map(c -> toDto(c, counts.getOrDefault(c.getId(), 0L)))
                .toList();
    }

    public ClassResponseDto createClass(ClassRequestDto in) {
        String code = clean(in == null ? null : in.getCode());
        validate(code, in == null ? null : in.getGradeNo());

        classRepository.findByCodeIgnoreCase(code).ifPresent(c -> { throw conflict("A class with this code already exists."); });

        Class cls = new Class();
        cls.setCode(code);
        cls.setGradeNo(in.getGradeNo());
        return toDto(classRepository.save(cls), 0L);
    }

    public ClassResponseDto updateClass(Long id, ClassRequestDto in) {
        Class cls = find(id);
        String code = clean(in == null ? null : in.getCode());
        validate(code, in == null ? null : in.getGradeNo());

        classRepository.findByCodeIgnoreCase(code).filter(c -> !c.getId().equals(id))
                .ifPresent(c -> { throw conflict("Another class already uses this code."); });

        long students = enrollmentRepository.findByClassEntity_Id(id).size();
        if (students > 0 && !in.getGradeNo().equals(cls.getGradeNo())) {
            throw conflict("This class has " + students + " students. Move or remove them before changing its grade.");
        }

        cls.setCode(code);
        cls.setGradeNo(in.getGradeNo());
        return toDto(classRepository.save(cls), students);
    }

    public void deleteClass(Long id) {
        if (!classRepository.existsById(id)) throw notFound();
        int students = enrollmentRepository.findByClassEntity_Id(id).size();
        if (students > 0) throw conflict("This class still has " + students + " students. Remove or move them first.");
        try {
            classRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw conflict("This class is still referenced by other records.");
        }
    }

    /** Add a course to a class. */
    @Transactional
    public ClassResponseDto addCourseToClass(Long classId, Long courseId) {
        Class cls = find(classId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found."));
        
        if (cls.getCourses().contains(course)) {
            throw conflict("This course is already assigned to this class.");
        }
        
        cls.getCourses().add(course);
        return toDto(classRepository.save(cls), enrollmentRepository.findByClassEntity_Id(classId).size());
    }

    /** Remove a course from a class. */
    @Transactional
    public ClassResponseDto removeCourseFromClass(Long classId, Long courseId) {
        Class cls = find(classId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found."));
        
        cls.getCourses().remove(course);
        return toDto(classRepository.save(cls), enrollmentRepository.findByClassEntity_Id(classId).size());
    }

    private Class find(Long id) {
        return classRepository.findById(id).orElseThrow(this::notFound);
    }

    private void validate(String code, Integer gradeNo) {
        if (!CODE.matcher(code).matches()) throw bad("Class code can use letters, numbers, spaces, - and _ (up to 20 characters).");
        if (gradeNo == null || gradeNo < 1 || gradeNo > 12) throw bad("Choose a grade from 1 to 12.");
    }

    private ClassResponseDto toDto(Class c, long students) {
        return new ClassResponseDto(c.getId(), c.getCode(), c.getGradeNo(), students);
    }

    private static String clean(String s) { return s == null ? "" : s.trim(); }
    private ResponseStatusException notFound() { return new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found."); }
    private static ResponseStatusException bad(String m) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, m); }
    private static ResponseStatusException conflict(String m) { return new ResponseStatusException(HttpStatus.CONFLICT, m); }
}
