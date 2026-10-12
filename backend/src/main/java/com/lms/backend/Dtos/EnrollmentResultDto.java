package com.lms.backend.Dtos;

import java.util.List;

/** Result of enrolling several students: how many were added, and why the others were skipped. */
public record EnrollmentResultDto(int created, List<String> skipped) {
}
