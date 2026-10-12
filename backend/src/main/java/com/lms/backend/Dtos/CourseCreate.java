package com.lms.backend.Dtos;

/** Body of POST /api/courses. */
public class CourseCreate {
    private String code;
    private String title;
    private Integer gradeNo;

    public CourseCreate() {
    }

    public CourseCreate(String code, String title, Integer gradeNo) {
        this.code = code;
        this.title = title;
        this.gradeNo = gradeNo;
    }

    public String getCode() {return code;}
    public void setCode(String code) {this.code = code;}

    public String getTitle() {return title;}
    public void setTitle(String title) {this.title = title;}

    public Integer getGradeNo() {return gradeNo;}
    public void setGradeNo(Integer gradeNo) {this.gradeNo = gradeNo;}
}
