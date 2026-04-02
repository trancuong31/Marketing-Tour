-- Migration: Add detailed booking fields
-- Run this SQL against your MariaDB database

ALTER TABLE bookings
  ADD COLUMN departure_date DATE NULL AFTER customer_note,
  ADD COLUMN adult_count INT NOT NULL DEFAULT 1 AFTER departure_date,
  ADD COLUMN child_count INT NOT NULL DEFAULT 0 AFTER adult_count,
  ADD COLUMN infant_count INT NOT NULL DEFAULT 0 AFTER child_count,
  ADD COLUMN total_price DECIMAL(15, 2) NULL AFTER infant_count;
