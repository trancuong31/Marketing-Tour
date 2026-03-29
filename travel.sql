-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               12.3.1-MariaDB - MariaDB Server
-- Server OS:                    Win64
-- HeidiSQL Version:             12.14.0.7165
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for db_marketing_tour
DROP DATABASE IF EXISTS `db_marketing_tour`;
CREATE DATABASE IF NOT EXISTS `db_marketing_tour` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `db_marketing_tour`;

-- Dumping structure for table db_marketing_tour.banners
DROP TABLE IF EXISTS `banners`;
CREATE TABLE IF NOT EXISTS `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT 'Tên banner để admin dễ quản lý',
  `image_url` text NOT NULL COMMENT 'Đường dẫn ảnh sau khi upload',
  `target_link` text DEFAULT NULL COMMENT 'Link đích khi user click vào ảnh (có thể null nếu chỉ hiển thị)',
  `position` varchar(50) NOT NULL COMMENT 'Vị trí: home_main, home_ad_left, home_ad_right...',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Trạng thái: 1 là hiện, 0 là ẩn',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Thời gian tạo',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Thời gian cập nhật gần nhất',
  PRIMARY KEY (`id`),
  KEY `idx_banner_position_active` (`position`,`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.banners: ~0 rows (approximately)
DELETE FROM `banners`;

-- Dumping structure for table db_marketing_tour.bookings
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `tour_id` int(11) NOT NULL,
  `booking_code` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `customer_phone` varchar(15) NOT NULL,
  `number_of_people` int(11) DEFAULT 1,
  `customer_note` text DEFAULT NULL,
  `status` enum('pending','contacted','approved','cancelled') DEFAULT 'pending',
  `admin_note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `tour_id` (`tour_id`),
  KEY `user_id` (`user_id`),
  KEY `customer_phone` (`customer_phone`),
  KEY `customer_email` (`customer_email`),
  KEY `status` (`status`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.bookings: ~1 rows (approximately)
DELETE FROM `bookings`;
INSERT INTO `bookings` (`id`, `user_id`, `tour_id`, `booking_code`, `customer_name`, `customer_email`, `customer_phone`, `number_of_people`, `customer_note`, `status`, `admin_note`, `created_at`, `updated_at`) VALUES
	(4, 7, 10, 'BKMN0DZGB53FE8FC', 'Minh tuyen', 'minhtuyenk201@gmail.com', '0867549067', 1, 'Ngày khởi hành: 2026-03-24 | Người lớn (>10 tuổi): 1 | Trẻ em (2-10 tuổi): 0 | Trẻ nhỏ (<2 tuổi): 0', 'cancelled', NULL, '2026-03-21 13:51:32', '2026-03-21 14:51:36');

-- Dumping structure for table db_marketing_tour.categories
DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `is_international` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.categories: ~2 rows (approximately)
DELETE FROM `categories`;
INSERT INTO `categories` (`id`, `name`, `slug`, `is_international`, `description`) VALUES
	(1, 'Tour Nội Địa', 'tour-noi-dia', 0, 'Khám phá vẻ đẹp hùng vĩ của đất nước Việt Nam từ Bắc chí Nam.'),
	(2, 'Tour Quốc Tế', 'tour-quoc-te', 1, 'Trải nghiệm văn hóa, ẩm thực và cảnh quan kỳ thú tại các quốc gia trên thế giới.');

-- Dumping structure for table db_marketing_tour.guides
DROP TABLE IF EXISTS `guides`;
CREATE TABLE IF NOT EXISTS `guides` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.guides: ~2 rows (approximately)
DELETE FROM `guides`;
INSERT INTO `guides` (`id`, `title`, `slug`, `content`, `is_active`, `updated_at`) VALUES
	(1, 'Hướng dẫn đặt tour trên hệ thống', 'huong-dan-dat-tour', '<h2>Cách&nbsp;đặt&nbsp;tour</h2><p>Bước&nbsp;1:&nbsp;Chọn&nbsp;tour...&nbsp;Bước&nbsp;2:&nbsp;Điền&nbsp;thông&nbsp;tin...&nbsp;Bước&nbsp;3:&nbsp;Chờ&nbsp;admin&nbsp;liên&nbsp;hệ.1</p>', 1, '2026-03-02 06:42:13'),
	(2, 'Chính sách hoàn hủy tour', 'chinh-sach-hoan-huy', '<h2>Chính sách hủy</h2><p>Hủy trước 7 ngày hoàn 100% tiền. Hủy trước 3 ngày hoàn 50% tiền.</p>', 1, '2026-03-02 02:21:47');

-- Dumping structure for table db_marketing_tour.otps
DROP TABLE IF EXISTS `otps`;
CREATE TABLE IF NOT EXISTS `otps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `type` enum('register','reset_password') NOT NULL,
  `attempts` int(11) DEFAULT 0,
  `expired_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_expired_at` (`expired_at`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.otps: ~0 rows (approximately)
DELETE FROM `otps`;

-- Dumping structure for table db_marketing_tour.roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.roles: ~2 rows (approximately)
DELETE FROM `roles`;
INSERT INTO `roles` (`id`, `role_name`) VALUES
	(1, 'ADMIN'),
	(2, 'CUSTOMER');

-- Dumping structure for table db_marketing_tour.tour_images
DROP TABLE IF EXISTS `tour_images`;
CREATE TABLE IF NOT EXISTS `tour_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL,
  `image_url` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `tour_id` (`tour_id`),
  CONSTRAINT `tour_images_ibfk_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.tour_images: ~0 rows (approximately)
DELETE FROM `tour_images`;

-- Dumping structure for table db_marketing_tour.tours
DROP TABLE IF EXISTS `tours`;
CREATE TABLE IF NOT EXISTS `tours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `summary` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `price_adult` decimal(15,2) NOT NULL COMMENT 'Giá người lớn mặc định',
  `sale_price_adult` decimal(15,2) DEFAULT NULL COMMENT 'Giá khuyến mãi người lớn',
  `price_child` decimal(15,2) DEFAULT NULL COMMENT 'Giá trẻ em',
  `sale_price_child` decimal(15,2) DEFAULT NULL COMMENT 'Giá khuyến mãi trẻ em',
  `price_infant` decimal(15,2) DEFAULT NULL COMMENT 'Giá trẻ nhỏ/em bé',
  `sale_price_infant` decimal(15,2) DEFAULT NULL COMMENT 'Giá khuyến mãi trẻ nhỏ',
  `departure_point` varchar(255) DEFAULT NULL,
  `duration_days` int(11) DEFAULT NULL COMMENT 'Số ngày',
  `duration_nights` int(11) DEFAULT NULL COMMENT 'Số đêm',
  `thumbnail_url` text DEFAULT NULL,
  `tour_badge` enum('featured','promotion','none') DEFAULT 'none',
  `status` enum('active','hidden','sold_out') DEFAULT 'active',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `slug` (`slug`) USING BTREE,
  KEY `category_id` (`category_id`,`status`) USING BTREE,
  CONSTRAINT `tours_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.tours: ~11 rows (approximately)
DELETE FROM `tours`;
INSERT INTO `tours` (`id`, `category_id`, `title`, `slug`, `summary`, `content`, `price_adult`, `sale_price_adult`, `price_child`, `sale_price_child`, `price_infant`, `sale_price_infant`, `departure_point`, `duration_days`, `duration_nights`, `thumbnail_url`, `tour_badge`, `status`) VALUES
	(1, 2, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan', 'tour-kham-pha-sapa-chinh-phuc-fansipan', 'Hành trình đến với thị trấn trong sương, khám phá bản Cát Cát và chinh phục nóc nhà Đông Dương.', '<p>Chi tiết hành trình 3 ngày 2 đêm tại Sapa, bao gồm vé cáp treo Fansipan, ở khách sạn 4 sao trung tâm, thưởng thức đặc sản Tây Bắc...</p>', 2890000.00, 2590000.00, 1500000.00, 1300000.00, 500000.00, 500000.00, 'Hà Nội', 3, 2, 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'featured', 'active'),
	(2, 1, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park', 'nghi-duong-phu-quoc-hon-thom', 'Tận hưởng nắng vàng biển xanh tại đảo ngọc Phú Quốc, đi cáp treo vượt biển dài nhất thế giới.', '<p>Tour trọn gói bao gồm vé máy bay khứ hồi, lưu trú tại resort 5 sao có bãi biển riêng, tham quan Grand World và đi cáp treo Hòn Thơm...</p>', 6500000.00, 5900000.00, 4500000.00, 4000000.00, 1500000.00, 1500000.00, 'Hồ Chí Minh', 4, 3, 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'featured', 'active'),
	(3, 1, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', '<p>Trải nghiệm văn hóa và ẩm thực miền Trung. Ngắm đèn lồng tại Hội An về đêm, vui chơi thỏa thích tại Sun World Ba Na Hills...</p>', 4200000.00, NULL, 3000000.00, NULL, 1000000.00, NULL, 'Hà Nội', 4, 3, 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'featured', 'active'),
	(4, 2, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na1', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', '<p>Trải nghiệm văn hóa và ẩm thực miền Trung. Ngắm đèn lồng tại Hội An về đêm, vui chơi thỏa thích tại Sun World Ba Na Hills...</p>', 4200000.00, NULL, 3000000.00, NULL, 1000000.00, NULL, 'Hà Nội', 4, 3, 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'featured', 'active'),
	(5, 1, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na2', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', '<p>Trải nghiệm văn hóa và ẩm thực miền Trung. Ngắm đèn lồng tại Hội An về đêm, vui chơi thỏa thích tại Sun World Ba Na Hills...</p>', 4200000.00, 2590000.00, 3000000.00, 2590000.00, 1000000.00, NULL, 'Hà Nội', 4, 3, 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'featured', 'active'),
	(6, 1, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na3', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', '<p>Trải nghiệm văn hóa và ẩm thực miền Trung. Ngắm đèn lồng tại Hội An về đêm, vui chơi thỏa thích tại Sun World Ba Na Hills...</p>', 4200000.00, NULL, 3000000.00, NULL, 1000000.00, NULL, 'Hà Nội', 4, 3, 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'featured', 'active'),
	(7, 2, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na4', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', '<p>Trải nghiệm văn hóa và ẩm thực miền Trung. Ngắm đèn lồng tại Hội An về đêm, vui chơi thỏa thích tại Sun World Ba Na Hills...</p>', 4200000.00, 2590000.00, 3000000.00, 2590000.00, 1000000.00, NULL, 'Hà Nội', 4, 3, 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'featured', 'active'),
	(8, 2, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan', 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 'Hành trình đến với thị trấn trong sương, khám phá bản Cát Cát và chinh phục nóc nhà Đông Dương.', '<p>Chi tiết hành trình 3 ngày 2 đêm tại Sapa, bao gồm vé cáp treo Fansipan, ở khách sạn 4 sao trung tâm, thưởng thức đặc sản Tây Bắc...</p>', 2890000.00, 2590000.00, 1500000.00, 1300000.00, 500000.00, 500000.00, 'Hà Nội', 3, 2, 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'featured', 'active'),
	(9, 1, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan', 'tour-kham-pha-sapa-chinh-phuc-fansipan2', 'Hành trình đến với thị trấn trong sương, khám phá bản Cát Cát và chinh phục nóc nhà Đông Dương.', '<p>Chi tiết hành trình 3 ngày 2 đêm tại Sapa, bao gồm vé cáp treo Fansipan, ở khách sạn 4 sao trung tâm, thưởng thức đặc sản Tây Bắc...</p>', 2890000.00, 2590000.00, 1500000.00, 1300000.00, 500000.00, 500000.00, 'Hà Nội', 3, 2, 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'featured', 'active'),
	(10, 1, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park', 'nghi-duong-phu-quoc-hon-thom1', 'Tận hưởng nắng vàng biển xanh tại đảo ngọc Phú Quốc, đi cáp treo vượt biển dài nhất thế giới.', '<p>Tour trọn gói bao gồm vé máy bay khứ hồi, lưu trú tại resort 5 sao có bãi biển riêng, tham quan Grand World và đi cáp treo Hòn Thơm...</p>', 6500000.00, 5900000.00, 4500000.00, 4000000.00, 1500000.00, 1500000.00, 'Hồ Chí Minh', 4, 3, 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'featured', 'active'),
	(11, 1, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park', 'nghi-duong-phu-quoc-hon-thom2', 'Tận hưởng nắng vàng biển xanh tại đảo ngọc Phú Quốc, đi cáp treo vượt biển dài nhất thế giới.', '<p>Tour trọn gói bao gồm vé máy bay khứ hồi, lưu trú tại resort 5 sao có bãi biển riêng, tham quan Grand World và đi cáp treo Hòn Thơm...</p>', 6500000.00, 5900000.00, 4500000.00, 4000000.00, 1500000.00, 1500000.00, 'Hồ Chí Minh', 4, 3, 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'featured', 'active');

-- Dumping structure for table db_marketing_tour.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`),
  KEY `role_id` (`role_id`),
  KEY `email_2` (`email`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.users: ~5 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `role_id`, `full_name`, `email`, `password`, `phone_number`, `avatar_url`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
	(1, 1, 'Quản Trị Viên', '1@gmail.com', '$2a$12$9PTNubZ9YiqLA0fE4dKvROIcct3pSzRG0JZx7UVL8y9lhVQBJeDw.', '0901234567', 'https://ui-avatars.com/api/?name=Admin', 1, '2026-03-20 03:23:09', '2026-03-02 02:21:46', '2026-03-20 15:40:45'),
	(2, 2, 'Nguyễn Văn A', 'nguyenvana@gmail.com', '$2y$10$abcdefghijklmnopqrstuv', '0912345678', 'https://ui-avatars.com/api/?name=Nguyễn+A', 1, NULL, '2026-03-02 02:21:46', '2026-03-02 02:21:46'),
	(3, 2, 'Trần Thị B', 'tranthib@gmail.com', '$2y$10$abcdefghijklmnopqrstuv', '0987654321', 'https://ui-avatars.com/api/?name=Trần+B', 1, NULL, '2026-03-02 02:21:46', '2026-03-02 02:21:46'),
	(7, 1, 'minhtuyen', 'minhtuyenk201@gmail.com', '$2a$12$KCyJyx7yI97pcme4AUOWseGpCW6WhyT7OFFCz1ZbnQPJYVlNZdQbC', NULL, NULL, 1, '2026-03-21 14:45:19', '2026-03-11 15:11:21', '2026-03-22 14:11:21'),
	(8, 2, 'Cường Trần', 'tranhungcuong31720@gmail.com', '$2a$12$bSGnDGuQAEH13j0etNNGdubDzqePGknaRuCjktIrTZRYz27KkIree', '0978818244', NULL, 1, NULL, '2026-03-20 02:27:41', '2026-03-20 02:28:16');

-- Dumping structure for table db_marketing_tour.votes
DROP TABLE IF EXISTS `votes`;
CREATE TABLE IF NOT EXISTS `votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `is_approved` tinyint(4) DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tour_id` (`tour_id`),
  CONSTRAINT `votes_ibfk_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.votes: ~0 rows (approximately)
DELETE FROM `votes`;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
