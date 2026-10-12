package com.lms.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** One attempt per student per quiz. The score is calculated in the frontend and saved here. */
@Entity
@Table(name = "quiz_attempts",uniqueConstraints = @UniqueConstraint(columnNames = {"quiz_id", "student_id"}))
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "score", precision = 5, scale = 2)
    private java.math.BigDecimal score;

    public QuizAttempt() {}

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public Quiz getQuiz() {return quiz;}
    public void setQuiz(Quiz quiz) {this.quiz = quiz;}

    public User getStudent() {return student;}
    public void setStudent(User student) {this.student = student;}

    public LocalDateTime getStartedAt() {return startedAt;}
    public void setStartedAt(LocalDateTime startedAt) {this.startedAt = startedAt;}

    public LocalDateTime getSubmittedAt() {return submittedAt;}
    public void setSubmittedAt(LocalDateTime submittedAt) {this.submittedAt = submittedAt;}

    public java.math.BigDecimal getScore() {return score;}
    public void setScore(java.math.BigDecimal score) {this.score = score;}
}
