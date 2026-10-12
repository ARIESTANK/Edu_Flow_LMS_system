package com.lms.backend.Dtos;
import com.lms.backend.Enum.User.Role;

public class UserDto {

    private String username;
    private String email;
    private String password;
    private Role role;

    public UserDto() {
    }

    public UserDto(String username, String email, String password, Role role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public String getUsername() {return username;}

    public void setUsername(String username) {this.username = username; }

    public String getEmail() {return email;}

    public void setEmail(String email) {this.email = email;}

    public String getPassword() {return password;}

    public void setPassword(String password) {this.password = password;}

    public Role getRole() {return role;}

    public void setRole(Role role) {this.role = role;}

}