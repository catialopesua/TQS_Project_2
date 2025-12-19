-- ============================================================================
-- BitSwap SQLite Database Reset Script
-- Purpose: Drops all tables and recreates them with the same structure
-- Result: Empty database with all schema intact
-- ============================================================================

-- Disable foreign key checks temporarily
PRAGMA foreign_keys = OFF;

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS users;

-- Re-enable foreign key checks
PRAGMA foreign_keys = ON;

-- ============================================================================
-- CREATE USERS TABLE
-- ============================================================================
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    bio TEXT,
    role VARCHAR(255),
    CONSTRAINT uc_users_username UNIQUE (username)
);

-- Create index on username for faster lookups
CREATE INDEX idx_users_username ON users(username);

-- ============================================================================
-- CREATE GAMES TABLE
-- ============================================================================
CREATE TABLE games (
    game_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    price_per_day REAL NOT NULL,
    condition VARCHAR(255) NOT NULL,
    photos VARCHAR(1000),
    tags VARCHAR(500),
    delivery_instructions VARCHAR(1000),
    active BOOLEAN DEFAULT 1,
    start_date DATE,
    end_date DATE,
    owner_username VARCHAR(255),
    created_at DATE NOT NULL,
    CONSTRAINT fk_games_owner FOREIGN KEY (owner_username) REFERENCES users(username) ON DELETE SET NULL
);

-- Create indices for common queries
CREATE INDEX idx_games_owner ON games(owner_username);
CREATE INDEX idx_games_active ON games(active);
CREATE INDEX idx_games_dates ON games(start_date, end_date);
CREATE INDEX idx_games_created_at ON games(created_at);

-- ============================================================================
-- CREATE BOOKINGS TABLE
-- ============================================================================
CREATE TABLE bookings (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price REAL NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE
);

-- Create indices for common queries
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_game ON bookings(game_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_game_dates ON bookings(game_id, start_date, end_date);

-- ============================================================================
-- CREATE PAYMENTS TABLE
-- ============================================================================
CREATE TABLE payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    amount REAL NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),
    paypal_email VARCHAR(255),
    created_at DATETIME NOT NULL,
    completed_at DATETIME,
    failure_reason TEXT,
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT uc_payments_transaction_id UNIQUE (transaction_id)
);

-- Create indices for common queries
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_booking_status ON payments(booking_id, status);

-- ============================================================================
-- Database is now reset with empty tables
-- ============================================================================
-- Tables created:
-- 1. users - User accounts and authentication
-- 2. games - Games/items for rental
-- 3. bookings - Rental bookings
-- 4. payments - Payment transactions
--
-- All foreign key constraints are in place
-- All indices are created for performance optimization
-- ============================================================================
