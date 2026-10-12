package com.lms.backend.services;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** One place for the password rules (same rules as the Angular forms). */
public final class PasswordPolicy {

    private PasswordPolicy() {
    }

    public static void check(String password) {
        boolean ok = password != null
                && password.length() >= 8
                && password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length <= 72 // BCrypt limit
                && password.matches(".*[A-Za-z].*")
                && password.matches(".*\\d.*");
        if (!ok) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must be 8 to 72 characters with at least one letter and one number.");
        }
    }
}
