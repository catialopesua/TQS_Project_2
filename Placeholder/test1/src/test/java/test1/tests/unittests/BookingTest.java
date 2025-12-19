package test1.tests.unittests;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

import test1.test1.model.Booking;
import test1.test1.model.Game;
import test1.test1.model.User;

public class BookingTest {

    
    @Test
    void testBookingConstructorAndGetters(){
        Game game = new Game("God of War","A very descriptive description",3.4);
        User user = new User("Tiago");
        LocalDate  start = LocalDate.of(2025, 3, 31);
        LocalDate  end = LocalDate.of(2025, 4, 2);    
        Booking booking = new Booking(user, game, start, end, 3.0);
        assertEquals(user, booking.getUser());
        assertEquals(game, booking.getGame());
        assertEquals(start, booking.getStartDate());
        assertEquals(end, booking.getEndDate());
        assertEquals(3.0, booking.getTotalPrice());
    }   

    @Test
    void testBookingSetters(){
        Game game = new Game("God of War","A very descriptive description",3.4);
        User user = new User("Tiago");
        LocalDate  start = LocalDate.of(2025, 3, 31);
        LocalDate  end = LocalDate.of(2025, 4, 2);    
        Booking booking = new Booking(user, game, start, end, 3.0);
        booking.setGame(new Game("Bloodborne", "A hoonter must hoont", 4.0));
        booking.setUser(new User("José"));
        booking.setStartDate(LocalDate.of(2026, 1, 1));
        booking.setEndDate(LocalDate.of(2027, 1, 1));
        booking.setTotalPrice(5.0);
        booking.setStatus("APPROVED");
        assertEquals(booking.getGame().getTitle(), "Bloodborne");
        assertEquals(booking.getUser().getUsername(),"José");
        assertEquals(booking.getStartDate(), LocalDate.of(2026, 1, 1));
        assertEquals(booking.getEndDate(), LocalDate.of(2027, 1, 1));
        assertEquals(booking.getTotalPrice(), 5.0);
        assertEquals(booking.getStatus(), "APPROVED");
        
    }


}
