package com.lms.backend.Dtos;
import com.lms.backend.Enum.User.Role;


public class LoginResponseDto {
    private String token;
    private Long userId;
    private String username;
    private String email;
    private Role role;

    public LoginResponseDto() {
    }

    public LoginResponseDto(Long userId,String username,String email,Role role) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }
    
    public void setToken(String token){
        this.token = token;
    }
}