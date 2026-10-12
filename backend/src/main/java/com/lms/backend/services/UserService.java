package com.lms.backend.services;

import com.lms.backend.Dtos.PasswordResetDto;
import com.lms.backend.Dtos.UserDto;
import com.lms.backend.Dtos.UserResponseDto;
import com.lms.backend.Dtos.UserUpdateDto;
import com.lms.backend.Enum.User.Role;
import com.lms.backend.entity.User;
import com.lms.backend.repository.UserRepository;
import com.lms.backend.security.AuthUser;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UserService {
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ===== get requests =====
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<UserResponseDto> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream().map(this::toDto).toList();
    }

    public Optional<User> getUsersByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // ===== post: create =====
    /** @param callerIsAdmin true only when an authenticated ADMIN is calling. Anonymous sign-up cannot create admins. */
    public UserResponseDto createUser(UserDto dto, boolean callerIsAdmin) {
        if (dto == null) throw bad("Request body is required.");

        String username = clean(dto.getUsername());
        String email = clean(dto.getEmail()).toLowerCase();
        Role role = dto.getRole() == null ? Role.STUDENT : dto.getRole();

        validateProfile(username, email);
        PasswordPolicy.check(dto.getPassword());

        if (role == Role.ADMIN && !callerIsAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only an administrator can create admin accounts.");
        }
        if (userRepository.findByEmail(email).isPresent()) throw conflict("An account with this email already exists.");
        if (userRepository.findByUsername(username).isPresent()) throw conflict("This username is already taken.");

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(role);
        return toDto(userRepository.save(user));
    }

    // ===== put: update =====
    public UserResponseDto updateUser(Long id, UserUpdateDto dto, AuthUser caller) {
        User user = find(id);
        if (dto == null) throw bad("Request body is required.");

        String username = clean(dto.getUsername());
        String email = clean(dto.getEmail()).toLowerCase();
        Role role = dto.getRole() == null ? user.getRole() : dto.getRole();

        validateProfile(username, email);

        boolean isSelf = caller != null && id.equals(caller.userId());
        if (isSelf && user.getRole() == Role.ADMIN && role != Role.ADMIN) {
            throw bad("You can't remove your own admin role.");
        }
        userRepository.findByEmail(email).filter(o -> !o.getId().equals(id))
                .ifPresent(o -> { throw conflict("Another user already uses this email."); });
        userRepository.findByUsername(username).filter(o -> !o.getId().equals(id))
                .ifPresent(o -> { throw conflict("Another user already uses this username."); });

        user.setUsername(username);
        user.setEmail(email);
        user.setRole(role);
        return toDto(userRepository.save(user));
    }

    // ===== delete =====
    public void deleteUser(Long id, AuthUser caller) {
        if (caller != null && id.equals(caller.userId())) throw bad("You can't delete your own account.");
        if (!userRepository.existsById(id)) throw notFound();
        try {
            userRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw conflict("This user still has enrollments or classes. Remove those first.");
        }
    }

    // ===== admin password reset =====
    public void resetPassword(Long id, PasswordResetDto dto) {
        User user = find(id);
        PasswordPolicy.check(dto == null ? null : dto.getNewPassword());
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    // ===== helpers =====
    private User find(Long id) {
        return userRepository.findById(id).orElseThrow(this::notFound);
    }

    private void validateProfile(String username, String email) {
        if (username.length() < 3 || username.length() > 50) throw bad("Username must be 3 to 50 characters.");
        if (email.length() > 254 || !EMAIL.matcher(email).matches()) throw bad("Enter a valid email address.");
    }

    private UserResponseDto toDto(User u) {
        return new UserResponseDto(u.getId(), u.getUsername(), u.getEmail(), u.getRole());
    }

    private static String clean(String s) { return s == null ? "" : s.trim(); }
    private ResponseStatusException notFound() { return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."); }
    private static ResponseStatusException bad(String m) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, m); }
    private static ResponseStatusException conflict(String m) { return new ResponseStatusException(HttpStatus.CONFLICT, m); }
}
