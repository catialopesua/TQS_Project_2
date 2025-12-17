package test1.test1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import test1.test1.model.Payment;
import test1.test1.model.Booking;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByBooking(Booking booking);
    List<Payment> findByStatus(String status);
    Optional<Payment> findByBookingAndStatus(Booking booking, String status);
}
