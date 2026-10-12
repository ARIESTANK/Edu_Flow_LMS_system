package com.lms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** A quiz for a course (optionally one class). Students can start it between startDate and endDate. */
@Entity
@Table(name = "quizzes")
public class Quiz {
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

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "total_marks", nullable = false, precision = 5, scale = 2)
    private java.math.BigDecimal totalMarks;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Quiz() {}

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public Course getCourse() {return course;}
    public void setCourse(Course course) {this.course = course;}

    public Class getClassEntity() {return classEntity;}
    public void setClassEntity(Class classEntity) {this.classEntity = classEntity;}

    public User getCreatedBy() {return createdBy;}
    public void setCreatedBy(User createdBy) {this.createdBy = createdBy;}

    public String getTitle() {return title;}
    public void setTitle(String title) {this.title = title;}

    public String getDescription() {return description;}
    public void setDescription(String description) {this.description = description;}

    public LocalDateTime getStartDate() {return startDate;}
    public void setStartDate(LocalDateTime startDate) {this.startDate = startDate;}

    public LocalDateTime getEndDate() {return endDate;}
    public void setEndDate(LocalDateTime endDate) {this.endDate = endDate;}

    public Integer getDurationMinutes() {return durationMinutes;}
    public void setDurationMinutes(Integer durationMinutes) {this.durationMinutes = durationMinutes;}

    public java.math.BigDecimal getTotalMarks() {return totalMarks;}
    public void setTotalMarks(java.math.BigDecimal totalMarks) {this.totalMarks = totalMarks;}

    public boolean isPublished() {return published;}
    public void setPublished(boolean published) {this.published = published;}

    public LocalDateTime getCreatedAt() {return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
}
