package test1.test1.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import test1.test1.model.Booking;
import test1.test1.model.Game;
import test1.test1.model.Payment;
import test1.test1.model.User;
import test1.test1.repository.BookingRepository;
import test1.test1.repository.PaymentRepository;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Booking sampleBooking() {
        User user = new User("john");
        Game game = new Game("Chess", "Desc", 10.0);
        Booking booking = new Booking(user, game, LocalDate.now(), LocalDate.now().plusDays(2), 20.0);
        booking.setBookingId(10);
        return booking;
    }

    @Test
    void processPayment_stripe_success_setsCompletedStatus() {
        Booking booking = sampleBooking();
        when(bookingRepository.findById(10)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Payment result = null;
        for (int i = 0; i < 20; i++) {
            result = paymentService.processPayment(10, "stripe", 50.0, "USD", "1111", "Visa", null);
            if ("COMPLETED".equals(result.getStatus())) {
                break;
            }
        }

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("COMPLETED");
        assertThat(result.getCompletedAt()).isNotNull();
        assertThat(result.getCardLast4()).isEqualTo("1111");
        assertThat(result.getCardBrand()).isEqualTo("Visa");
        assertThat(result.getTransactionId()).startsWith("txn_stripe_");
    }

    @Test
    void processPayment_failure_setsFailedStatus() {
        Booking booking = sampleBooking();
        when(bookingRepository.findById(10)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Payment result = paymentService.processPayment(10, "cashapp", 75.0, "EUR", null, null, "user@example.com");

        assertThat(result.getStatus()).isEqualTo("FAILED");
        assertThat(result.getFailureReason()).isNotBlank();
        assertThat(result.getCompletedAt()).isNull();
        assertThat(result.getPaypalEmail()).isNull();
        assertThat(result.getTransactionId()).startsWith("txn_paypal_");
    }

    @Test
    void processPayment_bookingMissing_throwsIllegalArgument() {
        when(bookingRepository.findById(99)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class,
            () -> paymentService.processPayment(99, "stripe", 10.0, "USD", null, null, null));
    }

    @Test
    void refundPayment_success_setsRefunded() {
        Booking booking = sampleBooking();
        Payment payment = new Payment(booking, "stripe", 40.0, "USD");
        payment.setPaymentId(5);
        payment.setStatus("COMPLETED");
        when(paymentRepository.findById(5)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        Payment result = paymentService.refundPayment(5, "Reason");

        assertThat(result.getStatus()).isEqualTo("REFUNDED");
        assertThat(result.getFailureReason()).isEqualTo("Reason");
    }

    @Test
    void refundPayment_notFound_throws() {
        when(paymentRepository.findById(7)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> paymentService.refundPayment(7, "r"));
    }

    @Test
    void refundPayment_notCompleted_throws() {
        Booking booking = sampleBooking();
        Payment payment = new Payment(booking, "stripe", 40.0, "USD");
        payment.setStatus("FAILED");
        when(paymentRepository.findById(8)).thenReturn(Optional.of(payment));

        assertThrows(IllegalStateException.class, () -> paymentService.refundPayment(8, "r"));
    }

    @Test
    void hasSuccessfulPayment_checksRepository() {
        Booking booking = sampleBooking();
        when(paymentRepository.findByBookingAndStatus(eq(booking), eq("COMPLETED"))).thenReturn(Optional.of(new Payment(booking, "stripe", 10.0, "USD")));
        assertThat(paymentService.hasSuccessfulPayment(booking)).isTrue();

        when(paymentRepository.findByBookingAndStatus(eq(booking), eq("COMPLETED"))).thenReturn(Optional.empty());
        assertThat(paymentService.hasSuccessfulPayment(booking)).isFalse();
    }

    @Test
    void repositoryDelegates_returnData() {
        Booking booking = sampleBooking();
        Payment payment = new Payment(booking, "paypal", 25.0, "EUR");
        when(paymentRepository.findAll()).thenReturn(List.of(payment));
        when(paymentRepository.findByStatus("FAILED")).thenReturn(List.of(payment));
        when(paymentRepository.findByBooking(booking)).thenReturn(List.of(payment));
        when(paymentRepository.findByTransactionId("tx")).thenReturn(Optional.of(payment));
        when(paymentRepository.findById(1)).thenReturn(Optional.of(payment));

        assertThat(paymentService.getAllPayments()).containsExactly(payment);
        assertThat(paymentService.getPaymentsByStatus("FAILED")).containsExactly(payment);
        assertThat(paymentService.getPaymentsByBooking(booking)).containsExactly(payment);
        assertThat(paymentService.getPaymentByTransactionId("tx")).contains(payment);
        assertThat(paymentService.getPaymentById(1)).contains(payment);
    }

    @Test
    void processPayment_paypal_success_setsPaypalDetails() {
        // Arrange
        Booking booking = sampleBooking();
        String paypalEmail = "test@paypal.com";
        when(bookingRepository.findById(10)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act - Loop to ensure we hit the 95% success path for simulation
        Payment result = null;
        for (int i = 0; i < 50; i++) {
            result = paymentService.processPayment(10, "paypal", 50.0, "USD", null, null, paypalEmail);
            if ("COMPLETED".equals(result.getStatus())) break;
        }

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("COMPLETED");
        assertThat(result.getPaypalEmail()).isEqualTo(paypalEmail);
        assertThat(result.getTransactionId()).startsWith("txn_paypal_");
        assertThat(result.getCardLast4()).isNull(); // Ensure stripe details aren't set
    }

    @Test
    void processPayment_unrecognizedMethod_returnsFailedStatus() {
        // Arrange
        Booking booking = sampleBooking();
        when(bookingRepository.findById(10)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act - Using a method not handled in simulation (e.g., "bitcoin")
        Payment result = paymentService.processPayment(10, "bitcoin", 100.0, "BTC", null, null, null);

        // Assert
        assertThat(result.getStatus()).isEqualTo("FAILED");
        assertThat(result.getFailureReason()).contains("Payment processing failed");
        // Verify default transaction ID prefix is paypal (based on current ternary logic)
        assertThat(result.getTransactionId()).startsWith("txn_paypal_");
    }

    @Test
    void processPayment_nullValues_stillCreatesRecord() {
        // Arrange
        Booking booking = sampleBooking();
        when(bookingRepository.findById(10)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act - Testing with minimal data
        Payment result = paymentService.processPayment(10, "stripe", 0.0, null, null, null, null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualTo(0.0);
        assertThat(result.getCurrency()).isNull();
    }

    @Test
    void processPayment_verifyStripeDetailsNotLeakedToPaypal() {
        // Arrange
        Booking booking = sampleBooking();
        when(bookingRepository.findById(10)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act - Sending Stripe details to a PayPal payment
        Payment result = paymentService.processPayment(10, "paypal", 50.0, "USD", "4242", "Visa", "user@test.com");

        // Assert
        assertThat(result.getPaypalEmail()).isEqualTo("user@test.com");
        assertThat(result.getCardLast4()).isNull(); // Crucial: Verify logic branches don't cross
        assertThat(result.getCardBrand()).isNull();
    }

    @Test
    void refundPayment_preservesExistingData() {
        // Arrange
        Booking booking = sampleBooking();
        Payment existingPayment = new Payment(booking, "stripe", 100.0, "USD");
        existingPayment.setPaymentId(99);
        existingPayment.setStatus("COMPLETED");
        existingPayment.setTransactionId("txn_123");
        
        when(paymentRepository.findById(99)).thenReturn(Optional.of(existingPayment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Payment refunded = paymentService.refundPayment(99, "Customer requested refund");

        // Assert
        assertThat(refunded.getStatus()).isEqualTo("REFUNDED");
        assertThat(refunded.getTransactionId()).isEqualTo("txn_123"); // ID should not change
        assertThat(refunded.getAmount()).isEqualTo(100.0); // Amount should remain same
        assertThat(refunded.getFailureReason()).isEqualTo("Customer requested refund");
    }

    @Test
    void getAllPayments_callsRepositoryFindAll() {
        // Act
        paymentService.getAllPayments();
        
        // Assert
        verify(paymentRepository, times(1)).findAll();
    }

    @Test
    void getPaymentsByBooking_callsRepositoryWithCorrectObject() {
        // Arrange
        Booking booking = sampleBooking();
        
        // Act
        paymentService.getPaymentsByBooking(booking);
        
        // Assert
        verify(paymentRepository).findByBooking(booking);
    }
}
