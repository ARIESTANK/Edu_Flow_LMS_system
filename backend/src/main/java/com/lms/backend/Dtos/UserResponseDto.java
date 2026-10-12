package com.lms.backend.Dtos;

import com.lms.backend.Enum.User.Role;

/** What the API returns for a user. Never includes the password hash. */
public record UserResponseDto(Long id, String username, String email, Role role) {
}
