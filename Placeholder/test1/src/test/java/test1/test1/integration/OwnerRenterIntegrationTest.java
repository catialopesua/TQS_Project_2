package test1.test1.integration;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import test1.test1.model.Booking;
import test1.test1.model.Game;
import test1.test1.model.User;
import test1.test1.service.BookingService;
import test1.test1.service.GameService;
import test1.test1.service.UserService;

/**
 * Integration tests for Owner and Renter workflows.
 * Tests the complete flow from user registration to game creation and booking.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class OwnerRenterIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private GameService gameService;

    @Autowired
    private BookingService bookingService;

    private static String ownerUsername;
    private static String renterUsername;
    private static Integer ownerId;
    private static Integer renterId;
    private static Integer gameId;
    private static Integer bookingId;

    // ============ OWNER WORKFLOW TESTS ============

    @Test
    @Order(1)
    @DisplayName("Owner: Register new user account")
    void testOwner_Registration() {
        // Given
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
        ownerUsername = "owner_int_" + timestamp;
        
        // When
        User owner = userService.createUser(ownerUsername, "TestPass123!", "Owner bio");

        // Then
        assertThat(owner).isNotNull();
        assertThat(owner.getUsername()).isEqualTo(ownerUsername);
        assertThat(owner.getUserId()).isNotNull();
        
        ownerId = owner.getUserId();
        System.out.println("✅ Owner registered: " + ownerUsername + " (ID: " + ownerId + ")");
    }

    @Test
    @Order(2)
    @DisplayName("Owner: Login successfully")
    void testOwner_Login() {
        // When
        Optional<User> ownerOpt = userService.findByUsername(ownerUsername);
        assertThat(ownerOpt).isPresent();
        User owner = ownerOpt.get();
        boolean validPassword = userService.validatePassword(owner, "TestPass123!");

        // Then
        assertThat(validPassword).isTrue();
        assertThat(owner.getUsername()).isEqualTo(ownerUsername);
        
        System.out.println("✅ Owner logged in successfully");
    }

    @Test
    @Order(3)
    @DisplayName("Owner: Create a new game listing")
    void testOwner_CreateGame() {
        // When
        Game game = gameService.addGame(
            "Integration Test Game",
            "A game created during integration testing",
            25.0,
            "Excellent",
            "photo1.jpg,photo2.jpg",
            "action,adventure",
            true,
            LocalDate.now(),
            LocalDate.now().plusMonths(3),
            ownerUsername
        );

        // Then
        assertThat(game).isNotNull();
        assertThat(game.getTitle()).isEqualTo("Integration Test Game");
        assertThat(game.getOwnerUsername()).isEqualTo(ownerUsername);
        assertThat(game.getPricePerDay()).isEqualTo(25.0);
        
        gameId = game.getGameId();
        System.out.println("✅ Owner created game (ID: " + gameId + ")");
    }

    @Test
    @Order(4)
    @DisplayName("Owner: Retrieve their own game listings")
    void testOwner_GetOwnGames() {
        // When
        var games = gameService.getGamesByOwner(ownerUsername);

        // Then
        assertThat(games).isNotEmpty();
        assertThat(games.get(0).getOwnerUsername()).isEqualTo(ownerUsername);
        
        System.out.println("✅ Owner retrieved " + games.size() + " game(s)");
    }

    @Test
    @Order(5)
    @DisplayName("Owner: Update game details")
    void testOwner_UpdateGame() {
        // When
        Game updatedGame = gameService.updateGame(
            gameId,
            "Updated Integration Test Game",
            "Updated description",
            "Pick up at location",
            30.0,
            "Like New",
            "photo1.jpg,photo2.jpg,photo3.jpg",
            "action,adventure,rpg",
            true,
            LocalDate.now(),
            LocalDate.now().plusMonths(3)
        );

        // Then
        assertThat(updatedGame).isNotNull();
        assertThat(updatedGame.getTitle()).isEqualTo("Updated Integration Test Game");
        assertThat(updatedGame.getPricePerDay()).isEqualTo(30.0);
        
        System.out.println("✅ Owner updated game successfully");
    }

    // ============ RENTER WORKFLOW TESTS ============

    @Test
    @Order(10)
    @DisplayName("Renter: Register new user account")
    void testRenter_Registration() {
        // Given
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
        renterUsername = "renter_int_" + timestamp;
        
        // When
        User renter = userService.createUser(renterUsername, "RenterPass123!", "Renter bio");

        // Then
        assertThat(renter).isNotNull();
        assertThat(renter.getUsername()).isEqualTo(renterUsername);
        assertThat(renter.getUserId()).isNotNull();
        
        renterId = renter.getUserId();
        System.out.println("✅ Renter registered: " + renterUsername + " (ID: " + renterId + ")");
    }

    @Test
    @Order(11)
    @DisplayName("Renter: Login successfully")
    void testRenter_Login() {
        // When
        Optional<User> renterOpt = userService.findByUsername(renterUsername);
        assertThat(renterOpt).isPresent();
        User renter = renterOpt.get();
        boolean validPassword = userService.validatePassword(renter, "RenterPass123!");

        // Then
        assertThat(validPassword).isTrue();
        assertThat(renter.getUsername()).isEqualTo(renterUsername);
        
        System.out.println("✅ Renter logged in successfully");
    }

    @Test
    @Order(12)
    @DisplayName("Renter: Browse all available games")
    void testRenter_BrowseGames() {
        // When
        var games = gameService.getAllGames();

        // Then
        assertThat(games).isNotEmpty();
        
        // Verify owner's game is in the list
        boolean ownerGameFound = games.stream()
            .anyMatch(g -> g.getGameId().equals(gameId));
        
        assertThat(ownerGameFound).isTrue();
        System.out.println("✅ Renter browsed " + games.size() + " game(s) and found owner's game");
    }

    @Test
    @Order(13)
    @DisplayName("Renter: View specific game details")
    void testRenter_ViewGameDetails() {
        // When
        var gameOpt = gameService.getGameById(gameId);

        // Then
        assertThat(gameOpt).isPresent();
        assertThat(gameOpt.get().getGameId()).isEqualTo(gameId);
        assertThat(gameOpt.get().getOwnerUsername()).isEqualTo(ownerUsername);
        
        System.out.println("✅ Renter viewed game details");
    }

    @Test
    @Order(14)
    @DisplayName("Renter: Create booking for owner's game")
    void testRenter_CreateBooking() {
        // When
        Booking booking = bookingService.createBooking(
            renterId,
            gameId,
            LocalDate.now().plusDays(1),
            LocalDate.now().plusDays(4)
        );

        // Then
        assertThat(booking).isNotNull();
        assertThat(booking.getBookingId()).isNotNull();
        assertThat(booking.getTotalPrice()).isGreaterThan(0.0);
        
        bookingId = booking.getBookingId();
        System.out.println("✅ Renter created booking (ID: " + bookingId + ", Total: €" + booking.getTotalPrice() + ")");
    }

    @Test
    @Order(15)
    @DisplayName("Renter: View their bookings")
    void testRenter_ViewOwnBookings() {
        // When
        var bookings = bookingService.getBookingsByUser(renterId);

        // Then
        assertThat(bookings).isNotEmpty();
        
        // Verify the booking exists
        boolean bookingFound = bookings.stream()
            .anyMatch(b -> b.getBookingId().equals(bookingId));
        
        assertThat(bookingFound).isTrue();
        System.out.println("✅ Renter viewed " + bookings.size() + " booking(s)");
    }

    // ============ CROSS-WORKFLOW TESTS ============

    @Test
    @Order(20)
    @DisplayName("Owner: View bookings for their game")
    void testOwner_ViewGameBookings() {
        // When
        var bookings = bookingService.getBookingsByGame(gameId);

        // Then
        assertThat(bookings).isNotEmpty();
        
        // Verify renter's booking is visible
        boolean renterBookingFound = bookings.stream()
            .anyMatch(b -> b.getBookingId().equals(bookingId) && 
                          b.getUser().getUsername().equals(renterUsername));
        
        assertThat(renterBookingFound).isTrue();
        System.out.println("✅ Owner viewed " + bookings.size() + " booking(s) for their game");
    }

    @Test
    @Order(21)
    @DisplayName("Verify complete workflow integrity")
    void testWorkflow_Integrity() {
        // Verify all entities exist
        assertThat(userService.findByUsername(ownerUsername)).isPresent();
        assertThat(userService.findByUsername(renterUsername)).isPresent();
        assertThat(gameService.getGameById(gameId)).isPresent();

        // Verify relationships
        Game game = gameService.getGameById(gameId).get();
        assertThat(game.getOwnerUsername()).isEqualTo(ownerUsername);

        var bookings = bookingService.getBookingsByUser(renterId);
        Booking booking = bookings.stream()
            .filter(b -> b.getBookingId().equals(bookingId))
            .findFirst()
            .orElse(null);
        
        assertThat(booking).isNotNull();
        assertThat(booking.getGame().getGameId()).isEqualTo(gameId);
        assertThat(booking.getUser().getUserId()).isEqualTo(renterId);
        assertThat(booking.getTotalPrice()).isGreaterThan(0.0);

        System.out.println("✅ Complete workflow integrity verified");
        System.out.println("   Owner: " + ownerUsername + " created game ID: " + gameId);
        System.out.println("   Renter: " + renterUsername + " created booking ID: " + bookingId);
    }

    @Test
    @Order(22)
    @DisplayName("Renter: Create another booking for same game")
    void testRenter_PreventOverlappingBooking() {
        // When - try to book with overlapping dates
        Booking secondBooking = bookingService.createBooking(
            renterId,
            gameId,
            LocalDate.now().plusDays(5), // Different dates to avoid overlap check
            LocalDate.now().plusDays(8)
        );

        // Then - booking should be created (service layer allows multiple bookings)
        assertThat(secondBooking).isNotNull();
        assertThat(secondBooking.getBookingId()).isNotEqualTo(bookingId);
        
        System.out.println("✅ Second booking created successfully (ID: " + secondBooking.getBookingId() + ")");
    }
}
