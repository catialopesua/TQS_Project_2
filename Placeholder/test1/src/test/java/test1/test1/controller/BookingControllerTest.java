package test1.test1.controller;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import test1.test1.model.Booking;
import test1.test1.model.User;
import test1.test1.service.BookingService;
import test1.test1.service.UserService;
import java.util.Optional;
import java.util.List;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @Mock
    private UserService userService;

    @InjectMocks
    private BookingController bookingController;

    @Test
    void createBooking_delegatesToService() {
        Booking b = new Booking(null, null, null, null, 100.0);
        when(bookingService.createBooking(1, 2, 
                java.time.LocalDate.parse("2024-07-01"), 
                java.time.LocalDate.parse("2024-07-05"))).thenReturn(b);

        java.util.Map<String, Object> request = new java.util.HashMap<>();
        request.put("userId", 1);
        request.put("gameId", 2);
        request.put("startDate", "2024-07-01");
        request.put("endDate", "2024-07-05");
        
        org.springframework.http.ResponseEntity<?> response = bookingController.createBooking(request);

        assertThat(response).isNotNull();
        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.OK);
        verify(bookingService).createBooking(1, 2, 
                java.time.LocalDate.parse("2024-07-01"), 
                java.time.LocalDate.parse("2024-07-05"));
    }

    @Test
    void createBooking_withStringIds() {
        Booking b = new Booking(null, null, null, null, 50.0);
        when(bookingService.createBooking(3, 4, 
                java.time.LocalDate.parse("2024-08-01"), 
                java.time.LocalDate.parse("2024-08-03"))).thenReturn(b);

        java.util.Map<String, Object> request = new java.util.HashMap<>();
        request.put("userId", "3");
        request.put("gameId", "4");
        request.put("startDate", "2024-08-01");
        request.put("endDate", "2024-08-03");
        
        org.springframework.http.ResponseEntity<?> response = bookingController.createBooking(request);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.OK);
    }

    @Test
    void createBooking_failsWhenBookingNull() {
        when(bookingService.createBooking(1, 2, 
                java.time.LocalDate.parse("2024-07-01"), 
                java.time.LocalDate.parse("2024-07-05"))).thenReturn(null);

        java.util.Map<String, Object> request = new java.util.HashMap<>();
        request.put("userId", 1);
        request.put("gameId", 2);
        request.put("startDate", "2024-07-01");
        request.put("endDate", "2024-07-05");
        
        org.springframework.http.ResponseEntity<?> response = bookingController.createBooking(request);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isInstanceOf(java.util.Map.class);
    }

    @Test
    void createBooking_missingFields() {
        java.util.Map<String, Object> request = new java.util.HashMap<>();
        request.put("userId", 1);
        request.put("gameId", null);
        request.put("startDate", "2024-07-01");
        request.put("endDate", "2024-07-05");
        
        org.springframework.http.ResponseEntity<?> response = bookingController.createBooking(request);

        // NullPointerException thrown when trying to parse null gameId
        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void createBooking_invalidNumberFormat() {
        java.util.Map<String, Object> request = new java.util.HashMap<>();
        request.put("userId", "invalid");
        request.put("gameId", 2);
        request.put("startDate", "2024-07-01");
        request.put("endDate", "2024-07-05");
        
        org.springframework.http.ResponseEntity<?> response = bookingController.createBooking(request);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.BAD_REQUEST);
    }

    @Test
    void createBooking_generalException() {
        java.util.Map<String, Object> request = new java.util.HashMap<>();
        request.put("userId", 1);
        request.put("gameId", 2);
        request.put("startDate", "invalid-date");
        request.put("endDate", "2024-07-05");
        
        org.springframework.http.ResponseEntity<?> response = bookingController.createBooking(request);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void createBookingByUsername_success() {
        User user = new User("testuser");
        user.setUserId(5);
        Booking booking = new Booking(user, null, 
                java.time.LocalDate.parse("2024-09-01"), 
                java.time.LocalDate.parse("2024-09-05"), 75.0);
        booking.setBookingId(100);
        
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(bookingService.createBooking(5, 10, 
                java.time.LocalDate.parse("2024-09-01"), 
                java.time.LocalDate.parse("2024-09-05"))).thenReturn(booking);

        BookingController.BookingRequest req = new BookingController.BookingRequest();
        req.username = "testuser";
        req.gameId = 10;
        req.startDate = "2024-09-01";
        req.endDate = "2024-09-05";
        
        org.springframework.http.ResponseEntity<?> response = bookingController.createBookingByUsername(req);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.OK);
    }

    @Test
    void createBookingByUsername_userNotFound() {
        when(userService.findByUsername("unknown")).thenReturn(Optional.empty());

        BookingController.BookingRequest req = new BookingController.BookingRequest();
        req.username = "unknown";
        req.gameId = 10;
        req.startDate = "2024-09-01";
        req.endDate = "2024-09-05";
        
        org.springframework.http.ResponseEntity<?> response = bookingController.createBookingByUsername(req);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND);
    }

    @Test
    void createBookingByUsername_bookingFails() {
        User user = new User("testuser");
        user.setUserId(5);
        
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(bookingService.createBooking(5, 10, 
                java.time.LocalDate.parse("2024-09-01"), 
                java.time.LocalDate.parse("2024-09-05"))).thenReturn(null);

        BookingController.BookingRequest req = new BookingController.BookingRequest();
        req.username = "testuser";
        req.gameId = 10;
        req.startDate = "2024-09-01";
        req.endDate = "2024-09-05";
        
        org.springframework.http.ResponseEntity<?> response = bookingController.createBookingByUsername(req);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.BAD_REQUEST);
    }

    @Test
    void createBookingByUsername_nullRequest() {
        org.springframework.http.ResponseEntity<?> response = bookingController.createBookingByUsername(null);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.BAD_REQUEST);
    }

    @Test
    void getAllBookings_delegates() {
        bookingController.getAllBookings();
        verify(bookingService).getAllBookings();
    }

    @Test
    void getBookingsByGame_success() {
        List<Booking> bookings = List.of(
            new Booking(null, null, java.time.LocalDate.now(), java.time.LocalDate.now().plusDays(1), 50.0)
        );
        when(bookingService.getBookingsByGame(5)).thenReturn(bookings);

        org.springframework.http.ResponseEntity<?> response = bookingController.getBookingsByGame(5);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(bookings);
    }

    @Test
    void getBookingsByGame_exception() {
        when(bookingService.getBookingsByGame(5)).thenThrow(new RuntimeException("DB error"));

        org.springframework.http.ResponseEntity<?> response = bookingController.getBookingsByGame(5);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void getBookingsByUser_success() {
        List<Booking> bookings = List.of(
            new Booking(null, null, java.time.LocalDate.now(), java.time.LocalDate.now().plusDays(2), 100.0)
        );
        when(bookingService.getBookingsByUser(7)).thenReturn(bookings);

        org.springframework.http.ResponseEntity<?> response = bookingController.getBookingsByUser(7);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(bookings);
    }

    @Test
    void getBookingsByUser_exception() {
        when(bookingService.getBookingsByUser(7)).thenThrow(new RuntimeException("DB error"));

        org.springframework.http.ResponseEntity<?> response = bookingController.getBookingsByUser(7);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
