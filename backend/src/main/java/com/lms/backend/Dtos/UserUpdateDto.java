package com.lms.backend.Dtos;

import com.lms.backend.Enum.User.Role;

/** Body of PUT /api/users/{id}. The password is changed through the reset-password endpoint instead. */
public class UserUpdateDto {
    private String username;
    private String email;
    private Role role;

    public UserUpdateDto() {
    }

    public UserUpdateDto(String username, String email, Role role) {
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public String getUsername() {return username;}
    public void setUsername(String username) {this.username = username;}

    public String getEmail() {return email;}
    public void setEmail(String email) {this.email = email;}

    public Role getRole() {return role;}
    public void setRole(Role role) {this.role = role;}
}
