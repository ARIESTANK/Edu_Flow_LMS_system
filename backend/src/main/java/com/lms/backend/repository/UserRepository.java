package com.lms.backend.repository;
import com.lms.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import com.lms.backend.Enum.User.Role;

public interface UserRepository extends JpaRepository<User, Long> {
    //retrieve data from database
    List<User> findAll();
    List<User> findByRole(Role role);   // was Optional: failed as soon as two users shared a role
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

}
