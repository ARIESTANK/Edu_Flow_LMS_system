package com.lms.backend.Dtos;

/** Body of POST /api/users/{id}/reset-password (admin sets a new password for a user). */
public class PasswordResetDto {
    private String newPassword;
    // Sent by the admin UI. Not stored yet: it needs a column on the User entity.
    private Boolean mustChangePassword;

    public PasswordResetDto() {
    }

    public String getNewPassword() {return newPassword;}
    public void setNewPassword(String newPassword) {this.newPassword = newPassword;}

    public Boolean getMustChangePassword() {return mustChangePassword;}
    public void setMustChangePassword(Boolean mustChangePassword) {this.mustChangePassword = mustChangePassword;}
}
