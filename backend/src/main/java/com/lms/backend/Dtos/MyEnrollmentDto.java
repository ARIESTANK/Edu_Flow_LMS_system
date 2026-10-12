package com.lms.backend.Dtos;

/** The signed-in student's own enrollment. enrolled=false means they are in no class (the app then shows them nothing). */
public record MyEnrollmentDto(boolean enrolled, Long classId, String classCode, Integer gradeNo) {
}
