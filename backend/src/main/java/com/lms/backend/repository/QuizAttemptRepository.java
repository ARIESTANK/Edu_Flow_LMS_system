package com.lms.backend.repository;
import com.lms.backend.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuiz_Id(Long quizId);
    List<QuizAttempt> findByStudent_Id(Long studentId);
    
    @Query("select qa from QuizAttempt qa where qa.quiz.id = :quizId and qa.student.id = :studentId")
    Optional<QuizAttempt> findByQuizAndStudent(@Param("quizId") Long quizId, @Param("studentId") Long studentId);
    
    @Query("select qa from QuizAttempt qa where qa.quiz.id = :quizId and qa.submittedAt is not null")
    List<QuizAttempt> findSubmittedByQuiz(@Param("quizId") Long quizId);
}