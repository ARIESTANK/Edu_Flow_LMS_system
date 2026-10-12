package com.lms.backend.Dtos;
import java.time.LocalDateTime;
import java.util.List;

/** Lesson as seen by teachers (for list/create/update). */
public record LessonDto(
    Long id,
    Long courseId,
    String courseTitle,
    Long classId,
    String classCode,
    Long createdById,
    String createdByName,
    String title,
    String description,
    Integer lessonNo,
    String pdfUrl,
    String slidesUrl,
    String videoUrl,
    Integer videoDurationMinutes,
    List<String> resourceLinks,
    boolean published,
    LocalDateTime publishAt,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}

/** Request to create/update a lesson. */
public record LessonRequestDto(
    Long courseId,
    Long classId,
    String title,
    String description,
    Integer lessonNo,
    String pdfUrl,
    String slidesUrl,
    String videoUrl,
    Integer videoDurationMinutes,
    List<String> resourceLinks,
    boolean published,
    LocalDateTime publishAt
) {}