package com.lms.backend.Dtos;

public record TeachingResponseDto(Long id, Long teacherId, String teacherName,
                                  Long courseId, String courseTitle, String courseCode, Integer gradeNo) {
}
