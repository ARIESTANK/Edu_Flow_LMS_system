package com.lms.backend.Dtos;

/** Body of POST /api/teaches and PUT /api/teaches/{id}: assign a teacher to a course. */
public class TeachingRequestDto {
    private Long teacherId;
    private Long courseId;

    public TeachingRequestDto() {
    }

    public Long getTeacherId() {return teacherId;}
    public void setTeacherId(Long teacherId) {this.teacherId = teacherId;}

    public Long getCourseId() {return courseId;}
    public void setCourseId(Long courseId) {this.courseId = courseId;}
}
