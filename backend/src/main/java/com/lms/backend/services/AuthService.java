package com.lms.backend.services;
import com.lms.backend.Dtos.ChangePasswordDto;
import com.lms.backend.Dtos.LoginDto;
import com.lms.backend.Dtos.LoginResponseDto;
import com.lms.backend.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.lms.backend.repository.UserRepository;

import java.util.*;
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JWTService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JWTService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<LoginResponseDto> login(LoginDto user) {
        if (user == null || user.getEmail() == null || user.getPassword() == null) {
            return Optional.empty();
        }
        String email = user.getEmail().trim().toLowerCase();   // sign-up stores emails trimmed + lowercase
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return Optional.empty();
        }
        User requestUser = optionalUser.get();
        if (passwordEncoder.matches(user.getPassword(), requestUser.getPassword())) {
            LoginResponseDto responseUser = new LoginResponseDto(requestUser.getId(),requestUser.getUsername(),requestUser.getEmail(),requestUser.getRole());
            String token = jwtService.generateToken(requestUser);
            responseUser.setToken(token);
            return Optional.of(responseUser);
        }
        return Optional.empty();
    }

    /** A signed-in user changes their own password. */
    public void changePassword(Long userId, ChangePasswordDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (dto == null || dto.getCurrentPassword() == null
                || !passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect.");
        }
        PasswordPolicy.check(dto.getNewPassword());

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }
}
