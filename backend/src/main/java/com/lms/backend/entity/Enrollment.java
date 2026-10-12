package com.lms.backend.entity;
import jakarta.persistence.*;
import java.util.Date;
import com.lms.backend.entity.Class;
import com.lms.backend.entity.User;

@Entity
@Table(name = "enrollments")
public class Enrollment {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "gradeNo")
    private Integer gradeNo;

    @ManyToOne
    @JoinColumn (name = "class_id")
    private Class classEntity;

    @Column(name ="enrollment_date")
    private Date enrollmentDate;

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public User getUser() {return user;}
    public void setUser(User user) {this.user = user;}

    public Date getEnrollmentDate() {return enrollmentDate;}
    public void setEnrollmentDate(Date enrollmentDate) {this.enrollmentDate = enrollmentDate;}

    public Integer getGradeNo() {return gradeNo;}
    public void setGradeNo(Integer gradeNo) {this.gradeNo = gradeNo;}

    public Class getClassEntity() {return classEntity;}
    public void setClassEntity(Class classEntity) {this.classEntity = classEntity;}
}
