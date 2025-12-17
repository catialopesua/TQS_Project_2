package test1.test1.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import test1.test1.model.Booking;
import test1.test1.model.User;
import test1.test1.service.BookingService;
import test1.test1.service.UserService;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    public BookingController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> request) {
        try {
            // Parse userId - handle both String and Integer
            Object userIdObj = request.get("userId");
            Integer userId = userIdObj instanceof Integer ? (Integer) userIdObj : Integer.parseInt(userIdObj.toString());
            
            // Parse gameId - handle both String and Integer
            Object gameIdObj = request.get("gameId");
            Integer gameId = gameIdObj instanceof Integer ? (Integer) gameIdObj : Integer.parseInt(gameIdObj.toString());
            
            String startDate = (String) request.get("startDate");
            String endDate = (String) request.get("endDate");

            if (userId == null || gameId == null || startDate == null || endDate == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Missing required fields"));
            }

            Booking booking = bookingService.createBooking(
                    userId,
                    gameId,
                    LocalDate.parse(startDate),
                    LocalDate.parse(endDate)
            );

            if (booking == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Unable to create booking. Game may be unavailable."));
            }

            return ResponseEntity.ok(booking);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Invalid userId or gameId format"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", "Failed to create booking: " + e.getMessage()));
        }
    }

    // Accept JSON payload { username, gameId, startDate, endDate }
    public static class BookingRequest {
        public String username;
        public Integer gameId;
        public String startDate;
        public String endDate;

        // getters/setters omitted for brevity (Jackson will use fields)
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBookingByUsername(@RequestBody BookingRequest req) {
        if (req == null || req.username == null || req.gameId == null || req.startDate == null || req.endDate == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request"));
        }

        Optional<User> maybeUser = userService.findByUsername(req.username);
        if (maybeUser.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = maybeUser.get();

        Booking booking = bookingService.createBooking(
                user.getUserId(),
                req.gameId,
                LocalDate.parse(req.startDate),
                LocalDate.parse(req.endDate)
        );

        if (booking == null) {
            return ResponseEntity.status(400).body(Map.of("error", "Unable to create booking"));
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("bookingId", booking.getBookingId());
        resp.put("totalPrice", booking.getTotalPrice());

        return ResponseEntity.ok(resp);
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/game/{gameId}")
    public ResponseEntity<List<Booking>> getBookingsByGame(@PathVariable Integer gameId) {
        try {
            List<Booking> bookings = bookingService.getBookingsByGame(gameId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUser(@PathVariable Integer userId) {
        try {
            List<Booking> bookings = bookingService.getBookingsByUser(userId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingById(@PathVariable Integer bookingId) {
        try {
            Optional<Booking> booking = bookingService.getBookingById(bookingId);
            if (booking.isEmpty()) {
                return ResponseEntity.status(404)
                    .body(Map.of("message", "Booking not found"));
            }
            return ResponseEntity.ok(booking.get());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", "Error retrieving booking: " + e.getMessage()));
        }
    }

    @GetMapping("/owner/{ownerUsername}")
    public ResponseEntity<List<Booking>> getBookingsByOwner(@PathVariable String ownerUsername) {
        try {
            List<Booking> bookings = bookingService.getBookingsByOwner(ownerUsername);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Integer bookingId, @RequestBody Map<String, String> request) {
        try {
            System.out.println("Received request to update booking " + bookingId);
            System.out.println("Request body: " + request);
            
            String status = request.get("status");
            System.out.println("Status: " + status);
            
            if (status == null || (!status.equals("APPROVED") && !status.equals("DECLINED"))) {
                System.out.println("Invalid status: " + status);
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid status"));
            }

            Booking booking = bookingService.updateBookingStatus(bookingId, status);
            if (booking == null) {
                System.out.println("Booking not found: " + bookingId);
                return ResponseEntity.status(404).body(Map.of("message", "Booking not found"));
            }

            System.out.println("Successfully updated booking to status: " + booking.getStatus());
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            System.err.println("Error updating booking status:");
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to update booking status: " + e.getMessage()));
        }
    }
}
