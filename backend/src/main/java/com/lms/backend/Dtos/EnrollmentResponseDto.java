package com.lms.backend.Dtos;

/** gradeNo is the class's grade, stored on the enrollment. enrollmentDate is an ISO-8601 timestamp. */
public record EnrollmentResponseDto(Long id, Long studentId, String studentName, String studentEmail,
                                    Long classId, String classCode, Integer gradeNo, String enrollmentDate) {
}
