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

        if (user == null || game == null || !game.isActive()) {
            return null; // simple validation
        }

        long days = ChronoUnit.DAYS.between(start, end);
        double totalPrice = days * game.getPricePerDay();

        Booking booking = new Booking(user, game, start, end, totalPrice);

        // mark game as rented (inactive)
        game.setActive(false);
        gameService.save(game);

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}
