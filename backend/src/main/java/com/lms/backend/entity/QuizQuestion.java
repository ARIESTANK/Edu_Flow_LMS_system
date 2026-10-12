package com.lms.backend.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/** Question, its options and the correct answer in ONE row. The frontend marks the answers. */
@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @ElementCollection
    @CollectionTable(name = "quiz_question_options", joinColumns = @JoinColumn(name = "question_id"))
    @OrderColumn(name = "option_order")
    @Column(name = "option_text", nullable = false)
    private List<String> options = new ArrayList<>();

    @Column(name = "correct_option_index", nullable = false)
    private Integer correctOptionIndex;

    @Column(name = "marks", nullable = false, precision = 5, scale = 2)
    private java.math.BigDecimal marks;

    @Column(name = "question_order")
    private Integer position;

    public QuizQuestion() {}

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    public Quiz getQuiz() {return quiz;}
    public void setQuiz(Quiz quiz) {this.quiz = quiz;}

    public String getQuestionText() {return questionText;}
    public void setQuestionText(String questionText) {this.questionText = questionText;}

    public List<String> getOptions() {return options;}
    public void setOptions(List<String> options) {this.options = options;}

    public Integer getCorrectOptionIndex() {return correctOptionIndex;}
    public void setCorrectOptionIndex(Integer correctOptionIndex) {this.correctOptionIndex = correctOptionIndex;}

    public java.math.BigDecimal getMarks() {return marks;}
    public void setMarks(java.math.BigDecimal marks) {this.marks = marks;}

    public Integer getPosition() {return position;}
    public void setPosition(Integer position) {this.position = position;}
}
