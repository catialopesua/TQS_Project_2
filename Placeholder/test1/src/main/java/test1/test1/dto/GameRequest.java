package test1.test1.dto;

import java.time.LocalDate;

public class GameRequest {
    private String title;
    private String description;
    private Double price;
    private String condition;
    private String photos;
    private String tags;
    private Boolean active;
    private String startDate;
    private String endDate;
    private String ownerUsername;

    // Default constructor
    public GameRequest() {}

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getPhotos() {
        return photos;
    }

    public void setPhotos(String photos) {
        this.photos = photos;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }

    // Helper method to parse dates
    public LocalDate getParsedStartDate() {
        return (startDate != null && !startDate.isEmpty()) ? LocalDate.parse(startDate) : null;
    }

    public LocalDate getParsedEndDate() {
        return (endDate != null && !endDate.isEmpty()) ? LocalDate.parse(endDate) : null;
    }
}