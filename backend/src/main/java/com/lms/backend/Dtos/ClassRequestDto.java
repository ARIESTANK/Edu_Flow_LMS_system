package com.lms.backend.Dtos;

/** Body of POST /api/classes and PUT /api/classes/{id}. */
public class ClassRequestDto {
    private String code;
    private Integer gradeNo;

    public ClassRequestDto() {
    }

    public String getCode() {return code;}
    public void setCode(String code) {this.code = code;}

    public Integer getGradeNo() {return gradeNo;}
    public void setGradeNo(Integer gradeNo) {this.gradeNo = gradeNo;}
}
