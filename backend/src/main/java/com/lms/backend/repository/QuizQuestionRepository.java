package com.lms.backend.repository;
import com.lms.backend.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByQuiz_IdOrderByPositionAsc(Long quizId);
    
    @Query("delete from QuizQuestion q where q.quiz.id = :quizId")
    void deleteByQuizId(@Param("quizId") Long quizId);
}