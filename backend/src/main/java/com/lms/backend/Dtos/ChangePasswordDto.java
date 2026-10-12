package com.lms.backend.Dtos;

/** Body of POST /api/auth/change-password (a signed-in user changes their own password). */
public class ChangePasswordDto {
    private String currentPassword;
    private String newPassword;

    public ChangePasswordDto() {
    }

    public String getCurrentPassword() {return currentPassword;}
    public void setCurrentPassword(String currentPassword) {this.currentPassword = currentPassword;}

    public String getNewPassword() {return newPassword;}
    public void setNewPassword(String newPassword) {this.newPassword = newPassword;}
}
