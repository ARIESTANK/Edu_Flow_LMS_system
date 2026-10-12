package com.lms.backend.Dtos;

import java.util.List;

/** Body of POST /api/enrollments: put one or many students into a class. */
public class EnrollmentCreateDto {
    private Long classId;
    private List<Long> studentIds;

    public EnrollmentCreateDto() {
    }

    public Long getClassId() {return classId;}
    public void setClassId(Long classId) {this.classId = classId;}

    public List<Long> getStudentIds() {return studentIds;}
    public void setStudentIds(List<Long> studentIds) {this.studentIds = studentIds;}
}
