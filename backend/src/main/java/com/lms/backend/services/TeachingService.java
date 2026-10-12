package com.lms.backend.services;

import com.lms.backend.Dtos.TeachingRequestDto;
import com.lms.backend.Dtos.TeachingResponseDto;
import com.lms.backend.Enum.User.Role;
import com.lms.backend.entity.Course;
import com.lms.backend.entity.Teaches;
import com.lms.backend.entity.User;
import com.lms.backend.repository.CourseRepository;
import com.lms.backend.repository.TeachesRepository;
import com.lms.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** Assigns teachers to courses (the "teaches" table). */
@Service
public class TeachingService {
    private final TeachesRepository teachesRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public TeachingService(TeachesRepository teachesRepository, UserRepository userRepository, CourseRepository courseRepository) {
        this.teachesRepository = teachesRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    public List<TeachingResponseDto> all() {
        return teachesRepository.findAll().stream().map(this::toDto).toList();
    }

    public TeachingResponseDto assign(TeachingRequestDto in) {
        User teacher = teacher(in);
        Course course = course(in);
        teachesRepository.findByTeacher_IdAndCourse_Id(teacher.getId(), course.getId())
                .ifPresent(t -> { throw conflict(teacher.getUsername() + " already teaches " + course.getCode() + "."); });

        Teaches t = new Teaches();
        t.setTeacher(teacher);
        t.setCourse(course);
        return toDto(teachesRepository.save(t));
    }

    public TeachingResponseDto update(Long id, TeachingRequestDto in) {
        Teaches t = teachesRepository.findById(id).orElseThrow(this::notFound);
        User teacher = teacher(in);
        Course course = course(in);
        teachesRepository.findByTeacher_IdAndCourse_Id(teacher.getId(), course.getId())
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> { throw conflict(teacher.getUsername() + " already teaches " + course.getCode() + "."); });

        t.setTeacher(teacher);
        t.setCourse(course);
        return toDto(teachesRepository.save(t));
    }

    public void unassign(Long id) {
        if (!teachesRepository.existsById(id)) throw notFound();
        teachesRepository.deleteById(id);
    }

    private User teacher(TeachingRequestDto in) {
        if (in == null || in.getTeacherId() == null) throw bad("Choose a teacher.");
        User u = userRepository.findById(in.getTeacherId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found."));
        if (u.getRole() != Role.TEACHER) throw bad(u.getUsername() + " is not a teacher.");
        return u;
    }

    private Course course(TeachingRequestDto in) {
        if (in.getCourseId() == null) throw bad("Choose a course.");
        return courseRepository.findById(in.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found."));
    }

    private TeachingResponseDto toDto(Teaches t) {
        User teacher = t.getTeacher();
        Course course = t.getCourse();
        return new TeachingResponseDto(t.getId(),
                teacher == null ? null : teacher.getId(), teacher == null ? "" : teacher.getUsername(),
                course == null ? null : course.getId(), course == null ? "" : course.getTitle(),
                course == null ? "" : course.getCode(), course == null ? null : course.getGradeNo());
    }

    private ResponseStatusException notFound() { return new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found."); }
    private static ResponseStatusException bad(String m) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, m); }
    private static ResponseStatusException conflict(String m) { return new ResponseStatusException(HttpStatus.CONFLICT, m); }
}
