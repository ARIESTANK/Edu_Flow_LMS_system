package com.lms.backend.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

/** A lesson created by a teacher for a course (optionally one class), with a PDF, slides, a video and extra resources. */
@Entity
@Table(name = "lessons",
       indexes = @Index(name = "idx_lessons_course", columnList = "course_id"))
public class Lesson {
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

    @Column(name = "lesson_no")
    private Integer lessonNo;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @Column(name = "slides_url")
    private String slidesUrl;

    @Column(name = "video_url")
    private String videoUrl;

    @Column(name = "video_duration_minutes")
    private Integer videoDurationMinutes;

    @ElementCollection
    @CollectionTable(name = "lesson_resource_links", joinColumns = @JoinColumn(name = "lesson_id"))
    @Column(name = "url", nullable = false)
    private List<String> resourceLinks = new ArrayList<>();

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "publish_at")
    private LocalDateTime publishAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Lesson() {}

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

    public Integer getLessonNo() {return lessonNo;}
    public void setLessonNo(Integer lessonNo) {this.lessonNo = lessonNo;}

    public String getPdfUrl() {return pdfUrl;}
    public void setPdfUrl(String pdfUrl) {this.pdfUrl = pdfUrl;}

    public String getSlidesUrl() {return slidesUrl;}
    public void setSlidesUrl(String slidesUrl) {this.slidesUrl = slidesUrl;}

    public String getVideoUrl() {return videoUrl;}
    public void setVideoUrl(String videoUrl) {this.videoUrl = videoUrl;}

    public Integer getVideoDurationMinutes() {return videoDurationMinutes;}
    public void setVideoDurationMinutes(Integer videoDurationMinutes) {this.videoDurationMinutes = videoDurationMinutes;}

    public List<String> getResourceLinks() {return resourceLinks;}
    public void setResourceLinks(List<String> resourceLinks) {this.resourceLinks = resourceLinks;}

    public boolean isPublished() {return published;}
    public void setPublished(boolean published) {this.published = published;}

    public LocalDateTime getPublishAt() {return publishAt;}
    public void setPublishAt(LocalDateTime publishAt) {this.publishAt = publishAt;}

    public LocalDateTime getCreatedAt() {return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

    public LocalDateTime getUpdatedAt() {return updatedAt;}
    public void setUpdatedAt(LocalDateTime updatedAt) {this.updatedAt = updatedAt;}

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
