package test1.test1.service;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import test1.test1.model.Booking;
import test1.test1.model.Game;
import test1.test1.model.User;
import test1.test1.repository.BookingRepository;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private GameService gameService;

    @Mock
    private UserService userService;

    @InjectMocks
    private BookingService bookingService;

    private User user;
    private Game game;

    @BeforeEach
    void setup() {
        user = new User("u1");
        user.setUserId(1);

        game = new Game("Tetris", "desc", 2.0);
        game.setGameId(10);
        game.setAvailable(true);
    }

    @Test
    void createBooking_successfulCreatesAndSaves() {
        when(userService.getAllUsers()).thenReturn(List.of(user));
        when(gameService.getGame(10)).thenReturn(game);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(3);

        Booking b = bookingService.createBooking(1, 10, start, end);

        assertThat(b).isNotNull();
        verify(gameService).save(game);
        verify(bookingRepository).save(any(Booking.class));
        assertThat(game.isAvailable()).isFalse();
    }

    @Test
    void createBooking_failsWhenUserMissing() {
        when(userService.getAllUsers()).thenReturn(List.of());
        when(gameService.getGame(10)).thenReturn(game);

        Booking b = bookingService.createBooking(1, 10, LocalDate.now(), LocalDate.now().plusDays(1));

        assertThat(b).isNull();
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_failsWhenGameUnavailable() {
        user.setUserId(1);
        when(userService.getAllUsers()).thenReturn(List.of(user));
        game.setAvailable(false);
        when(gameService.getGame(10)).thenReturn(game);

        Booking b = bookingService.createBooking(1, 10, LocalDate.now(), LocalDate.now().plusDays(1));

        assertThat(b).isNull();
        verify(bookingRepository, never()).save(any());
    }
}
