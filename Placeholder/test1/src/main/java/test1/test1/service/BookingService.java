package test1.test1.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;

import test1.test1.model.Booking;
import test1.test1.model.Game;
import test1.test1.model.User;
import test1.test1.repository.BookingRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final GameService gameService;
    private final UserService userService;

    public BookingService(BookingRepository bookingRepository, GameService gameService, UserService userService) {
        this.bookingRepository = bookingRepository;
        this.gameService = gameService;
        this.userService = userService;
    }

    public Booking createBooking(Integer userId, Integer gameId, LocalDate start, LocalDate end) {

        User user = userService.getAllUsers().stream()
                .filter(u -> u.getUserId().equals(userId))
                .findFirst().orElse(null);

        Game game = gameService.getGame(gameId);

        if (user == null || game == null) {
            return null; // simple validation
        }

        long days = ChronoUnit.DAYS.between(start, end) + 1; // +1 to include both start and end days
        double totalPrice = days * game.getPricePerDay();

        Booking booking = new Booking(user, game, start, end, totalPrice);

        // Don't mark game as inactive - multiple bookings for different dates are allowed
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByGame(Integer gameId) {
        return bookingRepository.findByGameGameId(gameId);
    }

    public List<Booking> getBookingsByUser(Integer userId) {
        return bookingRepository.findByUserUserId(userId);
    }
}
