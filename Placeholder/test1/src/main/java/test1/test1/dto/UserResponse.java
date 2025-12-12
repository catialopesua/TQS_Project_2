package test1.test1.dto;

public class UserResponse {
    private Integer userId;
    private String username;
    private String bio;
    private String role;

    public UserResponse(Integer userId, String username, String bio, String role) {
        this.userId = userId;
        this.username = username;
        this.bio = bio;
        this.role = role;
    }

    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
