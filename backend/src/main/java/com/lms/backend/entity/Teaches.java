package com.lms.backend.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "teaches")
public class Teaches {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "teacher_id", referencedColumnName = "id")
    private User teacher;

    @ManyToOne
    @JoinColumn(name = "course_id", referencedColumnName = "id")
    private Course course;

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public User getTeacher() {return teacher;}
    public void setTeacher(User teacher) {this.teacher = teacher;}

    public Course getCourse() {return course;}
    public void setCourse(Course course) {this.course = course;}

}