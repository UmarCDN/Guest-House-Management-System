-- =========================================================
-- Serene Haven Luxury Guest House Management Database Schema
-- Compatible with MySQL 8.0+ and MySQL Workbench
-- =========================================================

CREATE DATABASE IF NOT EXISTS `guesthouse_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `guesthouse_db`;

DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `facilities`;
DROP TABLE IF EXISTS `gallery`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `staff`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `rooms`;
DROP TABLE IF EXISTS `room_types`;
DROP TABLE IF EXISTS `users`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff', 'customer') NOT NULL DEFAULT 'customer',
  `phone` VARCHAR(30) DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Room Types Table
CREATE TABLE IF NOT EXISTS `room_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `base_price` DECIMAL(10,2) NOT NULL,
  `max_guests` INT NOT NULL DEFAULT 2,
  `bed_type` VARCHAR(50) NOT NULL,
  `size_sqft` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Rooms Table
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `room_number` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `room_type_id` INT DEFAULT NULL,
  `price_per_night` DECIMAL(10,2) NOT NULL,
  `capacity` INT NOT NULL DEFAULT 2,
  `size_sqm` INT NOT NULL DEFAULT 35,
  `status` ENUM('available', 'occupied', 'maintenance') NOT NULL DEFAULT 'available',
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  `reviews_count` INT NOT NULL DEFAULT 0,
  `primary_image` TEXT NOT NULL,
  `images` JSON DEFAULT NULL,
  `amenities` JSON DEFAULT NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_rooms_room_type` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_reference` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `room_id` INT NOT NULL,
  `guest_name` VARCHAR(100) NOT NULL,
  `guest_email` VARCHAR(191) NOT NULL,
  `guest_phone` VARCHAR(30) NOT NULL,
  `check_in_date` DATE NOT NULL,
  `check_out_date` DATE NOT NULL,
  `guests_count` INT NOT NULL DEFAULT 1,
  `total_price` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') NOT NULL DEFAULT 'confirmed',
  `payment_status` ENUM('pending', 'paid', 'refunded') NOT NULL DEFAULT 'paid',
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'credit_card',
  `special_requests` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Facilities Table
CREATE TABLE IF NOT EXISTS `facilities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('Enabled', 'Disabled') NOT NULL DEFAULT 'Enabled'
) ENGINE=InnoDB;

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `room_id` INT NOT NULL,
  `user_id` INT DEFAULT NULL,
  `guest_name` VARCHAR(100) NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` TEXT NOT NULL,
  `status` ENUM('Approved', 'Pending', 'Rejected') NOT NULL DEFAULT 'Approved',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reviews_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Staff Table
CREATE TABLE IF NOT EXISTS `staff` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `department` VARCHAR(50) NOT NULL,
  `shift` ENUM('Morning', 'Evening', 'Night') NOT NULL DEFAULT 'Morning',
  `salary` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  `joined_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. Gallery Table
CREATE TABLE IF NOT EXISTS `gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'Rooms',
  `image_url` TEXT NOT NULL,
  `is_featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 9. Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` VARCHAR(50) NOT NULL,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 10. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payment_reference` VARCHAR(50) NOT NULL UNIQUE,
  `booking_id` INT DEFAULT NULL,
  `guest_name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `status` ENUM('Paid', 'Pending', 'Failed', 'Refunded') NOT NULL DEFAULT 'Paid',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================================================
-- SEED DATA
-- =========================================================

-- Seed Users
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`) 
VALUES 
(1, 'Administrator', 'admin@example.com', '$2b$10$fV3z39Zz5y/2hG1E9q2Wle2M7R34O3nBqUOz54Vv7o6CqF0fKj.K6', 'admin', '+1 555-0100'),
(2, 'Sarah Jenkins', 'customer@example.com', '$2b$10$gP7y19Kz5y/3hG2E9q3Wme3M8R45O4nBqVPz65Ww8o7DqG1gLk.L7', 'customer', '+1 555-0199')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Room Types
INSERT INTO `room_types` (`id`, `name`, `slug`, `description`, `base_price`, `max_guests`, `bed_type`, `size_sqft`) 
VALUES
(1, 'Ocean View Suite', 'ocean-view-suite', 'Breathtaking panoramic ocean view with private balcony and designer bathroom.', 180.00, 2, 'King Bed', 420),
(2, 'Mountain View Haven', 'mountain-view-haven', 'Serene views of pine-crested peaks with cozy stone fireplace and heated floors.', 250.00, 3, 'King Bed + Sofa Bed', 520),
(3, 'Presidential Suite', 'presidential-suite', 'The pinnacle of luxury with private terrace, personal jacuzzi, and dining salon.', 500.00, 4, '2 King Beds', 950),
(4, 'Garden Deluxe Studio', 'garden-deluxe-studio', 'Peaceful ground-floor retreat nestled inside private tropical flora.', 120.00, 2, 'Queen Bed', 350),
(5, 'Family Loft', 'family-loft', 'Multi-level suite with dedicated living room and kid-friendly bunk quarters.', 300.00, 5, 'King Bed + 2 Single Beds', 680),
(6, 'Sunset Penthouse', 'sunset-penthouse', 'High-altitude panoramic penthouse featuring 360-degree views and wine bar.', 650.00, 4, '2 King Beds', 1100)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Rooms
INSERT INTO `rooms` (`id`, `room_number`, `name`, `room_type_id`, `price_per_night`, `capacity`, `size_sqm`, `status`, `rating`, `reviews_count`, `primary_image`, `images`, `amenities`, `description`)
VALUES
(1, '101', 'Deluxe Ocean View Suite', 1, 180.00, 2, 45, 'available', 4.90, 48, 
 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000',
 '["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000", "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800"]',
 '["Ocean View", "King Bed", "High-speed Wi-Fi", "Espresso Machine", "Marble Bath", "Smart TV", "Mini Bar", "Air Conditioning"]',
 'Experience elevated coastal luxury with unhindered views of the sparkling shoreline, plush linens, and artisanal finishes throughout.'),

(2, '202', 'Executive Mountain Haven', 2, 250.00, 3, 55, 'available', 4.95, 34, 
 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000',
 '["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000", "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800"]',
 '["Mountain View", "Fireplace", "Heated Floors", "Balcony", "Free Wi-Fi", "Rain Shower", "Room Service", "Coffee Maker"]',
 'Immerse yourself in mountain tranquility with custom timber beams, an authentic crackling stone fireplace, and premium bath amenities.'),

(3, '301', 'Royal Presidential Suite', 3, 500.00, 4, 110, 'available', 5.00, 62, 
 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1000',
 '["https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1000", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800"]',
 '["Private Jacuzzi", "Butler Service", "Terrace", "Ocean & Mountain View", "Full Bar", "Chef Kitchen", "King Beds", "Luxury Linens"]',
 'Our premier residential accommodation offering unmatched seclusion, private outdoor hot tub, master salon, and dedicated 24/7 butler assistance.'),

(4, '104', 'Cozy Garden Studio', 4, 120.00, 2, 35, 'available', 4.80, 29, 
 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1000',
 '["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1000"]',
 '["Garden Access", "Queen Bed", "Free Wi-Fi", "Walk-in Shower", "Work Desk", "Complimentary Tea & Coffee"]',
 'Tucked away amid our landscaped botanical pathways, this sunlit studio provides an intimate sanctuary for solo travelers and couples alike.'),

(5, '205', 'Serene Family Loft', 5, 300.00, 5, 75, 'available', 4.88, 41, 
 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=1000',
 '["https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=1000"]',
 '["2 Bedrooms", "Kitchenette", "Balcony", "Smart TVs", "High-speed Wi-Fi", "Board Games", "Family Dining Area"]',
 'Thoughtfully designed for families and groups, complete with dual bathrooms, full entertaining lounge, and private balcony seating.'),

(6, '401', 'Sunset Penthouse', 6, 650.00, 4, 130, 'available', 4.98, 19, 
 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1000',
 '["https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1000"]',
 '["360 Views", "Private Elevator", "Jacuzzi", "Wine Cellar", "Wrap-around Deck", "Sonos Sound", "Designer Furniture"]',
 'Exclusive top-floor domain boasting floor-to-ceiling glass, private express lift access, and sweeping twilight views across the bay.')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Bookings with dates for availability testing
INSERT INTO `bookings` (`id`, `booking_reference`, `user_id`, `room_id`, `guest_name`, `guest_email`, `guest_phone`, `check_in_date`, `check_out_date`, `guests_count`, `total_price`, `status`, `payment_status`, `payment_method`, `special_requests`)
VALUES
(1, 'BK-789012', 2, 1, 'Sarah Jenkins', 'customer@example.com', '+1 555-0199', '2026-09-15', '2026-09-18', 2, 540.00, 'confirmed', 'paid', 'credit_card', 'High floor requested, late arrival after 7 PM.'),
(2, 'BK-456789', 2, 2, 'David Miller', 'david.m@example.com', '+1 555-0143', '2026-09-20', '2026-09-23', 2, 750.00, 'confirmed', 'paid', 'credit_card', 'Honeymoon arrangement, flowers and champagne.'),
(3, 'BK-123456', 2, 3, 'Elena Rostova', 'elena.r@example.com', '+1 555-0182', '2026-09-10', '2026-09-13', 3, 1000.00, 'checked_in', 'paid', 'credit_card', 'Airport transfer requested.')
ON DUPLICATE KEY UPDATE `booking_reference` = VALUES(`booking_reference`);

-- Seed Facilities
INSERT INTO `facilities` (`id`, `name`, `icon`, `description`, `status`)
VALUES
(1, 'Infinity Swimming Pool', 'bi-water', 'Temperature-controlled rooftop pool with horizon view', 'Enabled'),
(2, 'Holistic Spa & Wellness', 'bi-flower1', 'Full body therapy, sauna, and aromatherapy steam rooms', 'Enabled'),
(3, 'Gourmet Bistro & Lounge', 'bi-cup-hot', 'Locally sourced farm-to-table culinary dining', 'Enabled'),
(4, 'Fitness Center', 'bi-activity', 'State-of-the-art cardio and weight training equipment', 'Enabled'),
(5, 'Free Valet Parking', 'bi-car-front', 'Complimentary 24/7 secured valet parking service', 'Enabled'),
(6, 'High-Speed Fiber Wi-Fi', 'bi-wifi', 'Gigabit wireless coverage throughout all rooms and suites', 'Enabled')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Reviews
INSERT INTO `reviews` (`id`, `room_id`, `user_id`, `guest_name`, `rating`, `comment`, `status`)
VALUES
(1, 1, 2, 'Sarah Jenkins', 5, 'An unforgettable coastal getaway. The view from the balcony was surreal and the staff was extremely courteous.', 'Approved'),
(2, 2, NULL, 'Michael Chang', 5, 'The fireplace in the Mountain Haven made our evenings so relaxing. Perfect heating and spotless clean.', 'Approved'),
(3, 3, NULL, 'Alina Vane', 5, 'True royal luxury. The private jacuzzi and 24/7 butler service were world-class.', 'Approved'),
(4, 4, NULL, 'Omar Farooq', 4, 'Very peaceful garden environment. Ideal for remote working or quiet reading.', 'Approved')
ON DUPLICATE KEY UPDATE `guest_name` = VALUES(`guest_name`);

-- Seed Staff
INSERT INTO `staff` (`id`, `name`, `email`, `phone`, `role`, `department`, `shift`, `salary`, `status`, `joined_date`)
VALUES
(1, 'Ahmed Khan', 'ahmed.k@serenehaven.com', '+92 301 5551101', 'General Manager', 'Management', 'Morning', 180000.00, 'Active', '2023-01-10'),
(2, 'Farhan Tariq', 'farhan.t@serenehaven.com', '+92 302 5551102', 'Head Concierge', 'Front Desk', 'Morning', 85000.00, 'Active', '2023-05-15'),
(3, 'Ayesha Malik', 'ayesha.m@serenehaven.com', '+92 303 5551103', 'Guest Relations Manager', 'Front Desk', 'Evening', 95000.00, 'Active', '2023-08-01'),
(4, 'Bilal Qureshi', 'bilal.q@serenehaven.com', '+92 304 5551104', 'Executive Chef', 'Food & Beverage', 'Morning', 150000.00, 'Active', '2022-11-20'),
(5, 'Sana Javed', 'sana.j@serenehaven.com', '+92 305 5551105', 'Housekeeping Supervisor', 'Housekeeping', 'Morning', 65000.00, 'Active', '2024-02-01')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Gallery
INSERT INTO `gallery` (`id`, `title`, `category`, `image_url`, `is_featured`)
VALUES
(1, 'Rooftop Infinity Pool at Sunset', 'Exterior', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200', TRUE),
(2, 'Grand Presidential Suite Living Area', 'Rooms', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200', TRUE),
(3, 'Artisanal Gourmet Bistro', 'Dining', 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=1200', TRUE),
(4, 'Tranquil Spa & Hydrotherapy', 'Wellness', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200', FALSE),
(5, 'Sunlit Reception & Lobby Lounge', 'Interior', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1200', FALSE)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Seed Settings
INSERT INTO `settings` (`category`, `setting_key`, `setting_value`)
VALUES
('general', 'guest_house_name', 'Serene Haven Luxury Guest House'),
('general', 'contact_email', 'concierge@serenehavenguesthouse.com'),
('general', 'contact_phone', '+92 51 2223344'),
('general', 'address', 'Sector F-7/1, Margalla Foothills, Islamabad, Pakistan'),
('booking', 'check_in_time', '14:00'),
('booking', 'check_out_time', '11:00'),
('booking', 'tax_rate_percentage', '16'),
('booking', 'cancellation_deadline_hours', '48'),
('payment', 'currency', 'PKR'),
('payment', 'stripe_enabled', 'true'),
('payment', 'bank_transfer_enabled', 'true'),
('payment', 'cash_on_arrival_enabled', 'true')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- Seed Payments
INSERT INTO `payments` (`id`, `payment_reference`, `booking_id`, `guest_name`, `amount`, `payment_method`, `status`)
VALUES
(1, 'PAY-8921', 1, 'Sarah Jenkins', 540.00, 'Credit/Debit Card', 'Paid'),
(2, 'PAY-4412', 2, 'David Miller', 750.00, 'Credit/Debit Card', 'Paid'),
(3, 'PAY-9018', 3, 'Elena Rostova', 1000.00, 'Credit/Debit Card', 'Paid')
ON DUPLICATE KEY UPDATE `payment_reference` = VALUES(`payment_reference`);

-- 11. Contact Messages Table
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('Unread', 'Read', 'Replied') NOT NULL DEFAULT 'Unread',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
