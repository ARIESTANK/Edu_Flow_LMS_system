package com.lms.backend.Dtos;

/** What the API returns for a course. */
public record CourseResponseDto(Long id, String title, String code, Integer gradeNo) {
}
