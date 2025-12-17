package test1.test1.service;

import org.springframework.stereotype.Service;
import test1.test1.model.Payment;
import test1.test1.model.Booking;
import test1.test1.repository.PaymentRepository;
import test1.test1.repository.BookingRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    public PaymentService(PaymentRepository paymentRepository, BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Process a payment - simulates payment processing
     */
    public Payment processPayment(Integer bookingId, String paymentMethod, double amount, String currency, 
                                   String cardLast4, String cardBrand, String paypalEmail) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        
        if (bookingOpt.isEmpty()) {
            throw new IllegalArgumentException("Booking not found");
        }

        Booking booking = bookingOpt.get();

        // Create payment record
        Payment payment = new Payment(booking, paymentMethod, amount, currency);
        
        // Generate transaction ID
        String transactionId = generateTransactionId(paymentMethod);
        payment.setTransactionId(transactionId);

        // Add payment method specific details
        if ("stripe".equals(paymentMethod)) {
            payment.setCardLast4(cardLast4);
            payment.setCardBrand(cardBrand);
        } else if ("paypal".equals(paymentMethod)) {
            payment.setPaypalEmail(paypalEmail);
        }

        // Simulate payment processing
        boolean paymentSuccessful = simulatePaymentProcessing(paymentMethod, amount);

        if (paymentSuccessful) {
            payment.setStatus("COMPLETED");
            payment.setCompletedAt(LocalDateTime.now());
        } else {
            payment.setStatus("FAILED");
            payment.setFailureReason("Payment processing failed. Please try again or use another payment method.");
        }

        // Save payment
        Payment savedPayment = paymentRepository.save(payment);

        return savedPayment;
    }

    /**
     * Simulate payment processing - can be replaced with actual Stripe/PayPal API calls
     */
    private boolean simulatePaymentProcessing(String paymentMethod, double amount) {
        // Simulate 95% success rate
        double successRate = 0.95;
        
        if (paymentMethod.equals("stripe")) {
            // Stripe processing - always succeeds for test card
            return Math.random() < successRate;
        } else if (paymentMethod.equals("paypal")) {
            // PayPal processing
            return Math.random() < successRate;
        }

        return false;
    }

    /**
     * Generate unique transaction ID
     */
    private String generateTransactionId(String paymentMethod) {
        String prefix = paymentMethod.equals("stripe") ? "txn_stripe_" : "txn_paypal_";
        return prefix + UUID.randomUUID().toString().substring(0, 12);
    }

    /**
     * Get payment by ID
     */
    public Optional<Payment> getPaymentById(Integer paymentId) {
        return paymentRepository.findById(paymentId);
    }

    /**
     * Get payment by transaction ID
     */
    public Optional<Payment> getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId);
    }

    /**
     * Get all payments for a booking
     */
    public List<Payment> getPaymentsByBooking(Booking booking) {
        return paymentRepository.findByBooking(booking);
    }

    /**
     * Get all payments with specific status
     */
    public List<Payment> getPaymentsByStatus(String status) {
        return paymentRepository.findByStatus(status);
    }

    /**
     * Refund a payment
     */
    public Payment refundPayment(Integer paymentId, String reason) {
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        
        if (paymentOpt.isEmpty()) {
            throw new IllegalArgumentException("Payment not found");
        }

        Payment payment = paymentOpt.get();

        if (!"COMPLETED".equals(payment.getStatus())) {
            throw new IllegalStateException("Only completed payments can be refunded");
        }

        payment.setStatus("REFUNDED");
        payment.setFailureReason(reason);

        return paymentRepository.save(payment);
    }

    /**
     * Check if a booking has a successful payment
     */
    public boolean hasSuccessfulPayment(Booking booking) {
        Optional<Payment> payment = paymentRepository.findByBookingAndStatus(booking, "COMPLETED");
        return payment.isPresent();
    }

    /**
     * Get all payments (admin function)
     */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}
