package test1.test1.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer paymentId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(nullable = false)
    private String paymentMethod; // 'stripe', 'paypal'

    @Column(nullable = false)
    private double amount;

    @Column(nullable = false)
    private String currency; // 'USD', 'EUR', etc.

    @Column(nullable = false)
    private String status; // 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'

    @Column(nullable = false)
    private String transactionId; // Reference to external payment provider

    @Column
    private String cardLast4; // For Stripe - last 4 digits of card

    @Column
    private String cardBrand; // For Stripe - card brand (Visa, MasterCard, etc.)

    @Column
    private String paypalEmail; // For PayPal

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime completedAt;

    @Column
    private String failureReason;

    protected Payment() {}

    public Payment(Booking booking, String paymentMethod, double amount, String currency) {
        this.booking = booking;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.currency = currency;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Integer paymentId) {
        this.paymentId = paymentId;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getCardLast4() {
        return cardLast4;
    }

    public void setCardLast4(String cardLast4) {
        this.cardLast4 = cardLast4;
    }

    public String getCardBrand() {
        return cardBrand;
    }

    public void setCardBrand(String cardBrand) {
        this.cardBrand = cardBrand;
    }

    public String getPaypalEmail() {
        return paypalEmail;
    }

    public void setPaypalEmail(String paypalEmail) {
        this.paypalEmail = paypalEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }
}
