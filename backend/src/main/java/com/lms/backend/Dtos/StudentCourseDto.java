package com.lms.backend.Dtos;

import java.util.List;

/** A course as a student sees it: the course plus the teachers assigned to it. */
public record StudentCourseDto(Long id, String title, String code, Integer gradeNo, List<String> teachers) {
}
