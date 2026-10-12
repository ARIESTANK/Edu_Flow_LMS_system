package com.lms.backend.controllers;

import com.lms.backend.Dtos.PasswordResetDto;
import com.lms.backend.Dtos.UserDto;
import com.lms.backend.Dtos.UserResponseDto;
import com.lms.backend.Dtos.UserUpdateDto;
import com.lms.backend.Enum.User.Role;
import com.lms.backend.security.AuthUser;
import com.lms.backend.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/users                       (ADMIN)
    @GetMapping("/users")
    public List<UserResponseDto> allUsers() {
        return userService.getAllUsers();
    }

    // GET /api/users/{role}  e.g. /api/users/STUDENT   (ADMIN)
    @GetMapping("/users/{role}")
    public List<UserResponseDto> usersByRole(@PathVariable Role role) {
        return userService.getUsersByRole(role);
    }

    // POST /api/users   sign-up (public) and "Add user" (ADMIN). Only an ADMIN caller can create an ADMIN.
    @PostMapping("/users")
    public ResponseEntity<UserResponseDto> createUser(@RequestBody UserDto user,
                                                      @AuthenticationPrincipal AuthUser caller) {
        boolean callerIsAdmin = caller != null && caller.role() == Role.ADMIN;
        UserResponseDto created = userService.createUser(user, callerIsAdmin);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/users/{id}   (ADMIN)
    @PutMapping("/users/{id}")
    public UserResponseDto updateUser(@PathVariable Long id,
                                      @RequestBody UserUpdateDto body,
                                      @AuthenticationPrincipal AuthUser caller) {
        return userService.updateUser(id, body, caller);
    }

    // DELETE /api/users/{id}   (ADMIN)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id,
                                           @AuthenticationPrincipal AuthUser caller) {
        userService.deleteUser(id, caller);
        return ResponseEntity.noContent().build();
    }

    // POST /api/users/{id}/reset-password   (ADMIN)
    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id, @RequestBody PasswordResetDto body) {
        userService.resetPassword(id, body);
        return ResponseEntity.noContent().build();
    }
}
