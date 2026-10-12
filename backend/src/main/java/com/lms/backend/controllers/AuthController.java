package com.lms.backend.controllers;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import com.lms.backend.security.AuthUser;
import com.lms.backend.services.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.lms.backend.Dtos.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService){
        this.authService = authService;
    }

    // POST /api/auth/login   (public)
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginDto loginRequest) {
        Optional<LoginResponseDto> response = authService.login(loginRequest);
        if (response.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(response.get());
    }

    // POST /api/auth/change-password   (any signed-in user, changes their own password)
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordDto body,
                                               @AuthenticationPrincipal AuthUser me) {
        authService.changePassword(me.userId(), body);
        return ResponseEntity.noContent().build();
    }
}
