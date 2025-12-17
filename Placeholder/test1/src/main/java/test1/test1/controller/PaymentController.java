package test1.test1.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import test1.test1.model.Payment;
import test1.test1.model.Booking;
import test1.test1.model.User;
import test1.test1.service.PaymentService;
import test1.test1.service.BookingService;
import test1.test1.service.UserService;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final BookingService bookingService;
    private final UserService userService;

    public PaymentController(PaymentService paymentService, BookingService bookingService, UserService userService) {
        this.paymentService = paymentService;
        this.bookingService = bookingService;
        this.userService = userService;
    }

    /**
     * Process a payment
     * Expected request body:
     * {
     *   "method": "stripe" or "paypal",
     *   "amount": 99.99,
     *   "currency": "USD",
     *   "bookingData": {
     *     "userId": 1,
     *     "username": "john_doe",
     *     "gameId": 5,
     *     "startDate": "2024-12-20",
     *     "endDate": "2024-12-22"
     *   },
     *   "card": { ... } (for Stripe)
     *   "paypal": { ... } (for PayPal)
     * }
     */
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> request) {
        try {
            String method = (String) request.get("method");
            Double amount = ((Number) request.get("amount")).doubleValue();
            String currency = (String) request.get("currency");
            
            Map<String, Object> bookingData = (Map<String, Object>) request.get("bookingData");
            
            if (method == null || amount == null || currency == null || bookingData == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Missing required payment fields"));
            }

            // Extract booking data
            Integer userId = ((Number) bookingData.get("userId")).intValue();
            String username = (String) bookingData.get("username");
            Integer gameId = ((Number) bookingData.get("gameId")).intValue();
            String startDateStr = (String) bookingData.get("startDate");
            String endDateStr = (String) bookingData.get("endDate");

            // Create booking first if not already exists
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404)
                    .body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();

            // Create booking
            Booking booking = bookingService.createBooking(
                user.getUserId(),
                gameId,
                LocalDate.parse(startDateStr),
                LocalDate.parse(endDateStr)
            );

            if (booking == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Unable to create booking"));
            }

            // Process payment
            String cardLast4 = null;
            String cardBrand = null;
            String paypalEmail = null;

            if ("stripe".equals(method)) {
                Map<String, Object> cardData = (Map<String, Object>) request.get("card");
                if (cardData != null) {
                    String cardNumber = (String) cardData.get("number");
                    if (cardNumber != null && cardNumber.length() >= 4) {
                        cardLast4 = cardNumber.substring(cardNumber.length() - 4);
                        cardBrand = detectCardBrand(cardNumber);
                    }
                }
            } else if ("paypal".equals(method)) {
                Map<String, Object> paypalData = (Map<String, Object>) request.get("paypal");
                if (paypalData != null) {
                    paypalEmail = (String) paypalData.get("email");
                }
            }

            Payment payment = paymentService.processPayment(
                booking.getBookingId(),
                method,
                amount,
                currency,
                cardLast4,
                cardBrand,
                paypalEmail
            );

            if ("FAILED".equals(payment.getStatus())) {
                return ResponseEntity.badRequest()
                    .body(Map.of(
                        "message", "Payment failed: " + payment.getFailureReason(),
                        "status", "FAILED"
                    ));
            }

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentId", payment.getPaymentId());
            response.put("bookingId", booking.getBookingId());
            response.put("transactionId", payment.getTransactionId());
            response.put("amount", payment.getAmount());
            response.put("currency", payment.getCurrency());
            response.put("status", payment.getStatus());
            response.put("message", "Payment processed successfully!");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Invalid input: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", "Payment processing error: " + e.getMessage()));
        }
    }

    /**
     * Get payment by ID
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPayment(@PathVariable Integer paymentId) {
        try {
            Optional<Payment> paymentOpt = paymentService.getPaymentById(paymentId);
            if (paymentOpt.isEmpty()) {
                return ResponseEntity.status(404)
                    .body(Map.of("message", "Payment not found"));
            }
            return ResponseEntity.ok(paymentOpt.get());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", "Error retrieving payment: " + e.getMessage()));
        }
    }

    /**
     * Get payment by transaction ID
     */
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<?> getPaymentByTransaction(@PathVariable String transactionId) {
        try {
            Optional<Payment> paymentOpt = paymentService.getPaymentByTransactionId(transactionId);
            if (paymentOpt.isEmpty()) {
                return ResponseEntity.status(404)
                    .body(Map.of("message", "Payment not found"));
            }
            return ResponseEntity.ok(paymentOpt.get());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", "Error retrieving payment: " + e.getMessage()));
        }
    }

    /**
     * Refund a payment
     */
    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<?> refundPayment(@PathVariable Integer paymentId, @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            if (reason == null) {
                reason = "User requested refund";
            }

            Payment payment = paymentService.refundPayment(paymentId, reason);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentId", payment.getPaymentId());
            response.put("status", payment.getStatus());
            response.put("message", "Payment refunded successfully");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Invalid payment: " + e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", "Error processing refund: " + e.getMessage()));
        }
    }

    /**
     * Get all payments (admin only)
     */
    @GetMapping
    public ResponseEntity<?> getAllPayments() {
        try {
            List<Payment> payments = paymentService.getAllPayments();
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", "Error retrieving payments: " + e.getMessage()));
        }
    }

    /**
     * Detect card brand from card number
     */
    private String detectCardBrand(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 1) {
            return "Unknown";
        }

        String firstDigits = cardNumber.substring(0, Math.min(6, cardNumber.length()));

        if (firstDigits.startsWith("4")) {
            return "Visa";
        } else if (firstDigits.startsWith("5")) {
            return "Mastercard";
        } else if (firstDigits.startsWith("3")) {
            if (firstDigits.startsWith("34") || firstDigits.startsWith("37")) {
                return "American Express";
            } else if (firstDigits.startsWith("36") || firstDigits.startsWith("38")) {
                return "Diners Club";
            }
        } else if (firstDigits.startsWith("6")) {
            return "Discover";
        }

        return "Unknown";
    }
}
