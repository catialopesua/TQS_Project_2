package test1.test1.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "games")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer gameId;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private double pricePerDay;

    @Column(nullable = false)
    private String condition;

    @Column(length = 1000)
    private String photos; // Stored as comma-separated file paths (e.g., /images/game_images/filename.png)

    @Column(length = 500)
    private String tags; // Stored as comma-separated tags (e.g., PlayStation,Action,Multiplayer)

    private boolean active = true;

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(nullable = true)
    private String ownerUsername; // Owner's username (null for testing)

    @Column(nullable = false)
    private LocalDate createdAt;

    
    public Game() {
        this.createdAt = LocalDate.now();
    }

    // Simple constructor for testing
    public Game(String title, String description, double pricePerDay) {
        this.title = title;
        this.description = description;
        this.pricePerDay = pricePerDay;
        this.condition = "good";
        this.photos = "";
        this.tags = "";
        this.active = true;
        this.startDate = null;
        this.endDate = null;
        this.ownerUsername = "test-user";
        this.createdAt = LocalDate.now();
    }

    public Game(String title, String description, double pricePerDay, String condition, 
                String photos, String tags, boolean active, LocalDate startDate, LocalDate endDate, String ownerUsername) {
        this.title = title;
        this.description = description;
        this.pricePerDay = pricePerDay;
        this.condition = condition;
        this.photos = photos;
        this.tags = tags;
        this.active = active;
        this.startDate = startDate;
        this.endDate = endDate;
        this.ownerUsername = ownerUsername;
        this.createdAt = LocalDate.now();
    }

    // Getters and Setters
    public Integer getGameId() {
        return gameId;
    }

    public void setGameId(Integer gameId) {
        this.gameId = gameId;
    }

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

    public double getPricePerDay() {
        return pricePerDay;
    }

    public void setPricePerDay(double pricePerDay) {
        this.pricePerDay = pricePerDay;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }
}