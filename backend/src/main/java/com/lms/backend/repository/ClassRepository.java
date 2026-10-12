package com.lms.backend.repository;
import com.lms.backend.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ClassRepository extends JpaRepository<Class, Long> {
    Optional<Class> findByCodeIgnoreCase(String code);

    @Query("select c from Class c left join fetch c.courses where c.id = :id")
    Optional<Class> findByIdWithCourses(@Param("id") Long id);
}
