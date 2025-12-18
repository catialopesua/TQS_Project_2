package test1.test1.bdd.steps;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import org.mockito.Mockito;
import test1.test1.bdd.World;
import test1.test1.controller.BookingController;
import test1.test1.model.Booking;
import test1.test1.model.Game;
import test1.test1.model.User;
import test1.test1.service.BookingService;
import test1.test1.service.UserService;

public class BookingSteps {

    private final BookingService bookingService = Mockito.mock(BookingService.class);
    private final UserService userService = Mockito.mock(UserService.class);
    private final BookingController controller = new BookingController(bookingService, userService);

    private Integer lastUserId;
    private Integer lastGameId;

    @Given("booking creation will succeed with booking id {int} and total price {double}")
    public void booking_creation_will_succeed(Integer bookingId, Double totalPrice) {
        when(bookingService.createBooking(anyInt(), anyInt(), any(), any())).thenAnswer(inv -> {
            Integer userId = inv.getArgument(0);
            Integer gameId = inv.getArgument(1);
            User user = new User("user-" + userId);
            user.setUserId(userId);
            Game game = new Game("game-" + gameId, "Desc", 10.0);
            game.setGameId(gameId);
            Booking booking = new Booking(user, game, LocalDate.parse("2025-12-01"), LocalDate.parse("2025-12-03"), totalPrice);
            booking.setBookingId(bookingId);
            return booking;
        });
    }

    @Given("booking user exists with username {string} and id {int}")
    public void booking_user_exists(String username, Integer id) {
        User user = new User(username);
        user.setUserId(id);
        this.lastUserId = id;
        when(userService.findByUsername(username)).thenReturn(Optional.of(user));
    }

    @Given("no user exists with username {string}")
    public void no_user_exists(String username) {
        when(userService.findByUsername(username)).thenReturn(Optional.empty());
    }

    @When("I create a booking for username {string}, game {int} from {string} to {string}")
    public void i_create_booking_for_username(String username, Integer gameId, String start, String end) {
        this.lastGameId = gameId;
        BookingController.BookingRequest req = new BookingController.BookingRequest();
        req.username = username;
        req.gameId = gameId;
        req.startDate = start;
        req.endDate = end;
        World.lastResponse = controller.createBookingByUsername(req);
    }

    @When("I update booking {int} to status {string}")
    public void i_update_booking_to_status(Integer bookingId, String status) {
        when(bookingService.updateBookingStatus(eq(bookingId), eq(status))).thenReturn(null);
        World.lastResponse = controller.updateBookingStatus(bookingId, Map.of("status", status));
    }
}
