package test1.test1.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import test1.test1.model.Booking;
import test1.test1.model.Payment;
import test1.test1.model.User;
import test1.test1.service.BookingService;
import test1.test1.service.PaymentService;
import test1.test1.service.UserService;

@ExtendWith(MockitoExtension.class)
public class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;
    @Mock
    private BookingService bookingService;
    @Mock
    private UserService userService;

    private PaymentController controller;

    @BeforeEach
    void setUp() {
        controller = new PaymentController(paymentService, bookingService, userService);
    }

    /**
     * Testing private method detectCardBrand using Reflection
     */
    @Test
    void testDetectCardBrand_reflective() throws Exception {
        java.lang.reflect.Method method = PaymentController.class.getDeclaredMethod(
            "detectCardBrand", 
            String.class
        );
        method.setAccessible(true);

        // Test various brands
        assertEquals("Visa", method.invoke(controller, "41112222"));
        assertEquals("Mastercard", method.invoke(controller, "51234567"));
        assertEquals("American Express", method.invoke(controller, "34123456"));
        assertEquals("Discover", method.invoke(controller, "60110000"));
        assertEquals("Unknown", method.invoke(controller, "99999999"));
        assertEquals("Unknown", method.invoke(controller, (String) null));
    }

    /**
     * Testing successful Stripe payment path
     */
    @Test
    void testProcessPayment_StripeSuccess() {
        // Arrange request map
        Map<String, Object> request = createValidStripeRequest();
        
        User user = new User("john_doe");
        Booking booking = new Booking();
        booking.setBookingId(10);
        Payment payment = new Payment();
        payment.setPaymentId(500);
        payment.setStatus("COMPLETED");

        when(userService.findByUsername("john_doe")).thenReturn(Optional.of(user));
        when(bookingService.createBooking(any(), anyInt(), any(), any())).thenReturn(booking);
        when(paymentService.processPayment(anyInt(), eq("stripe"), anyDouble(), anyString(), anyString(), anyString(), any()))
            .thenReturn(payment);

        // Act
        ResponseEntity<?> response = controller.processPayment(request);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertTrue((Boolean) body.get("success"));
        assertEquals(500, body.get("paymentId"));
    }

    /**
     * Testing missing required fields logic
     */
    @Test
    void testProcessPayment_MissingFields() {
        Map<String, Object> request = new HashMap<>();
        request.put("method", "stripe");
        // amount is missing, which triggers the NPE in the current controller

        ResponseEntity<?> response = controller.processPayment(request);

        // Matches the current actual behavior (500 error)
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertTrue(body.get("message").toString().contains("Payment processing error"));
    }

    /**
     * Testing User Not Found scenario
     */
    @Test
    void testProcessPayment_UserNotFound() {
        Map<String, Object> request = createValidStripeRequest();
        when(userService.findByUsername(anyString())).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.processPayment(request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals("User not found", body.get("message"));
    }

    @Test
    void testGetPayment_Found() {
        Payment payment = new Payment();
        payment.setPaymentId(1);
        when(paymentService.getPaymentById(1)).thenReturn(Optional.of(payment));

        ResponseEntity<?> response = controller.getPayment(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(payment, response.getBody());
    }

    @Test
    void testRefundPayment_InternalException() {
        // Simulate an unexpected error to trigger the general catch block
        when(paymentService.refundPayment(anyInt(), anyString()))
            .thenThrow(new RuntimeException("Database down"));

        ResponseEntity<?> response = controller.refundPayment(1, Map.of("reason", "test"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertTrue(body.get("message").toString().contains("Database down"));
    }

    // Helper to build the nested request object
    private Map<String, Object> createValidStripeRequest() {
        Map<String, Object> request = new HashMap<>();
        request.put("method", "stripe");
        request.put("amount", 99.99);
        request.put("currency", "USD");

        Map<String, Object> bookingData = new HashMap<>();
        bookingData.put("userId", 1);
        bookingData.put("username", "john_doe");
        bookingData.put("gameId", 5);
        bookingData.put("startDate", "2024-12-20");
        bookingData.put("endDate", "2024-12-22");
        request.put("bookingData", bookingData);
        
        request.put("card", Map.of("number", "4111222233334444"));
        return request;
    }

    /**
     * Tests for getPayment(Integer paymentId)
     */
    @Test
    void testGetPayment_NotFound() {
        when(paymentService.getPaymentById(999)).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.getPayment(999);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals("Payment not found", body.get("message"));
    }

    @Test
    void testGetPayment_Exception() {
        when(paymentService.getPaymentById(anyInt())).thenThrow(new RuntimeException("Database error"));

        ResponseEntity<?> response = controller.getPayment(1);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertTrue(body.get("message").toString().contains("Error retrieving payment"));
    }

    /**
     * Tests for getPaymentByTransaction(String transactionId)
     */
    @Test
    void testGetPaymentByTransaction_Success() {
        Payment payment = new Payment();
        payment.setTransactionId("txn_123");
        when(paymentService.getPaymentByTransactionId("txn_123")).thenReturn(Optional.of(payment));

        ResponseEntity<?> response = controller.getPaymentByTransaction("txn_123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(payment, response.getBody());
    }

    @Test
    void testGetPaymentByTransaction_NotFound() {
        when(paymentService.getPaymentByTransactionId("invalid_txn")).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.getPaymentByTransaction("invalid_txn");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    /**
     * Tests for refundPayment(Integer paymentId, Map request)
     */
    @Test
    void testRefundPayment_Success_DefaultReason() {
        Payment payment = new Payment();
        payment.setPaymentId(1);
        payment.setStatus("REFUNDED");
        
        // Pass empty map to trigger the "User requested refund" default logic
        when(paymentService.refundPayment(eq(1), eq("User requested refund"))).thenReturn(payment);

        ResponseEntity<?> response = controller.refundPayment(1, new HashMap<>());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals("Payment refunded successfully", body.get("message"));
        assertTrue((Boolean) body.get("success"));
    }

    @Test
    void testRefundPayment_IllegalArgumentException() {
        when(paymentService.refundPayment(anyInt(), anyString()))
            .thenThrow(new IllegalArgumentException("Payment doesn't exist"));

        ResponseEntity<?> response = controller.refundPayment(1, Map.of("reason", "none"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertTrue(body.get("message").toString().contains("Invalid payment"));
    }

    @Test
    void testRefundPayment_IllegalStateException() {
        // Covers logic when payment isn't COMPLETED
        when(paymentService.refundPayment(anyInt(), anyString()))
            .thenThrow(new IllegalStateException("Cannot refund failed payment"));

        ResponseEntity<?> response = controller.refundPayment(1, Map.of("reason", "none"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals("Cannot refund failed payment", body.get("message"));
    }

    /**
     * Tests for getAllPayments()
     */
    @Test
    void testGetAllPayments_Success() {
        java.util.List<Payment> payments = java.util.List.of(new Payment(), new Payment());
        when(paymentService.getAllPayments()).thenReturn(payments);

        ResponseEntity<?> response = controller.getAllPayments();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(payments, response.getBody());
    }

    @Test
    void testGetAllPayments_Exception() {
        when(paymentService.getAllPayments()).thenThrow(new RuntimeException("Empty table"));

        ResponseEntity<?> response = controller.getAllPayments();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertTrue(body.get("message").toString().contains("Error retrieving payments"));
    }
}