package com.lms.backend.Dtos;

/** Body of PUT /api/enrollments/{id}: move a student to another class. */
public class EnrollmentMoveDto {
    private Long classId;

    public EnrollmentMoveDto() {
    }

    public Long getClassId() {return classId;}
    public void setClassId(Long classId) {this.classId = classId;}
}
