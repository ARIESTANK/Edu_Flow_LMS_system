package com.lms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** One row per (assignment, student): the assignment details and that student's submission. score stays null until graded. */
@Entity
@Table(name = "assignments")
public class Assignment {
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

    @Column(name = "instructions_file_url")
    private String instructionsFileUrl;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "allow_late", nullable = false)
    private boolean allowLate;

    @Column(name = "total_marks", nullable = false, precision = 5, scale = 2)
    private java.math.BigDecimal totalMarks;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "submission_file_url")
    private String submissionFileUrl;

    @Column(name = "text_answer", columnDefinition = "TEXT")
    private String textAnswer;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "is_late", nullable = false)
    private boolean late;

    @Column(name = "score", precision = 5, scale = 2)
    private java.math.BigDecimal score;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private User gradedBy;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    public Assignment() {}

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

    public String getInstructionsFileUrl() {return instructionsFileUrl;}
    public void setInstructionsFileUrl(String instructionsFileUrl) {this.instructionsFileUrl = instructionsFileUrl;}

    public LocalDateTime getStartDate() {return startDate;}
    public void setStartDate(LocalDateTime startDate) {this.startDate = startDate;}

    public LocalDateTime getEndDate() {return endDate;}
    public void setEndDate(LocalDateTime endDate) {this.endDate = endDate;}

    public boolean isAllowLate() {return allowLate;}
    public void setAllowLate(boolean allowLate) {this.allowLate = allowLate;}

    public java.math.BigDecimal getTotalMarks() {return totalMarks;}
    public void setTotalMarks(java.math.BigDecimal totalMarks) {this.totalMarks = totalMarks;}

    public boolean isPublished() {return published;}
    public void setPublished(boolean published) {this.published = published;}

    public LocalDateTime getCreatedAt() {return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

    public String getSubmissionFileUrl() {return submissionFileUrl;}
    public void setSubmissionFileUrl(String submissionFileUrl) {this.submissionFileUrl = submissionFileUrl;}

    public String getTextAnswer() {return textAnswer;}
    public void setTextAnswer(String textAnswer) {this.textAnswer = textAnswer;}

    public LocalDateTime getSubmittedAt() {return submittedAt;}
    public void setSubmittedAt(LocalDateTime submittedAt) {this.submittedAt = submittedAt;}

    public boolean isLate() {return late;}
    public void setLate(boolean late) {this.late = late;}

    public java.math.BigDecimal getScore() {return score;}
    public void setScore(java.math.BigDecimal score) {this.score = score;}

    public String getFeedback() {return feedback;}
    public void setFeedback(String feedback) {this.feedback = feedback;}

    public User getGradedBy() {return gradedBy;}
    public void setGradedBy(User gradedBy) {this.gradedBy = gradedBy;}

    public LocalDateTime getGradedAt() {return gradedAt;}
    public void setGradedAt(LocalDateTime gradedAt) {this.gradedAt = gradedAt;}
}
