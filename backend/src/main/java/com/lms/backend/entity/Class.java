package com.lms.backend.entity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "classes")
public class Class {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String code;

    @Column(name = "gradeNo")
    private Integer gradeNo;

    @ManyToMany
    @JoinTable(
        name = "class_courses",
        joinColumns = @JoinColumn(name = "class_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private List<Course> courses = new ArrayList<>();

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public String getCode() {return code;}
    public void setCode(String code) {this.code = code;}

    public Integer getGradeNo() {return gradeNo;}
    public void setGradeNo(Integer gradeNo) {this.gradeNo = gradeNo;}

    public List<Course> getCourses() {return courses;}
    public void setCourses(List<Course> courses) {this.courses = courses;}

}
