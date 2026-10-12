package com.lms.backend.security;

import com.lms.backend.Enum.User.Role;

/** The signed-in user, read from the JWT. Available in controllers via @AuthenticationPrincipal. */
public record AuthUser(Long userId, String username, Role role) {
}
