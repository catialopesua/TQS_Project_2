package test1.test1.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import test1.test1.model.Booking;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByGameGameId(Integer gameId);
    List<Booking> findByUserUserId(Integer userId);
    List<Booking> findByGameOwnerUsername(String ownerUsername);
}
