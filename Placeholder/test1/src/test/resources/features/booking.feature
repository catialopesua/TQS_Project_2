Feature: Booking management
  As a user booking games
  I want to create and manage bookings
  So that my reservations are handled correctly

  Scenario: Create booking by username succeeds
    Given booking user exists with username "alice" and id 1
    And booking creation will succeed with booking id 200 and total price 40.0
    When I create a booking for username "alice", game 5 from "2025-12-01" to "2025-12-03"
    Then the response status should be 200

  Scenario: Create booking by username for missing user fails
    Given no user exists with username "ghost"
    When I create a booking for username "ghost", game 5 from "2025-12-01" to "2025-12-03"
    Then the response status should be 404

  Scenario: Update booking status with invalid value fails
    When I update booking 300 to status "INVALID"
    Then the response status should be 400
