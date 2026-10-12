package com.lms.backend.entity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")

public class Course {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String title;

    @Column (unique = true)
    private String code;

    @Column (name = "gradeNo")
    private Integer gradeNo;

    @ManyToMany(mappedBy = "courses")
    private List<Class> classes = new ArrayList<>();

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    
    public String getTitle() {return title;}
    public void setTitle(String title) {this.title = title;}

    public String getCode() {return code;}
    public void setCode(String code) {this.code = code;}

    public Integer getGradeNo() {return gradeNo;}
    public void setGradeNo(Integer gradeNo) {this.gradeNo = gradeNo;}

    public List<Class> getClasses() {return classes;}
    public void setClasses(List<Class> classes) {this.classes = classes;}
}
