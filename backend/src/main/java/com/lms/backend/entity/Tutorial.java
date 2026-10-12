package com.lms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

/** One row per (tutorial, student): the tutorial (a single day, so no end date) and that student's result. score stays null until marked. */
@Entity
@Table(name = "tutorials")
public class Tutorial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private Class classEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "tutorial_date", nullable = false)
    private LocalDate tutorialDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "total_marks", nullable = false, precision = 5, scale = 2)
    private java.math.BigDecimal totalMarks;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "attended", nullable = false)
    private boolean attended;

    @Column(name = "score", precision = 5, scale = 2)
    private java.math.BigDecimal score;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    public Tutorial() {}

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public Course getCourse() {return course;}
    public void setCourse(Course course) {this.course = course;}

    public Class getClassEntity() {return classEntity;}
    public void setClassEntity(Class classEntity) {this.classEntity = classEntity;}

    public User getCreatedBy() {return createdBy;}
    public void setCreatedBy(User createdBy) {this.createdBy = createdBy;}

    public User getStudent() {return student;}
    public void setStudent(User student) {this.student = student;}

    public String getTitle() {return title;}
    public void setTitle(String title) {this.title = title;}

    public String getDescription() {return description;}
    public void setDescription(String description) {this.description = description;}

    public LocalDate getTutorialDate() {return tutorialDate;}
    public void setTutorialDate(LocalDate tutorialDate) {this.tutorialDate = tutorialDate;}

    public LocalTime getStartTime() {return startTime;}
    public void setStartTime(LocalTime startTime) {this.startTime = startTime;}

    public LocalTime getEndTime() {return endTime;}
    public void setEndTime(LocalTime endTime) {this.endTime = endTime;}

    public java.math.BigDecimal getTotalMarks() {return totalMarks;}
    public void setTotalMarks(java.math.BigDecimal totalMarks) {this.totalMarks = totalMarks;}

    public boolean isPublished() {return published;}
    public void setPublished(boolean published) {this.published = published;}

    public LocalDateTime getCreatedAt() {return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

    public boolean isAttended() {return attended;}
    public void setAttended(boolean attended) {this.attended = attended;}

    public java.math.BigDecimal getScore() {return score;}
    public void setScore(java.math.BigDecimal score) {this.score = score;}

    public String getFeedback() {return feedback;}
    public void setFeedback(String feedback) {this.feedback = feedback;}
}
