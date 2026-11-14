-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               12.0.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.10.0.7000
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
CREATE DATABASE IF NOT EXISTS `db_marketing_tour` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `db_marketing_tour`;

-- Dumping structure for table db_marketing_tour.banners
DROP TABLE IF EXISTS `banners`;
CREATE TABLE IF NOT EXISTS `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL DEFAULT 0,
  `title` varchar(255) NOT NULL COMMENT 'Tên banner để admin dễ quản lý',
  `image_url` text NOT NULL COMMENT 'Đường dẫn ảnh sau khi upload',
  `target_link` text DEFAULT NULL COMMENT 'Link đích khi user click vào ảnh (có thể null nếu chỉ hiển thị)',
  `position` varchar(50) NOT NULL COMMENT 'Vị trí: home_main, home_ad_left, home_ad_right...',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Trạng thái: 1 là hiện, 0 là ẩn',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Thời gian tạo',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Thời gian cập nhật gần nhất',
  PRIMARY KEY (`id`),
  KEY `idx_banner_position_active` (`position`,`is_active`),
  KEY `FK_banners_tours` (`tour_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.banners: ~6 rows (approximately)
DELETE FROM `banners`;
INSERT INTO `banners` (`id`, `tour_id`, `title`, `image_url`, `target_link`, `position`, `is_active`, `created_at`, `updated_at`) VALUES
	(7, 2, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park', '/uploads/banners/banner-1774264639505-576996427.webp', '/tours/nghi-duong-phu-quoc-hon-thom', 'hero', 1, '2026-04-01 11:54:59', '2026-08-03 02:43:31'),
	(9, 11, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park', '/uploads/banners/banner-1774264639505-576996427.webp', '/tours/nghi-duong-phu-quoc-hon-thom2', 'hero', 1, '2026-04-29 15:28:12', '2026-08-03 02:43:32'),
	(12, 10, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park', '/uploads/banners/banner-1774264639505-576996427.webp', '/tours/nghi-duong-phu-quoc-hon-thom1', 'hero', 1, '2026-04-29 15:29:09', '2026-08-03 02:43:31'),
	(13, 9, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan', '/uploads/banners/banner-1774264639505-576996427.webp', '/tours/tour-kham-pha-sapa-chinh-phuc-fansipan2', 'hero', 1, '2026-04-29 15:29:10', '2026-08-03 02:43:30'),
	(14, 8, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan', '/uploads/banners/banner-1774264639505-576996427.webp', '/tours/tour-kham-pha-sapa-chinh-phuc-fansipan1', 'hero', 1, '2026-04-29 15:29:10', '2026-08-03 02:43:33'),
	(18, 15, 'Tour Đài Loan 5N4Đ: HCM - Cao Hùng - Đài Trung - Đài Bắc - Thủy Cung X-park', '/uploads/banners/banner-1774264639505-576996427.webp', '/tours/tour-dai-loan-5n4d-hcm-cao-hung-dai-trung-dai-bac-thuy-cung-x-park', 'hero', 1, '2026-05-09 11:28:22', '2026-08-03 02:43:30');

-- Dumping structure for table db_marketing_tour.bookings
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `tour_id` int(11) NOT NULL,
  `departure_id` int(11) NOT NULL COMMENT 'ID của ngày khởi hành khách chọn',
  `pickup_location_id` int(11) DEFAULT NULL COMMENT 'ID điểm đón khách chọn',
  `booking_code` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `customer_phone` varchar(15) NOT NULL,
  `adult_qty` int(11) NOT NULL DEFAULT 1 COMMENT 'Số người lớn',
  `child_qty` int(11) DEFAULT 0 COMMENT 'Số trẻ em',
  `infant_qty` int(11) DEFAULT 0 COMMENT 'Số em bé',
  `customer_note` text DEFAULT NULL,
  `language` varchar(5) NOT NULL DEFAULT 'vi',
  `review_email_sent_at` datetime DEFAULT NULL,
  `departure_date` date DEFAULT NULL,
  `adult_count` int(11) NOT NULL DEFAULT 1,
  `child_count` int(11) NOT NULL DEFAULT 0,
  `infant_count` int(11) NOT NULL DEFAULT 0,
  `status` enum('pending','contacted','approved','cancelled') DEFAULT 'pending',
  `tour_title_snapshot` varchar(500) DEFAULT NULL,
  `departure_date_snapshot` date DEFAULT NULL,
  `adult_price_snapshot` decimal(12,2) DEFAULT NULL,
  `original_adult_price_snapshot` decimal(15,2) DEFAULT NULL COMMENT 'Snapshot giá gốc người lớn tại thời điểm đặt',
  `child_price_snapshot` decimal(12,2) DEFAULT NULL,
  `infant_price_snapshot` decimal(12,2) DEFAULT NULL,
  `pickup_location_snapshot` varchar(500) DEFAULT NULL,
  `pickup_price_snapshot` decimal(12,2) DEFAULT NULL,
  `total_price` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng tiền thanh toán (Snapshot)',
  `admin_note` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  UNIQUE KEY `booking_code_2` (`booking_code`),
  KEY `tour_id` (`tour_id`),
  KEY `user_id` (`user_id`),
  KEY `customer_phone` (`customer_phone`),
  KEY `customer_email` (`customer_email`),
  KEY `status` (`status`),
  KEY `fk_bookings_departure` (`departure_id`),
  KEY `fk_bookings_pickup` (`pickup_location_id`),
  KEY `booking_language` (`language`),
  KEY `booking_review_email_sent_at` (`review_email_sent_at`),
  CONSTRAINT `bk_depa` FOREIGN KEY (`departure_id`) REFERENCES `tour_departures` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `bk_pick` FOREIGN KEY (`pickup_location_id`) REFERENCES `tour_pickup_locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bk_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.bookings: ~21 rows (approximately)
DELETE FROM `bookings`;
INSERT INTO `bookings` (`id`, `user_id`, `tour_id`, `departure_id`, `pickup_location_id`, `booking_code`, `customer_name`, `customer_email`, `customer_phone`, `adult_qty`, `child_qty`, `infant_qty`, `customer_note`, `language`, `review_email_sent_at`, `departure_date`, `adult_count`, `child_count`, `infant_count`, `status`, `tour_title_snapshot`, `departure_date_snapshot`, `adult_price_snapshot`, `original_adult_price_snapshot`, `child_price_snapshot`, `infant_price_snapshot`, `pickup_location_snapshot`, `pickup_price_snapshot`, `total_price`, `admin_note`, `created_at`, `updated_at`) VALUES
	(1, 2, 1, 1, 1, 'BK001', 'Nguyễn Văn A', 'a@gmail.com', '0911111111', 2, 1, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 3', '2026-05-01', 3500000.00, NULL, 2500000.00, 500000.00, NULL, NULL, 9500000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(2, 3, 2, 3, 3, 'BK002', 'Trần Thị B', 'b@gmail.com', '0922222222', 1, 0, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'cancelled', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 1', '2026-05-03', 5500000.00, NULL, 4000000.00, 800000.00, NULL, NULL, 5500000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(3, 2, 3, 5, 5, 'BK003', 'Lê Văn C', 'c@gmail.com', '0933333333', 2, 0, 1, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 1', '2026-05-05', 4500000.00, NULL, 3200000.00, 600000.00, NULL, NULL, 9600000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(6, 3, 6, 11, 9, 'BK006', 'Đỗ Văn F', 'f@gmail.com', '0966666666', 2, 1, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 4', '2026-06-01', 4500000.00, NULL, 3200000.00, 600000.00, NULL, NULL, 9800000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(8, 3, 8, 15, 11, 'BK008', 'Trần H', 'h@gmail.com', '0988888888', 2, 0, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1', '2026-06-05', 3500000.00, NULL, 2500000.00, 500000.00, NULL, NULL, 7000000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(9, 2, 9, 17, 12, 'BK009', 'Lê I', 'i@gmail.com', '0999999999', 1, 1, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 2', '2026-06-07', 3700000.00, NULL, 2700000.00, 500000.00, NULL, NULL, 6400000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(10, 3, 10, 18, 13, 'BK010', 'Phạm K', 'k@gmail.com', '0900000000', 2, 0, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 2', '2026-06-09', 5800000.00, NULL, 4200000.00, 800000.00, NULL, NULL, 11600000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(11, 2, 11, 19, 14, 'BK011', 'Hoàng L', 'l@gmail.com', '0910000000', 2, 1, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 3', '2026-06-12', 6000000.00, NULL, 4500000.00, 900000.00, NULL, NULL, 13500000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(12, 3, 1, 2, 2, 'BK012', 'User12', 'u12@gmail.com', '0911111122', 1, 0, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 3', '2026-05-10', 3600000.00, NULL, 2600000.00, 500000.00, NULL, NULL, 3600000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(13, 2, 2, 4, 4, 'BK013', 'User13', 'u13@gmail.com', '0911111133', 2, 0, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 1', '2026-05-15', 5700000.00, NULL, 4200000.00, 800000.00, NULL, NULL, 11400000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(14, 3, 3, 6, 6, 'BK014', 'User14', 'u14@gmail.com', '0911111144', 1, 1, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 1', '2026-05-20', 4600000.00, NULL, 3300000.00, 600000.00, NULL, NULL, 7900000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(16, 3, 5, 10, 8, 'BK016', 'User16', 'u16@gmail.com', '0911111166', 2, 1, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 3', '2026-05-28', 4900000.00, NULL, 3600000.00, 700000.00, NULL, NULL, 12000000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(17, 2, 6, 12, 9, 'BK017', 'User17', 'u17@gmail.com', '0911111177', 2, 0, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 4', '2026-06-10', 4600000.00, NULL, 3300000.00, 600000.00, NULL, NULL, 9000000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(18, 3, 7, 14, 10, 'BK018', 'User18', 'u18@gmail.com', '0911111188', 1, 0, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 5', '2026-06-18', 8200000.00, NULL, 6200000.00, 1200000.00, NULL, NULL, 8200000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(19, 2, 8, 16, 11, 'BK019', 'User19', 'u19@gmail.com', '0911111199', 3, 0, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1', '2026-06-20', 3600000.00, NULL, 2600000.00, 500000.00, NULL, NULL, 10800000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(20, 3, 9, 17, 12, 'BK020', 'User20', 'u20@gmail.com', '0911111200', 2, 1, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 2', '2026-06-07', 3700000.00, NULL, 2700000.00, 500000.00, NULL, NULL, 9100000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(23, 7, 10, 18, 13, 'BKMOH0MID52C0FB6', 'minhtuyen', 'minhtuyenk201@gmail.com', '0000000000', 1, 0, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 2', '2026-06-09', 5800000.00, NULL, 4200000.00, 800000.00, NULL, NULL, 6800000.00, NULL, '2026-04-27 16:49:21', '2026-04-27 16:49:21'),
	(24, 7, 7, 13, NULL, 'BKMOH101AS1BB547', 'minhtuyen', 'minhtuyenk201@gmail.com', '0000000000', 1, 0, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 5', '2026-06-03', 8000000.00, NULL, 6000000.00, 1200000.00, NULL, NULL, 8000000.00, NULL, '2026-04-27 16:59:52', '2026-04-27 16:59:52'),
	(27, 7, 8, 15, 11, 'BKMOH6DVII2D0BAD', 'minhtuyen', 'minhtuyenk201@gmail.com', '0000000000', 1, 0, 0, 'aaaaaaaaa', 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1', '2026-06-05', 3500000.00, NULL, 2500000.00, 500000.00, NULL, NULL, 3500000.00, NULL, '2026-04-27 19:30:36', '2026-04-27 19:30:36'),
	(32, NULL, 11, 20, 14, 'BKMONM62QE867C0E', 'Cường Trần', 'tranhungcuong31720@gmail.com', '0978818244', 15, 0, 0, NULL, 'vi', NULL, NULL, 1, 0, 0, 'approved', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 3', '2026-06-25', 6200000.00, NULL, 4700000.00, 900000.00, NULL, NULL, 132000000.00, NULL, '2026-05-02 07:39:03', '2026-05-02 07:39:03'),
	(44, NULL, 8, 16, 11, 'BKMQBSZDV7591722', 'Cường Trần', 'tranhungcuong31720@gmail.com', '0978818244', 2, 3, 3, NULL, 'vi', NULL, NULL, 1, 0, 0, 'cancelled', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1', '2026-06-20', 3600000.00, NULL, 2600000.00, 500000.00, NULL, NULL, 16500000.00, NULL, '2026-06-13 10:35:58', '2026-06-13 10:35:58');

-- Dumping structure for table db_marketing_tour.booking_options
DROP TABLE IF EXISTS `booking_options`;
CREATE TABLE IF NOT EXISTS `booking_options` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `option_name` varchar(255) NOT NULL COMMENT 'Lưu cứng text tên option để tránh mất data khi admin xóa',
  `price` decimal(15,2) NOT NULL COMMENT 'Giá option tại thời điểm khách đặt',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT 'Số lượng khách chọn',
  `total` decimal(15,2) NOT NULL COMMENT 'Thành tiền của option này (price * quantity)',
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `fk_booking_tour` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.booking_options: ~3 rows (approximately)
DELETE FROM `booking_options`;
INSERT INTO `booking_options` (`id`, `booking_id`, `option_name`, `price`, `quantity`, `total`) VALUES
	(3, 23, 'Lặn biển', 1000000.00, 1, 1000000.00),
	(4, 32, 'Golf', 2000000.00, 15, 30000000.00),
	(5, 32, 'Ăn tối BBQ', 600000.00, 15, 9000000.00);

-- Dumping structure for table db_marketing_tour.categories
DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `is_international` tinyint(4) DEFAULT 0,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `slug_2` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.categories: ~2 rows (approximately)
DELETE FROM `categories`;
INSERT INTO `categories` (`id`, `name`, `slug`, `is_international`, `description`) VALUES
	(1, 'Tour Nội Địa', 'tour-noi-dia', 0, 'Khám phá vẻ đẹp hùng vĩ của đất nước Việt Nam từ Bắc chí Nam.'),
	(2, 'Tour Quốc Tế', 'tour-quoc-te', 1, 'Trải nghiệm văn hóa, ẩm thực và cảnh quan kỳ thú tại các quốc gia trên thế giới.');

-- Dumping structure for table db_marketing_tour.category_translations
DROP TABLE IF EXISTS `category_translations`;
CREATE TABLE IF NOT EXISTS `category_translations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `language` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_translations_category_id_language` (`category_id`,`language`),
  CONSTRAINT `fk_category_translations_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.category_translations: ~2 rows (approximately)
DELETE FROM `category_translations`;
INSERT INTO `category_translations` (`id`, `category_id`, `language`, `name`, `slug`, `description`) VALUES
	(1, 1, 'vi', 'Tour Nội Địa', 'tour-noi-dia', 'Khám phá vẻ đẹp hùng vĩ của đất nước Việt Nam từ Bắc chí Nam.'),
	(2, 2, 'vi', 'Tour Quốc Tế', 'tour-quoc-te', 'Trải nghiệm văn hóa, ẩm thực và cảnh quan kỳ thú tại các quốc gia trên thế giới.');

-- Dumping structure for table db_marketing_tour.contact_settings
DROP TABLE IF EXISTS `contact_settings`;
CREATE TABLE IF NOT EXISTS `contact_settings` (
  `id` int(11) NOT NULL,
  `configuration` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`configuration`)),
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.contact_settings: ~1 rows (approximately)
DELETE FROM `contact_settings`;
INSERT INTO `contact_settings` (`id`, `configuration`, `updated_by`, `created_at`, `updated_at`) VALUES
	(1, '{"general":{"heading":{"vi":"BẠN CẦN TRỢ GIÚP?","en":"NEED HELP?","zh":"需要帮助？"},"workingHours":{"vi":"7h30 → 21h hằng ngày","en":"Daily, 7:30 AM → 9:00 PM","zh":"每日 7:30 → 21:00"},"description":{"vi":"","en":"","zh":""}},"contacts":[{"id":"hotline","type":"phone","labels":{"vi":"Hotline","en":"Hotline","zh":"服务热线"},"displayValue":"1900 0000","destination":"19002045","phoneNumber":"","accountIdentifier":"","icon":"phone","enabled":true,"footerVisible":true,"floatingVisible":false,"footerOrder":1,"floatingOrder":4,"wechatAction":"none"},{"id":"email","type":"email","labels":{"vi":"Email","en":"Email","zh":"电子邮件"},"displayValue":"info@kynghituyetvoi.vn","destination":"","phoneNumber":"","accountIdentifier":"","icon":"mail","enabled":true,"footerVisible":true,"floatingVisible":false,"footerOrder":2,"floatingOrder":5,"wechatAction":"none"},{"id":"facebook","type":"facebook","labels":{"vi":"Facebook","en":"Facebook","zh":"Facebook"},"displayValue":"Facebook","destination":"","phoneNumber":"","accountIdentifier":"","icon":"facebook","enabled":true,"footerVisible":true,"floatingVisible":false,"footerOrder":3,"floatingOrder":6,"wechatAction":"none"},{"id":"zalo","type":"zalo","labels":{"vi":"Zalo","en":"Zalo","zh":"Zalo"},"displayValue":"Zalo","destination":"https://zalo.me/0987654321","phoneNumber":"0987654321","accountIdentifier":"","icon":"zalo","enabled":true,"footerVisible":true,"floatingVisible":true,"footerOrder":4,"floatingOrder":2,"wechatAction":"none"},{"id":"wechat","type":"wechat","labels":{"vi":"Chat WeChat","en":"Chat WeChat","zh":"微信联系"},"displayValue":"WeChat","destination":"","phoneNumber":"","accountIdentifier":"","icon":"wechat","enabled":true,"footerVisible":true,"floatingVisible":true,"footerOrder":5,"floatingOrder":1,"wechatAction":"none"},{"id":"quick_call","type":"phone","labels":{"vi":"Gọi ngay","en":"Call now","zh":"立即致电"},"displayValue":"0987654321","destination":"0987654321","phoneNumber":"0987654321","accountIdentifier":"","icon":"phone","enabled":true,"footerVisible":false,"floatingVisible":true,"footerOrder":6,"floatingOrder":3,"wechatAction":"none"}]}', NULL, '2026-11-08 13:34:58', '2026-11-08 13:34:58');

-- Dumping structure for table db_marketing_tour.footer_links
DROP TABLE IF EXISTS `footer_links`;
CREATE TABLE IF NOT EXISTS `footer_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `url` varchar(500) NOT NULL,
  `link_type` enum('internal','external') NOT NULL DEFAULT 'internal',
  `column_position` tinyint(4) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.footer_links: ~6 rows (approximately)
DELETE FROM `footer_links`;
INSERT INTO `footer_links` (`id`, `title`, `url`, `link_type`, `column_position`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'Về Chúng Tôi', '/guides/ve-chung-toi', 'internal', 1, 1, 0, '2026-11-14 00:40:43', '2026-11-14 08:02:08'),
	(2, 'Blog Du Lịch', '/guides/blog-du-lich', 'internal', 1, 2, 0, '2026-11-14 00:40:43', '2026-11-14 08:02:08'),
	(3, 'Câu Hỏi Thường Gặp', '/guides/cau-hoi-thuong-gap', 'internal', 2, 1, 1, '2026-11-14 00:40:43', '2026-11-14 07:42:42'),
	(4, 'Hướng Dẫn Thanh Toán', '/guides/huong-dan-thanh-toan', 'internal', 2, 2, 1, '2026-11-14 00:40:43', '2026-11-14 07:42:42'),
	(5, 'Điều Khoản Sử Dụng', '/guides/dieu-khoan-su-dung', 'internal', 3, 1, 1, '2026-11-14 00:40:43', '2026-11-14 07:42:43'),
	(6, 'Chính Sách Bảo Mật', '/guides/chinh-sach-bao-mat', 'internal', 3, 2, 1, '2026-11-14 00:40:43', '2026-11-14 07:42:44');

-- Dumping structure for table db_marketing_tour.guides
DROP TABLE IF EXISTS `guides`;
CREATE TABLE IF NOT EXISTS `guides` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `is_active` tinyint(4) DEFAULT 1,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `slug_2` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.guides: ~8 rows (approximately)
DELETE FROM `guides`;
INSERT INTO `guides` (`id`, `title`, `slug`, `content`, `is_active`, `updated_at`) VALUES
	(1, 'Hướng dẫn đặt tour trên hệ thống', 'huong-dan-dat-tour', '<h2>Cách&nbsp;đặt&nbsp;tour</h2><p>Bước&nbsp;1:&nbsp;Chọn&nbsp;tour...&nbsp;Bước&nbsp;2:&nbsp;Điền&nbsp;thông&nbsp;tin...&nbsp;Bước&nbsp;3:&nbsp;Chờ&nbsp;admin&nbsp;liên&nbsp;hệ.1</p>', 1, '2026-03-02 13:42:13'),
	(2, 'Chính sách hoàn hủy tour', 'chinh-sach-hoan-huy', '<h2>Chính sách hủy</h2><p>Hủy trước 7 ngày hoàn 100% tiền. Hủy trước 3 ngày hoàn 50% tiền.</p>', 1, '2026-03-02 09:21:47'),
	(3, 'Về Chúng Tôi', 've-chung-toi', '<h1>About&nbsp;Us&nbsp;1</h1><p>Ky&nbsp;Nghi&nbsp;Tuyet&nbsp;Voi&nbsp;helps&nbsp;travelers&nbsp;choose&nbsp;tours,&nbsp;departure&nbsp;dates,&nbsp;and&nbsp;services&nbsp;suited&nbsp;to&nbsp;every&nbsp;journey.</p><p>Explore&nbsp;our&nbsp;<a href="/guides/blog-du-lich" rel="noopener noreferrer" target="_blank">Travel&nbsp;Blog</a>,&nbsp;<a href="/guides/cau-hoi-thuong-gap" rel="noopener noreferrer" target="_blank">Frequently&nbsp;Asked&nbsp;Questions</a>,&nbsp;and&nbsp;<a href="/guides/huong-dan-thanh-toan" rel="noopener noreferrer" target="_blank">Payment&nbsp;Guide</a>.</p>', 1, '2026-11-14 08:03:31'),
	(4, 'Blog Du Lịch', 'blog-du-lich', '<h1>Blog Du Lịch</h1>\n            <p>Nơi tổng hợp kinh nghiệm du lịch, gợi ý điểm đến, lưu ý trước chuyến đi và các thông tin hữu ích cho khách hàng.</p>\n            <p>Tham khảo thêm <a href="/guides/ve-chung-toi">Về Chúng Tôi</a> và <a href="/guides/cau-hoi-thuong-gap">Câu Hỏi Thường Gặp</a>.</p>', 1, '2026-11-08 14:29:47'),
	(5, 'Điều Khoản Sử Dụng', 'dieu-khoan-su-dung', '<h1>Điều Khoản Sử Dụng</h1>\n            <p>Khi sử dụng website và dịch vụ của Kỳ Nghỉ Tuyệt Vời, khách hàng đồng ý tuân thủ các điều khoản đặt tour, thanh toán và sử dụng thông tin được công bố.</p>\n            <p>Vui lòng đọc thêm <a href="/guides/chinh-sach-bao-mat">Chính Sách Bảo Mật</a> và <a href="/guides/huong-dan-thanh-toan">Hướng Dẫn Thanh Toán</a>.</p>', 1, '2026-11-08 14:29:47'),
	(6, 'Câu Hỏi Thường Gặp', 'cau-hoi-thuong-gap', '<h1>Câu Hỏi Thường Gặp</h1>\n            <p>Trang này tổng hợp các câu hỏi thường gặp về đặt tour, lịch khởi hành, xác nhận đơn hàng, thanh toán và chính sách hỗ trợ.</p>\n            <p>Nếu bạn cần thông tin thanh toán, xem <a href="/guides/huong-dan-thanh-toan">Hướng Dẫn Thanh Toán</a>. Nếu cần điều khoản dịch vụ, xem <a href="/guides/dieu-khoan-su-dung">Điều Khoản Sử Dụng</a>.</p>', 1, '2026-11-08 14:29:47'),
	(7, 'Chính Sách Bảo Mật', 'chinh-sach-bao-mat', '<h1>Chính Sách Bảo Mật</h1>\n            <p>Kỳ Nghỉ Tuyệt Vời cam kết bảo vệ thông tin cá nhân của khách hàng và chỉ sử dụng dữ liệu trong phạm vi tư vấn, đặt tour, chăm sóc khách hàng và vận hành dịch vụ.</p>\n            <p>Vui lòng xem thêm <a href="/guides/dieu-khoan-su-dung">Điều Khoản Sử Dụng</a>.</p>', 1, '2026-11-08 14:29:47'),
	(8, 'Hướng Dẫn Thanh Toán', 'huong-dan-thanh-toan', '<h1>Hướng Dẫn Thanh Toán</h1>\n            <p>Khách hàng có thể thanh toán theo hướng dẫn của nhân viên tư vấn hoặc theo thông tin được cung cấp trong quá trình đặt tour.</p>\n            <p>Sau khi thanh toán, vui lòng giữ lại chứng từ để đối chiếu khi cần. Xem thêm <a href="/guides/cau-hoi-thuong-gap">Câu Hỏi Thường Gặp</a>.</p>', 1, '2026-11-08 14:29:47');

-- Dumping structure for table db_marketing_tour.guide_translations
DROP TABLE IF EXISTS `guide_translations`;
CREATE TABLE IF NOT EXISTS `guide_translations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guide_id` int(11) NOT NULL,
  `language` varchar(10) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guide_translations_guide_id_language` (`guide_id`,`language`),
  CONSTRAINT `fk_guide_translations_guide` FOREIGN KEY (`guide_id`) REFERENCES `guides` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.guide_translations: ~24 rows (approximately)
DELETE FROM `guide_translations`;
INSERT INTO `guide_translations` (`id`, `guide_id`, `language`, `title`, `slug`, `content`) VALUES
	(1, 1, 'vi', 'Hướng dẫn đặt tour trên hệ thống', 'huong-dan-dat-tour', '<h2>Cách&nbsp;đặt&nbsp;tour</h2><p>Bước&nbsp;1:&nbsp;Chọn&nbsp;tour...&nbsp;Bước&nbsp;2:&nbsp;Điền&nbsp;thông&nbsp;tin...&nbsp;Bước&nbsp;3:&nbsp;Chờ&nbsp;admin&nbsp;liên&nbsp;hệ.1</p>'),
	(2, 2, 'vi', 'Chính sách hoàn hủy tour', 'chinh-sach-hoan-huy', '<h2>Chính sách hủy</h2><p>Hủy trước 7 ngày hoàn 100% tiền. Hủy trước 3 ngày hoàn 50% tiền.</p>'),
	(3, 1, 'en', 'How to Book a Tour on the System', 'how-to-book-a-tour-on-the-system', '<h2>How&nbsp;to&nbsp;book&nbsp;a&nbsp;tour</h2><p>Step&nbsp;1:&nbsp;Choose&nbsp;a&nbsp;tour...&nbsp;Step&nbsp;2:&nbsp;Enter&nbsp;your&nbsp;information...&nbsp;Step&nbsp;3:&nbsp;Wait&nbsp;for&nbsp;admin&nbsp;contact.1</p>'),
	(4, 1, 'zh', '如何在系统上预订旅游', 'ru-he-zai-xi-tong-shang-yu-ding-lv-you', '<h2>如何预订旅游</h2><p>步骤&nbsp;1：选择旅游产品...&nbsp;步骤&nbsp;2：填写您的信息...&nbsp;步骤&nbsp;3：等待管理员联系。1</p>'),
	(5, 2, 'en', 'Tour Cancellation and Refund Policy', 'tour-cancellation-and-refund-policy', '<h2>Cancellation&nbsp;Policy</h2><p>Cancel&nbsp;7&nbsp;days&nbsp;in&nbsp;advance&nbsp;for&nbsp;a&nbsp;100%&nbsp;refund.&nbsp;Cancel&nbsp;3&nbsp;days&nbsp;in&nbsp;advance&nbsp;for&nbsp;a&nbsp;50%&nbsp;refund.</p>'),
	(6, 2, 'zh', '旅游取消和退款政策', 'lv-you-qu-xiao-he-tui-kuan-zheng-ce', '<h2>取消政策</h2><p>提前&nbsp;7&nbsp;天取消可退还&nbsp;100%&nbsp;费用。提前&nbsp;3&nbsp;天取消可退还&nbsp;50%&nbsp;费用。</p>'),
	(7, 3, 'vi', 'Về Chúng Tôi', 've-chung-toi', '<h1>About&nbsp;Us&nbsp;1</h1><p>Ky&nbsp;Nghi&nbsp;Tuyet&nbsp;Voi&nbsp;helps&nbsp;travelers&nbsp;choose&nbsp;tours,&nbsp;departure&nbsp;dates,&nbsp;and&nbsp;services&nbsp;suited&nbsp;to&nbsp;every&nbsp;journey.</p><p>Explore&nbsp;our&nbsp;<a href="/guides/blog-du-lich" rel="noopener noreferrer" target="_blank">Travel&nbsp;Blog</a>,&nbsp;<a href="/guides/cau-hoi-thuong-gap" rel="noopener noreferrer" target="_blank">Frequently&nbsp;Asked&nbsp;Questions</a>,&nbsp;and&nbsp;<a href="/guides/huong-dan-thanh-toan" rel="noopener noreferrer" target="_blank">Payment&nbsp;Guide</a>.</p>'),
	(8, 3, 'en', 'About Us', 'about-us', '<h1>关于我们</h1><p>美好假期为旅客提供旅游线路、出发日期和配套服务建议，陪伴您规划每一段旅程。</p><p>欢迎了解我们的<a href="/guides/blog-du-lich" rel="noopener noreferrer" target="_blank">旅行博客</a>、<a href="/guides/cau-hoi-thuong-gap" rel="noopener noreferrer" target="_blank">常见问题</a>和<a href="/guides/huong-dan-thanh-toan" rel="noopener noreferrer" target="_blank">付款指南</a>。</p>'),
	(9, 3, 'zh', '关于我们', '', '<h1>关于我们</h1><p>美好假期为旅客提供旅游线路、出发日期和配套服务建议，陪伴您规划每一段旅程。</p><p>欢迎了解我们的<a href="/guides/blog-du-lich" rel="noopener noreferrer" target="_blank">旅行博客</a>、<a href="/guides/cau-hoi-thuong-gap" rel="noopener noreferrer" target="_blank">常见问题</a>和<a href="/guides/huong-dan-thanh-toan" rel="noopener noreferrer" target="_blank">付款指南</a>。</p>'),
	(10, 4, 'vi', 'Blog Du Lịch', 'blog-du-lich', '<h1>Blog Du Lịch</h1>\n            <p>Nơi tổng hợp kinh nghiệm du lịch, gợi ý điểm đến, lưu ý trước chuyến đi và các thông tin hữu ích cho khách hàng.</p>\n            <p>Tham khảo thêm <a href="/guides/ve-chung-toi">Về Chúng Tôi</a> và <a href="/guides/cau-hoi-thuong-gap">Câu Hỏi Thường Gặp</a>.</p>'),
	(11, 4, 'en', 'Travel Blog', 'travel-blog', '<h1>Travel Blog</h1><p>Travel tips, destination ideas, pre-trip reminders, and useful information for your next journey.</p><p>Learn more <a href="/guides/ve-chung-toi">About Us</a> and browse our <a href="/guides/cau-hoi-thuong-gap">Frequently Asked Questions</a>.</p>'),
	(12, 4, 'zh', '旅行博客', 'lv-xing-bo-ke', '<h1>旅行博客</h1><p>这里汇集旅行经验、目的地推荐、出行前提示以及旅客实用信息。</p><p>了解<a href="/guides/ve-chung-toi">关于我们</a>，也可查看<a href="/guides/cau-hoi-thuong-gap">常见问题</a>。</p>'),
	(13, 5, 'vi', 'Điều Khoản Sử Dụng', 'dieu-khoan-su-dung', '<h1>Điều Khoản Sử Dụng</h1>\n            <p>Khi sử dụng website và dịch vụ của Kỳ Nghỉ Tuyệt Vời, khách hàng đồng ý tuân thủ các điều khoản đặt tour, thanh toán và sử dụng thông tin được công bố.</p>\n            <p>Vui lòng đọc thêm <a href="/guides/chinh-sach-bao-mat">Chính Sách Bảo Mật</a> và <a href="/guides/huong-dan-thanh-toan">Hướng Dẫn Thanh Toán</a>.</p>'),
	(14, 5, 'en', 'Terms of Use', 'terms-of-use', '<h1>Terms of Use</h1><p>By using the Ky Nghi Tuyet Voi website and services, customers agree to follow the published terms for tour bookings, payments, and use of information.</p><p>Please also read our <a href="/guides/chinh-sach-bao-mat">Privacy Policy</a> and <a href="/guides/huong-dan-thanh-toan">Payment Guide</a>.</p>'),
	(15, 5, 'zh', '使用条款', 'shi-yong-tiao-kuan', '<h1>使用条款</h1><p>使用美好假期网站及服务即表示您同意遵守已公布的旅游预订、付款和信息使用条款。</p><p>请同时阅读<a href="/guides/chinh-sach-bao-mat">隐私政策</a>和<a href="/guides/huong-dan-thanh-toan">付款指南</a>。</p>'),
	(16, 6, 'vi', 'Câu Hỏi Thường Gặp', 'cau-hoi-thuong-gap', '<h1>Câu Hỏi Thường Gặp</h1>\n            <p>Trang này tổng hợp các câu hỏi thường gặp về đặt tour, lịch khởi hành, xác nhận đơn hàng, thanh toán và chính sách hỗ trợ.</p>\n            <p>Nếu bạn cần thông tin thanh toán, xem <a href="/guides/huong-dan-thanh-toan">Hướng Dẫn Thanh Toán</a>. Nếu cần điều khoản dịch vụ, xem <a href="/guides/dieu-khoan-su-dung">Điều Khoản Sử Dụng</a>.</p>'),
	(17, 6, 'en', 'Frequently Asked Questions', 'frequently-asked-questions', '<h1>Frequently Asked Questions</h1><p>Answers to common questions about tour bookings, departure dates, order confirmations, payments, and customer support.</p><p>For payment information, see our <a href="/guides/huong-dan-thanh-toan">Payment Guide</a>. For service terms, see <a href="/guides/dieu-khoan-su-dung">Terms of Use</a>.</p>'),
	(18, 6, 'zh', '常见问题', 'chang-jian-wen-ti', '<h1>常见问题</h1><p>本页汇总旅游预订、出发日期、订单确认、付款和客户支持等常见问题。</p><p>付款信息请查看<a href="/guides/huong-dan-thanh-toan">付款指南</a>；服务条款请查看<a href="/guides/dieu-khoan-su-dung">使用条款</a>。</p>'),
	(19, 7, 'vi', 'Chính Sách Bảo Mật', 'chinh-sach-bao-mat', '<h1>Chính Sách Bảo Mật</h1>\n            <p>Kỳ Nghỉ Tuyệt Vời cam kết bảo vệ thông tin cá nhân của khách hàng và chỉ sử dụng dữ liệu trong phạm vi tư vấn, đặt tour, chăm sóc khách hàng và vận hành dịch vụ.</p>\n            <p>Vui lòng xem thêm <a href="/guides/dieu-khoan-su-dung">Điều Khoản Sử Dụng</a>.</p>'),
	(20, 7, 'en', 'Privacy Policy', 'privacy-policy', '<h1>Privacy Policy</h1><p>Ky Nghi Tuyet Voi is committed to protecting customers’ personal information and using it only for consultation, tour bookings, customer care, and service operations.</p><p>Please also read our <a href="/guides/dieu-khoan-su-dung">Terms of Use</a>.</p>'),
	(21, 7, 'zh', '隐私政策', 'yin-si-zheng-ce', '<h1>隐私政策</h1><p>美好假期承诺保护客户个人信息，并仅将其用于咨询、旅游预订、客户服务和业务运营。</p><p>请同时阅读<a href="/guides/dieu-khoan-su-dung">使用条款</a>。</p>'),
	(22, 8, 'vi', 'Hướng Dẫn Thanh Toán', 'huong-dan-thanh-toan', '<h1>Hướng Dẫn Thanh Toán</h1>\n            <p>Khách hàng có thể thanh toán theo hướng dẫn của nhân viên tư vấn hoặc theo thông tin được cung cấp trong quá trình đặt tour.</p>\n            <p>Sau khi thanh toán, vui lòng giữ lại chứng từ để đối chiếu khi cần. Xem thêm <a href="/guides/cau-hoi-thuong-gap">Câu Hỏi Thường Gặp</a>.</p>'),
	(23, 8, 'en', 'Payment Guide', 'payment-guide', '<h1>Payment Guide</h1><p>Customers can pay by following their travel consultant’s instructions or the payment information provided during booking.</p><p>Please keep your payment receipt for reference. See our <a href="/guides/cau-hoi-thuong-gap">Frequently Asked Questions</a> for more information.</p>'),
	(24, 8, 'zh', '付款指南', 'fu-kuan-zhi-nan', '<h1>付款指南</h1><p>客户可按照顾问的指引，或按照预订过程中提供的付款信息完成付款。</p><p>请保留付款凭证以便核对。更多信息请查看<a href="/guides/cau-hoi-thuong-gap">常见问题</a>。</p>');

-- Dumping structure for table db_marketing_tour.notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` enum('like','reply','booking') NOT NULL,
  `sender_name` varchar(150) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `related_id` int(11) DEFAULT NULL,
  `related_slug` varchar(255) DEFAULT NULL,
  `is_read` tinyint(4) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.notifications: ~35 rows (approximately)
DELETE FROM `notifications`;
INSERT INTO `notifications` (`id`, `user_id`, `type`, `sender_name`, `message`, `related_id`, `related_slug`, `is_read`, `created_at`) VALUES
	(1, 7, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills". Vui lòng chờ nhân viên liên hệ xác nhận.', 24, NULL, 1, '2026-04-27 16:59:52'),
	(2, 7, 'booking', 'Hệ thống', 'đơn đặt tour "Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills" của bạn đã được duyệt', 24, NULL, 1, '2026-04-27 17:00:07'),
	(3, 7, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park". Vui lòng chờ nhân viên liên hệ xác nhận.', 25, 'nghi-duong-phu-quoc-hon-thom', 1, '2026-04-27 17:37:32'),
	(4, 7, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park". Vui lòng chờ nhân viên liên hệ xác nhận.', 26, 'nghi-duong-phu-quoc-hon-thom', 1, '2026-04-27 17:37:56'),
	(5, 7, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan". Vui lòng chờ nhân viên liên hệ xác nhận.', 27, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 1, '2026-04-27 19:30:36'),
	(6, 7, 'booking', 'Hệ thống', 'đơn đặt tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan" của bạn đã được duyệt', 27, NULL, 1, '2026-04-27 19:43:39'),
	(7, 1, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park". Vui lòng chờ nhân viên liên hệ xác nhận.', 28, 'nghi-duong-phu-quoc-hon-thom2', 1, '2026-04-29 20:53:00'),
	(8, 1, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park". Vui lòng chờ nhân viên liên hệ xác nhận.', 29, 'nghi-duong-phu-quoc-hon-thom2', 1, '2026-04-29 20:56:38'),
	(9, 1, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park". Vui lòng chờ nhân viên liên hệ xác nhận.', 30, 'nghi-duong-phu-quoc-hon-thom2', 1, '2026-04-29 20:56:52'),
	(10, 1, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park". Vui lòng chờ nhân viên liên hệ xác nhận.', 31, 'nghi-duong-phu-quoc-hon-thom2', 1, '2026-04-29 20:58:55'),
	(11, 2, 'booking', 'Hệ thống', 'đơn đặt tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan" của bạn đã được duyệt', 9, NULL, 0, '2026-04-30 10:28:00'),
	(12, 3, 'booking', 'Hệ thống', 'đơn đặt tour "Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills" của bạn đã được duyệt', 18, 'hanh-trinh-di-san-da-nang-hoi-an-ba-na4', 0, '2026-04-30 10:54:28'),
	(13, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park". Vui lòng chờ nhân viên liên hệ xác nhận.', 32, 'nghi-duong-phu-quoc-hon-thom2', 0, '2026-05-02 07:39:03'),
	(14, 8, 'booking', 'Hệ thống', 'đơn đặt tour "Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park" của bạn đã được duyệt', 32, 'nghi-duong-phu-quoc-hon-thom2', 0, '2026-06-13 08:09:55'),
	(15, 3, 'booking', 'Hệ thống', 'đơn đặt tour "Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills" của bạn đã được duyệt', 6, 'hanh-trinh-di-san-da-nang-hoi-an-ba-na3', 0, '2026-06-13 08:22:12'),
	(16, 3, 'booking', 'Hệ thống', 'đơn đặt tour "Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park" của bạn đã được duyệt', 2, 'nghi-duong-phu-quoc-hon-thom', 0, '2026-06-13 08:22:51'),
	(17, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan". Vui lòng chờ nhân viên liên hệ xác nhận.', 33, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 08:44:34'),
	(18, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan". Vui lòng chờ nhân viên liên hệ xác nhận.', 34, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 08:47:16'),
	(19, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan". Vui lòng chờ nhân viên liên hệ xác nhận.', 35, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 08:53:57'),
	(20, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan". Vui lòng chờ nhân viên liên hệ xác nhận.', 36, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 08:57:43'),
	(21, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan". Vui lòng chờ nhân viên liên hệ xác nhận.', 37, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 08:58:35'),
	(22, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan". Vui lòng chờ nhân viên liên hệ xác nhận.', 38, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 09:00:45'),
	(23, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan". Vui lòng chờ nhân viên liên hệ xác nhận.', 39, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 09:00:54'),
	(24, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan". Vui lòng chờ nhân viên liên hệ xác nhận.', 40, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 09:04:59'),
	(25, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan". Vui lòng chờ nhân viên liên hệ xác nhận.', 41, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 09:06:14'),
	(26, 3, 'booking', 'Hệ thống', 'đơn đặt tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan" của bạn đã được duyệt', 12, 'tour-kham-pha-sapa-chinh-phuc-fansipan', 0, '2026-06-13 09:17:13'),
	(27, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1". Vui lòng chờ nhân viên liên hệ xác nhận.', 42, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 10:08:33'),
	(28, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1". Vui lòng chờ nhân viên liên hệ xác nhận.', 43, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 10:09:41'),
	(29, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1". Vui lòng chờ nhân viên liên hệ xác nhận.', 44, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 10:35:58'),
	(30, 10, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "TRUNG QUỐC 2026- Giang Nam thỦy mẶc THƯỢNG HẢI - HÀNG CHÂU – Ô TRẤN". Vui lòng chờ nhân viên liên hệ xác nhận.', 45, 'trung-quoc-2026-giang-nam-thuy-mac-thuong-hai-hang-chau-o-tran', 1, '2026-08-03 11:15:20'),
	(31, 10, 'booking', 'Hệ thống', 'đơn đặt tour "TRUNG QUỐC 2026- Giang Nam thỦy mẶc THƯỢNG HẢI - HÀNG CHÂU – Ô TRẤN" của bạn đã được duyệt', 45, 'trung-quoc-2026-giang-nam-thuy-mac-thuong-hai-hang-chau-o-tran', 0, '2026-08-03 11:16:43'),
	(32, 1, 'booking', 'System', 'your booking for "CHINA 2026- Jiangnan Waterfall SHANGHAI - HANGZHOU - WZHEN" has been submitted. Please wait for our team to contact you for confirmation.', 46, 'trung-quoc-2026-giang-nam-thuy-mac-thuong-hai-hang-chau-o-tran', 1, '2026-09-09 16:42:08'),
	(33, 11, 'booking', 'System', 'your booking for "CHINA 2026- Jiangnan Waterfall SHANGHAI - HANGZHOU - WZHEN" has been submitted. Please wait for our team to contact you for confirmation.', 47, 'trung-quoc-2026-giang-nam-thuy-mac-thuong-hai-hang-chau-o-tran', 0, '2026-09-09 16:45:17'),
	(34, 17, 'booking', 'System', 'your booking for "CHINA 2026- Jiangnan Waterfall SHANGHAI - HANGZHOU - WZHEN" has been submitted. Please wait for our team to contact you for confirmation.', 48, 'trung-quoc-2026-giang-nam-thuy-mac-thuong-hai-hang-chau-o-tran', 0, '2026-09-09 16:58:55'),
	(35, 17, 'booking', 'System', 'your booking for "CHINA 2026- Jiangnan Waterfall SHANGHAI - HANGZHOU - WZHEN" has been approved', 48, 'trung-quoc-2026-giang-nam-thuy-mac-thuong-hai-hang-chau-o-tran', 0, '2026-09-09 16:59:24');

-- Dumping structure for table db_marketing_tour.otps
DROP TABLE IF EXISTS `otps`;
CREATE TABLE IF NOT EXISTS `otps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `type` enum('register','reset_password') NOT NULL,
  `attempts` int(11) DEFAULT 0,
  `expired_at` datetime NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_expired_at` (`expired_at`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.otps: ~1 rows (approximately)
DELETE FROM `otps`;
INSERT INTO `otps` (`id`, `email`, `otp_code`, `type`, `attempts`, `expired_at`, `created_at`) VALUES
	(17, 'user_1788947911660@example.com', '380409', 'register', 0, '2026-09-09 17:03:32', '2026-09-09 16:58:32');

-- Dumping structure for table db_marketing_tour.roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`),
  UNIQUE KEY `role_name_2` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.roles: ~2 rows (approximately)
DELETE FROM `roles`;
INSERT INTO `roles` (`id`, `role_name`) VALUES
	(1, 'ADMIN'),
	(2, 'CUSTOMER');

-- Dumping structure for table db_marketing_tour.tours
DROP TABLE IF EXISTS `tours`;
CREATE TABLE IF NOT EXISTS `tours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `summary` text DEFAULT NULL,
  `highlights` text DEFAULT NULL COMMENT 'Điểm nổi bật của tour',
  `price_includes` text DEFAULT NULL COMMENT 'Giá tour bao gồm',
  `price_excludes` text DEFAULT NULL COMMENT 'Giá tour không bao gồm',
  `terms_and_notes` text DEFAULT NULL COMMENT 'Điều khoản và lưu ý',
  `cancellation_policy` text DEFAULT NULL COMMENT 'Quy định hoàn hủy',
  `duration_days` int(11) DEFAULT NULL COMMENT 'Số ngày',
  `duration_nights` int(11) DEFAULT NULL COMMENT 'Số đêm',
  `thumbnail_url` text DEFAULT NULL,
  `tour_badge` enum('featured','promotion','none') DEFAULT 'none',
  `status` enum('active','hidden','sold_out') DEFAULT 'active',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `slug` (`slug`) USING BTREE,
  UNIQUE KEY `slug_2` (`slug`),
  KEY `category_id` (`category_id`,`status`) USING BTREE,
  CONSTRAINT `fk_tour_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.tours: ~12 rows (approximately)
DELETE FROM `tours`;
INSERT INTO `tours` (`id`, `category_id`, `title`, `slug`, `summary`, `highlights`, `price_includes`, `price_excludes`, `terms_and_notes`, `cancellation_policy`, `duration_days`, `duration_nights`, `thumbnail_url`, `tour_badge`, `status`) VALUES
	(1, 2, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 3', 'tour-kham-pha-sapa-chinh-phuc-fansipan', 'Hành trình đến với thị trấn trong sương, khám phá bản Cát Cát và chinh phục nóc nhà Đông Dương.', NULL, NULL, NULL, NULL, NULL, 3, 2, '/uploads/banners/banner-1774264639505-576996427.webp', 'featured', 'active'),
	(2, 1, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 1', 'nghi-duong-phu-quoc-hon-thom', 'Tận hưởng nắng vàng biển xanh tại đảo ngọc Phú Quốc, đi cáp treo vượt biển dài nhất thế giới.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/banners/banner-1774264639505-576996427.webp', 'promotion', 'active'),
	(3, 1, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 1', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/banners/banner-1774264639505-576996427.webp', 'featured', 'active'),
	(4, 2, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 2', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na1', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/banners/banner-1774264639505-576996427.webp', 'promotion', 'active'),
	(5, 1, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 3', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na2', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/banners/banner-1774264639505-576996427.webp', 'featured', 'active'),
	(6, 1, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 4', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na3', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/banners/banner-1774264639505-576996427.webp', 'featured', 'active'),
	(7, 2, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 5', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na4', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/banners/banner-1774264639505-576996427.webp', 'featured', 'active'),
	(8, 2, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1', 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 'Hành trình đến với thị trấn trong sương, khám phá bản Cát Cát và chinh phục nóc nhà Đông Dương.', NULL, NULL, NULL, NULL, NULL, 3, 2, '/uploads/banners/banner-1774264639505-576996427.webp', 'featured', 'active'),
	(9, 1, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 2', 'tour-kham-pha-sapa-chinh-phuc-fansipan2', 'Hành trình đến với thị trấn trong sương, khám phá bản Cát Cát và chinh phục nóc nhà Đông Dương.', NULL, NULL, NULL, NULL, NULL, 3, 2, '/uploads/banners/banner-1774264639505-576996427.webp', 'featured', 'active'),
	(10, 1, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 2', 'nghi-duong-phu-quoc-hon-thom1', 'Tận hưởng nắng vàng biển xanh tại đảo ngọc Phú Quốc, đi cáp treo vượt biển dài nhất thế giới.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/banners/banner-1774264639505-576996427.webp', 'featured', 'active'),
	(11, 1, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 3', 'nghi-duong-phu-quoc-hon-thom2', 'Tận hưởng nắng vàng biển xanh tại đảo ngọc Phú Quốc, đi cáp treo vượt biển dài nhất thế giới.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/banners/banner-1774264639505-576996427.webp', 'featured', 'active'),
	(13, 2, 'Tour Malaysia - Singapore 5N4Đ: Khám Phá Văn Hóa Đông Nam Á', 'tour-malaysia-singapore-5n4d-kham-pha-van-hoa-dong-nam-a', 'Khám phá Gardens by the Bay: Vườn sinh thái biểu tượng Singapore.', 'Vận chuyển\r\n- Vé máy bay khứ hồi theo hãng Vietnam Airline (23kg hành lý ký gửi + xách tay 10kg).\r\n- Xe máy lạnh phục vụ suốt tuyến.\r\n- Phí an ninh sân bay, bảo hiểm hàng không, thuế phi trường 2 nước (theo quy định tại thời điểm xuất vé).\r\nLưu trú\r\n- Khách sạn tiêu chuẩn 3-4* địa phương (2 khách/phòng; khách lẻ nam/nữ có thể bố trí phòng phù hợp).\r\nDịch vụ khác\r\n- Vé tham quan trong chương trình. \r\n- Các bữa ăn theo chương trình. (đảm bảo số lượng & chất lượng tương đương nếu có điều chỉnh).\r\n- Nước suối 01 chai/khách/ngày.\r\n- Bảo hiểm du lịch quốc tế. \r\n- Trưởng đoàn và HDV địa phương phục vụ suốt hành trình.\r\n- Tặng nón du lịch. \r\n- Thuế VAT.', '<p><strong>Vận&nbsp;chuyển</strong></p><p>-&nbsp;Vé&nbsp;máy&nbsp;bay&nbsp;khứ&nbsp;hồi&nbsp;theo&nbsp;hãng&nbsp;Vietnam&nbsp;Airline&nbsp;(23kg&nbsp;hành&nbsp;lý&nbsp;ký&nbsp;gửi&nbsp;+&nbsp;xách&nbsp;tay&nbsp;10kg).</p><p>-&nbsp;Xe&nbsp;máy&nbsp;lạnh&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;tuyến.</p><p>-&nbsp;Phí&nbsp;an&nbsp;ninh&nbsp;sân&nbsp;bay,&nbsp;bảo&nbsp;hiểm&nbsp;hàng&nbsp;không,&nbsp;thuế&nbsp;phi&nbsp;trường&nbsp;2&nbsp;nước&nbsp;(theo&nbsp;quy&nbsp;định&nbsp;tại&nbsp;thời&nbsp;điểm&nbsp;xuất&nbsp;vé).</p><p><strong>Lưu&nbsp;trú</strong></p><p>-&nbsp;Khách&nbsp;sạn&nbsp;tiêu&nbsp;chuẩn&nbsp;3-4*&nbsp;địa&nbsp;phương&nbsp;(2&nbsp;khách/phòng;&nbsp;khách&nbsp;lẻ&nbsp;nam/nữ&nbsp;có&nbsp;thể&nbsp;bố&nbsp;trí&nbsp;phòng&nbsp;phù&nbsp;hợp).</p><p><strong>Dịch&nbsp;vụ&nbsp;khác</strong></p><p>-&nbsp;Vé&nbsp;tham&nbsp;quan&nbsp;trong&nbsp;chương&nbsp;trình.&nbsp;</p><p>-&nbsp;Các&nbsp;bữa&nbsp;ăn&nbsp;theo&nbsp;chương&nbsp;trình.&nbsp;(đảm&nbsp;bảo&nbsp;số&nbsp;lượng&nbsp;&amp;&nbsp;chất&nbsp;lượng&nbsp;tương&nbsp;đương&nbsp;nếu&nbsp;có&nbsp;điều&nbsp;chỉnh).</p><p>-&nbsp;Nước&nbsp;suối&nbsp;01&nbsp;chai/khách/ngày.</p><p>-&nbsp;Bảo&nbsp;hiểm&nbsp;du&nbsp;lịch&nbsp;quốc&nbsp;tế.&nbsp;</p><p>-&nbsp;Trưởng&nbsp;đoàn&nbsp;và&nbsp;HDV&nbsp;địa&nbsp;phương&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;hành&nbsp;trình.</p><p>-&nbsp;Tặng&nbsp;nón&nbsp;du&nbsp;lịch.&nbsp;</p><p>-&nbsp;Thuế&nbsp;VAT.</p>', '<p>-&nbsp;Phụ&nbsp;thu&nbsp;phòng&nbsp;đơn&nbsp;(nếu&nbsp;có):&nbsp;4.300.000đ/khách/tour&nbsp;-&nbsp;4.800.000đ/khách/tour.&nbsp;</p><p>-&nbsp;Tips&nbsp;cho&nbsp;tài&nbsp;xế&nbsp;và&nbsp;hướng&nbsp;dẫn&nbsp;viên:&nbsp;25&nbsp;USD/khách/tour.</p><p>-&nbsp;Phụ&nbsp;thu&nbsp;đối&nbsp;với&nbsp;khách&nbsp;mang&nbsp;quốc&nbsp;tịch&nbsp;nước&nbsp;ngoài:&nbsp;660.000đ/khách.</p><p>-&nbsp;Visa&nbsp;tái&nbsp;nhập&nbsp;Việt&nbsp;Nam&nbsp;cho&nbsp;khách&nbsp;quốc&nbsp;tịch&nbsp;nước&nbsp;ngoài&nbsp;theo&nbsp;quy&nbsp;định&nbsp;hiện&nbsp;hành&nbsp;(nếu&nbsp;có).</p><p>-&nbsp;Chi&nbsp;phí&nbsp;cá&nbsp;nhân:&nbsp;hành&nbsp;lý&nbsp;quá&nbsp;cước,&nbsp;điện&nbsp;thoại,&nbsp;giặt&nbsp;ủi,&nbsp;tham&nbsp;quan,&nbsp;chi&nbsp;tiêu&nbsp;ngoài&nbsp;chương&nbsp;trình.</p>', '<p>Chính&nbsp;sách&nbsp;trẻ&nbsp;em</p><p><strong>1.&nbsp;Quy&nbsp;định&nbsp;chung:</strong></p><p>-&nbsp;Mỗi&nbsp;02&nbsp;người&nbsp;lớn&nbsp;được&nbsp;kèm&nbsp;01&nbsp;trẻ&nbsp;em.</p><p>-&nbsp;Từ&nbsp;trẻ&nbsp;thứ&nbsp;02&nbsp;trở&nbsp;đi,&nbsp;áp&nbsp;dụng&nbsp;mức&nbsp;giá&nbsp;theo&nbsp;quy&nbsp;định&nbsp;của&nbsp;từng&nbsp;nhóm&nbsp;tuổi&nbsp;(nêu&nbsp;bên&nbsp;dưới).</p><p>-&nbsp;Trẻ&nbsp;em&nbsp;ngủ&nbsp;chung&nbsp;giường&nbsp;với&nbsp;bố&nbsp;mẹ.&nbsp;→&nbsp;Nếu&nbsp;cần&nbsp;giường&nbsp;riêng:&nbsp;Tính&nbsp;như&nbsp;người&nbsp;lớn.</p><p>-&nbsp;Chi&nbsp;phí&nbsp;ngoài&nbsp;chương&nbsp;trình&nbsp;(nếu&nbsp;có)&nbsp;gia&nbsp;đình&nbsp;tự&nbsp;chi&nbsp;trả.</p><p><strong>2.&nbsp;Quy&nbsp;định&nbsp;theo&nbsp;độ&nbsp;tuổi:</strong></p><p>-&nbsp;Trẻ&nbsp;dưới&nbsp;2&nbsp;tuổi:&nbsp;Giá&nbsp;như&nbsp;trên&nbsp;website,&nbsp;đã&nbsp;bao&nbsp;gồm&nbsp;vé&nbsp;máy&nbsp;bay,&nbsp;không&nbsp;có&nbsp;ghế&nbsp;riêng,&nbsp;ngủ&nbsp;chung&nbsp;với&nbsp;bố&nbsp;mẹ.</p><p>-&nbsp;Trẻ&nbsp;từ&nbsp;2&nbsp;-&nbsp;10&nbsp;tuổi:&nbsp;Giá&nbsp;như&nbsp;trên&nbsp;website,&nbsp;bao&nbsp;gồm&nbsp;đầy&nbsp;đủ&nbsp;dịch&nbsp;vụ&nbsp;trong&nbsp;chương&nbsp;trình.&nbsp;Ngủ&nbsp;chung&nbsp;với&nbsp;bố&nbsp;mẹ.&nbsp;Từ&nbsp;trẻ&nbsp;thứ&nbsp;02&nbsp;trở&nbsp;đi:&nbsp;tính&nbsp;100%&nbsp;giá&nbsp;người&nbsp;lớn.</p><p>-&nbsp;Trẻ&nbsp;từ&nbsp;11&nbsp;tuổi&nbsp;trở&nbsp;lên:&nbsp;tính&nbsp;giá&nbsp;như&nbsp;người&nbsp;lớn.</p><p>-&nbsp;Trong&nbsp;trường&nbsp;hợp&nbsp;chỉ&nbsp;có&nbsp;1&nbsp;khách&nbsp;(người&nbsp;lớn)&nbsp;đi&nbsp;với&nbsp;1&nbsp;bé&nbsp;(dưới&nbsp;12&nbsp;tuổi),&nbsp;bé&nbsp;được&nbsp;tính&nbsp;giá&nbsp;vé&nbsp;người&nbsp;lớn&nbsp;để&nbsp;đảm&nbsp;bảo&nbsp;dịch&nbsp;vụ&nbsp;theo&nbsp;quy&nbsp;định.</p><p><strong>Giấy&nbsp;tờ&nbsp;tùy&nbsp;thân&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour</strong></p><p>-&nbsp;Hộ&nbsp;chiếu&nbsp;bản&nbsp;chính&nbsp;và&nbsp;các&nbsp;giấy&nbsp;tờ&nbsp;cần&nbsp;thiết.</p><p>-&nbsp;Trẻ&nbsp;em&nbsp;dưới&nbsp;14&nbsp;tuổi&nbsp;bắt&nbsp;buộc&nbsp;mang&nbsp;theo&nbsp;giấy&nbsp;khai&nbsp;sinh.&nbsp;</p><p>-&nbsp;Trẻ&nbsp;em&nbsp;cần&nbsp;có&nbsp;bố&nbsp;mẹ&nbsp;hoặc&nbsp;người&nbsp;thân&nbsp;trên&nbsp;18&nbsp;tuổi&nbsp;đi&nbsp;cùng;&nbsp;trường&nbsp;hợp&nbsp;đi&nbsp;cùng&nbsp;người&nbsp;thân&nbsp;cần&nbsp;có&nbsp;giấy&nbsp;ủy&nbsp;quyền&nbsp;hợp&nbsp;lệ.</p><p>Chính&nbsp;sách&nbsp;hủy&nbsp;&amp;&nbsp;thay&nbsp;đổi</p><p>-&nbsp;Từ&nbsp;thời&nbsp;điểm&nbsp;đăng&nbsp;ký&nbsp;đến&nbsp;trước&nbsp;30&nbsp;ngày&nbsp;khởi&nbsp;hành:&nbsp;Phí&nbsp;hủy&nbsp;50%&nbsp;tiền&nbsp;cọc.</p><p>-&nbsp;Từ&nbsp;15&nbsp;trước&nbsp;ngày&nbsp;khởi&nbsp;hành:&nbsp;Phí&nbsp;hủy&nbsp;70%&nbsp;tổng&nbsp;giá&nbsp;tour.&nbsp;</p><p>-&nbsp;Sau&nbsp;thời&nbsp;gian&nbsp;trên:&nbsp;Phí&nbsp;hủy&nbsp;100%&nbsp;tổng&nbsp;giá&nbsp;tour.</p><p>-&nbsp;Thời&nbsp;gian&nbsp;hủy/thay&nbsp;đổi&nbsp;tour&nbsp;được&nbsp;ghi&nbsp;nhận&nbsp;trong&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;và&nbsp;tính&nbsp;theo&nbsp;ngày&nbsp;làm&nbsp;việc&nbsp;(không&nbsp;bao&nbsp;gồm&nbsp;Thứ&nbsp;Bảy,&nbsp;Chủ&nbsp;Nhật&nbsp;và&nbsp;Lễ/Tết).&nbsp;Các&nbsp;yêu&nbsp;cầu&nbsp;gửi&nbsp;ngoài&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;sẽ&nbsp;được&nbsp;tính&nbsp;từ&nbsp;đầu&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;của&nbsp;ngày&nbsp;kế&nbsp;tiếp.</p><p>-&nbsp;Quý&nbsp;khách&nbsp;vui&nbsp;lòng&nbsp;gửi&nbsp;yêu&nbsp;cầu&nbsp;hủy&nbsp;qua&nbsp;email&nbsp;hoặc&nbsp;kênh&nbsp;liên&nbsp;hệ&nbsp;chính&nbsp;thức&nbsp;của&nbsp;công&nbsp;ty&nbsp;để&nbsp;được&nbsp;ghi&nbsp;nhận.&nbsp;Thông&nbsp;báo&nbsp;qua&nbsp;điện&nbsp;thoại&nbsp;sẽ&nbsp;chưa&nbsp;được&nbsp;xem&nbsp;là&nbsp;căn&nbsp;cứ&nbsp;áp&nbsp;dụng&nbsp;chính&nbsp;sách&nbsp;hủy.</p><p>Thông&nbsp;tin&nbsp;Visa</p><p>-&nbsp;Miễn&nbsp;visa&nbsp;cho&nbsp;khách&nbsp;mang&nbsp;quốc&nbsp;tịch&nbsp;Việt&nbsp;Nam.</p><p>-&nbsp;Hộ&nbsp;chiếu&nbsp;nguyên&nbsp;vẹn&nbsp;và&nbsp;còn&nbsp;thời&nbsp;hạn&nbsp;sử&nbsp;dụng&nbsp;6&nbsp;tháng&nbsp;tính&nbsp;từ&nbsp;ngày&nbsp;kết&nbsp;thúc&nbsp;tour.&nbsp;</p><p><strong>Lưu&nbsp;ý&nbsp;về&nbsp;tình&nbsp;trạng&nbsp;cư&nbsp;trú</strong></p><p>-&nbsp;Quý&nbsp;khách&nbsp;mang&nbsp;2&nbsp;quốc&nbsp;tịch,&nbsp;Travel&nbsp;Document&nbsp;hoặc&nbsp;tình&nbsp;trạng&nbsp;cư&nbsp;trú&nbsp;đặc&nbsp;biệt&nbsp;vui&nbsp;lòng&nbsp;thông&nbsp;báo&nbsp;khi&nbsp;đăng&nbsp;ký&nbsp;và&nbsp;cung&nbsp;cấp&nbsp;đầy&nbsp;đủ&nbsp;giấy&nbsp;tờ&nbsp;liên&nbsp;quan.</p><p>-&nbsp;Khách&nbsp;chỉ&nbsp;có&nbsp;thẻ&nbsp;xanh&nbsp;nhưng&nbsp;không&nbsp;còn&nbsp;hộ&nbsp;chiếu&nbsp;Việt&nbsp;Nam&nbsp;còn&nbsp;hiệu&nbsp;lực&nbsp;sẽ&nbsp;không&nbsp;đủ&nbsp;điều&nbsp;kiện&nbsp;đăng&nbsp;ký&nbsp;tour&nbsp;sang&nbsp;nước&nbsp;thứ&nbsp;ba.</p><p>-&nbsp;Khách&nbsp;là&nbsp;Việt&nbsp;Kiều&nbsp;hoặc&nbsp;quốc&nbsp;tịch&nbsp;nước&nbsp;ngoài&nbsp;có&nbsp;visa&nbsp;rời&nbsp;nhập&nbsp;cảnh&nbsp;Việt&nbsp;Nam&nbsp;cần&nbsp;mang&nbsp;theo&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour.</p><p>-&nbsp;Trường&nbsp;hợp&nbsp;sử&nbsp;dụng&nbsp;ABTC&nbsp;(APEC),&nbsp;hộ&nbsp;chiếu&nbsp;công&nbsp;vụ,&nbsp;ngoại&nbsp;giao&nbsp;hoặc&nbsp;tự&nbsp;xin&nbsp;visa,&nbsp;vui&nbsp;lòng&nbsp;thông&nbsp;báo&nbsp;trước&nbsp;để&nbsp;được&nbsp;tư&nbsp;vấn&nbsp;phù&nbsp;hợp.</p><p>Điều&nbsp;kiện&nbsp;tham&nbsp;gia&nbsp;tour</p><p><strong>Độ&nbsp;tuổi&nbsp;và&nbsp;sức&nbsp;khỏe:</strong></p><p>-&nbsp;Tour&nbsp;áp&nbsp;dụng&nbsp;cho&nbsp;khách&nbsp;dưới&nbsp;70&nbsp;tuổi.</p><p>-&nbsp;Quý&nbsp;khách&nbsp;từ&nbsp;70&nbsp;tuổi&nbsp;trở&nbsp;lên&nbsp;cần&nbsp;đóng&nbsp;thêm&nbsp;phí&nbsp;bảo&nbsp;hiểm&nbsp;cao&nbsp;cấp&nbsp;theo&nbsp;quy&nbsp;định.</p><p>-&nbsp;Từ&nbsp;75&nbsp;tuổi&nbsp;trở&nbsp;lên&nbsp;cần&nbsp;cung&nbsp;cấp&nbsp;giấy&nbsp;xác&nbsp;nhận&nbsp;đủ&nbsp;sức&nbsp;khỏe&nbsp;do&nbsp;cơ&nbsp;sở&nbsp;y&nbsp;tế&nbsp;có&nbsp;thẩm&nbsp;quyền&nbsp;cấp&nbsp;và&nbsp;có&nbsp;người&nbsp;thân&nbsp;dưới&nbsp;60&nbsp;tuổi&nbsp;đi&nbsp;cùng.</p><p>-&nbsp;Khách&nbsp;mang&nbsp;thai&nbsp;vui&nbsp;lòng&nbsp;thông&nbsp;báo&nbsp;khi&nbsp;đăng&nbsp;ký;&nbsp;cần&nbsp;có&nbsp;ý&nbsp;kiến&nbsp;bác&nbsp;sĩ&nbsp;trước&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour.</p><p>-&nbsp;Không&nbsp;nhận&nbsp;khách&nbsp;mang&nbsp;thai&nbsp;từ&nbsp;5&nbsp;tháng&nbsp;trở&nbsp;lên&nbsp;vì&nbsp;lý&nbsp;do&nbsp;an&nbsp;toàn.</p><p>-&nbsp;Quý&nbsp;khách&nbsp;cần&nbsp;đảm&nbsp;bảo&nbsp;sức&nbsp;khỏe&nbsp;phù&nbsp;hợp&nbsp;để&nbsp;tham&nbsp;gia&nbsp;các&nbsp;hoạt&nbsp;động&nbsp;trong&nbsp;tour.</p><p>-&nbsp;Nếu&nbsp;có&nbsp;điều&nbsp;kiện&nbsp;sức&nbsp;khỏe&nbsp;đặc&nbsp;biệt,&nbsp;vui&nbsp;lòng&nbsp;thông&nbsp;báo&nbsp;cho&nbsp;nhân&nbsp;viên&nbsp;tư&nbsp;vấn&nbsp;trước&nbsp;khi&nbsp;đặt&nbsp;tour.&nbsp;Quý&nbsp;khách&nbsp;có&nbsp;thể&nbsp;được&nbsp;yêu&nbsp;cầu&nbsp;cung&nbsp;cấp&nbsp;chứng&nbsp;nhận&nbsp;sức&nbsp;khỏe&nbsp;hoặc&nbsp;ký&nbsp;cam&nbsp;kết&nbsp;trong&nbsp;một&nbsp;số&nbsp;trường&nbsp;hợp&nbsp;cần&nbsp;thiết.</p><p><strong>Quy&nbsp;định&nbsp;theo&nbsp;đoàn:&nbsp;</strong></p><p>-&nbsp;Chương&nbsp;trình&nbsp;có&nbsp;thể&nbsp;điều&nbsp;chỉnh&nbsp;thứ&nbsp;tự&nbsp;tham&nbsp;quan&nbsp;theo&nbsp;tình&nbsp;hình&nbsp;thực&nbsp;tế&nbsp;nhưng&nbsp;vẫn&nbsp;đảm&nbsp;bảo&nbsp;đầy&nbsp;đủ&nbsp;điểm.</p><p>-&nbsp;Tour&nbsp;khởi&nbsp;hành&nbsp;khi&nbsp;đủ&nbsp;15&nbsp;khách&nbsp;người&nbsp;lớn,&nbsp;nếu&nbsp;chưa&nbsp;đủ&nbsp;số&nbsp;lượng&nbsp;công&nbsp;ty&nbsp;sẽ&nbsp;thông&nbsp;báo&nbsp;và&nbsp;thỏa&nbsp;thuận&nbsp;lại&nbsp;ngày&nbsp;khởi&nbsp;hành&nbsp;hoặc&nbsp;hoàn&nbsp;tiền.</p><p>-&nbsp;Do&nbsp;tính&nbsp;chất&nbsp;tour&nbsp;ghép,&nbsp;Quý&nbsp;khách&nbsp;cần&nbsp;đi&nbsp;theo&nbsp;đoàn&nbsp;suốt&nbsp;hành&nbsp;trình&nbsp;và&nbsp;về&nbsp;đúng&nbsp;ngày&nbsp;kết&nbsp;thúc&nbsp;tour.</p><p>-&nbsp;Các&nbsp;dịch&nbsp;vụ&nbsp;trong&nbsp;chương&nbsp;trình&nbsp;đã&nbsp;được&nbsp;sắp&nbsp;xếp&nbsp;trước&nbsp;theo&nbsp;đoàn;&nbsp;trường&nbsp;hợp&nbsp;không&nbsp;sử&nbsp;dụng&nbsp;vì&nbsp;lý&nbsp;do&nbsp;cá&nbsp;nhân&nbsp;sẽ&nbsp;không&nbsp;được&nbsp;hoàn&nbsp;lại&nbsp;tiền.</p><p><strong>Xuất&nbsp;nhập&nbsp;cảnh:</strong></p><p>-&nbsp;Quý&nbsp;khách&nbsp;cần&nbsp;đảm&nbsp;bảo&nbsp;giấy&nbsp;tờ&nbsp;cá&nbsp;nhân&nbsp;hợp&nbsp;lệ&nbsp;theo&nbsp;quy&nbsp;định&nbsp;xuất/nhập&nbsp;cảnh,&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour.&nbsp;Trường&nbsp;hợp&nbsp;không&nbsp;được&nbsp;xuất/nhập&nbsp;cảnh,&nbsp;không&nbsp;thực&nbsp;hiện&nbsp;được&nbsp;chuyến&nbsp;đi&nbsp;do&nbsp;cơ&nbsp;quan&nbsp;chức&nbsp;năng&nbsp;không&nbsp;chấp&nbsp;thuận&nbsp;(vì&nbsp;bất&nbsp;kỳ&nbsp;lý&nbsp;do&nbsp;gì),&nbsp;chi&nbsp;phí&nbsp;tour&nbsp;sẽ&nbsp;không&nbsp;được&nbsp;hoàn&nbsp;trả.&nbsp;Công&nbsp;ty&nbsp;sẽ&nbsp;hỗ&nbsp;trợ&nbsp;hướng&nbsp;dẫn&nbsp;trong&nbsp;phạm&nbsp;vi&nbsp;có&nbsp;thể&nbsp;để&nbsp;giải&nbsp;quyết&nbsp;cho&nbsp;Quý&nbsp;khách.&nbsp;Mọi&nbsp;chi&nbsp;phí&nbsp;phát&nbsp;sinh&nbsp;Quý&nbsp;khách&nbsp;tự&nbsp;chủ&nbsp;động&nbsp;sắp&nbsp;xếp.</p><p>-&nbsp;Đối&nbsp;với&nbsp;quý&nbsp;khách&nbsp;có&nbsp;thay&nbsp;đổi&nbsp;đáng&nbsp;kể&nbsp;về&nbsp;đặc&nbsp;điểm&nbsp;nhận&nbsp;dạng&nbsp;trên&nbsp;khuôn&nbsp;mặt,&nbsp;ví&nbsp;dụ:&nbsp;phẫu&nbsp;thuật&nbsp;thẩm&nbsp;mỹ,&nbsp;vui&nbsp;lòng&nbsp;làm&nbsp;lại&nbsp;hộ&nbsp;chiếu&nbsp;theo&nbsp;quy&nbsp;định&nbsp;trước&nbsp;khi&nbsp;khởi&nbsp;hành.&nbsp;Trường&nbsp;hợp&nbsp;sử&nbsp;dụng&nbsp;hộ&nbsp;chiếu&nbsp;không&nbsp;còn&nbsp;phù&nbsp;hợp&nbsp;với&nbsp;diện&nbsp;mạo&nbsp;hiện&nbsp;tại&nbsp;và&nbsp;phát&nbsp;sinh&nbsp;vấn&nbsp;đề&nbsp;khi&nbsp;xuất&nbsp;nhập&nbsp;cảnh,&nbsp;Quý&nbsp;khách&nbsp;vui&nbsp;long&nbsp;tự&nbsp;chịu&nbsp;trách&nbsp;nhiệm.&nbsp;Các&nbsp;chi&nbsp;phí&nbsp;hủy&nbsp;đổi&nbsp;dịch&nbsp;vụ&nbsp;(nếu&nbsp;có)&nbsp;sẽ&nbsp;được&nbsp;áp&nbsp;dụng&nbsp;theo&nbsp;quy&nbsp;định.</p><p>-&nbsp;Đối&nbsp;với&nbsp;khách&nbsp;đã&nbsp;chuyển&nbsp;giới,&nbsp;thông&nbsp;tin&nbsp;trên&nbsp;Hộ&nbsp;chiếu&nbsp;và&nbsp;CCCD&nbsp;phải&nbsp;thống&nbsp;nhất&nbsp;và&nbsp;trùng&nbsp;khớp.&nbsp;Hình&nbsp;ảnh&nbsp;trên&nbsp;hộ&nbsp;chiếu&nbsp;cần&nbsp;là&nbsp;hình&nbsp;chụp&nbsp;sau&nbsp;khi&nbsp;chuyển&nbsp;giới/phẫu&nbsp;thuật&nbsp;thẩm&nbsp;mỹ,&nbsp;đảm&nbsp;bảo&nbsp;nhận&nbsp;diện&nbsp;rõ&nbsp;ràng&nbsp;theo&nbsp;hiện&nbsp;trạng&nbsp;thực&nbsp;tế,&nbsp;giống&nbsp;với&nbsp;hộ&nbsp;chiếu&nbsp;hiện&nbsp;đang&nbsp;sử&nbsp;dụng.</p><p><strong>Bất&nbsp;khả&nbsp;kháng:</strong></p><p>-&nbsp;Giờ&nbsp;bay&nbsp;có&nbsp;thể&nbsp;thay&nbsp;đổi&nbsp;theo&nbsp;hãng&nbsp;hàng&nbsp;không.</p><p>-&nbsp;Trong&nbsp;các&nbsp;tình&nbsp;huống&nbsp;ngoài&nbsp;khả&nbsp;năng&nbsp;kiểm&nbsp;soát&nbsp;như&nbsp;thời&nbsp;tiết,&nbsp;thiên&nbsp;tai,&nbsp;dịch&nbsp;bệnh,&nbsp;sự&nbsp;cố&nbsp;an&nbsp;ninh,&nbsp;chiến&nbsp;tranh,&nbsp;sân&nbsp;bay&nbsp;đóng&nbsp;cửa&nbsp;hoặc&nbsp;thay&nbsp;đổi&nbsp;từ&nbsp;đơn&nbsp;vị&nbsp;vận&nbsp;chuyển,&nbsp;…&nbsp;lịch&nbsp;trình&nbsp;có&nbsp;thể&nbsp;được&nbsp;điều&nbsp;chỉnh&nbsp;để&nbsp;đảm&nbsp;bảo&nbsp;an&nbsp;toàn&nbsp;và&nbsp;quyền&nbsp;lợi&nbsp;cho&nbsp;Quý&nbsp;khách.&nbsp;Công&nbsp;ty&nbsp;sẽ&nbsp;nỗ&nbsp;lực&nbsp;tối&nbsp;đa&nbsp;để&nbsp;hỗ&nbsp;trợ&nbsp;và&nbsp;phối&nbsp;hợp&nbsp;cùng&nbsp;Quý&nbsp;khách&nbsp;xử&nbsp;lý&nbsp;phát&nbsp;sinh.&nbsp;Tuy&nbsp;nhiên,&nbsp;các&nbsp;chi&nbsp;phí&nbsp;liên&nbsp;quan&nbsp;như&nbsp;ăn&nbsp;uống,&nbsp;đi&nbsp;lại,&nbsp;lưu&nbsp;trú,&nbsp;đổi/đặt&nbsp;lại&nbsp;vé&nbsp;…&nbsp;(nếu&nbsp;có)&nbsp;Quý&nbsp;khách&nbsp;vui&nbsp;lòng&nbsp;thanh&nbsp;toán&nbsp;theo&nbsp;thực&nbsp;tế.&nbsp;Công&nbsp;ty&nbsp;sẽ&nbsp;đồng&nbsp;hành&nbsp;và&nbsp;hỗ&nbsp;trợ&nbsp;để&nbsp;Quý&nbsp;khách&nbsp;có&nbsp;phương&nbsp;án&nbsp;phù&nbsp;hợp&nbsp;và&nbsp;thuận&nbsp;tiện&nbsp;nhất.</p><p>Hướng&nbsp;dẫn&nbsp;viên</p><p>-&nbsp;Hướng&nbsp;Dẫn&nbsp;Viên&nbsp;(HDV)&nbsp;sẽ&nbsp;liên&nbsp;lạc&nbsp;với&nbsp;Quý&nbsp;Khách&nbsp;khoảng&nbsp;2&nbsp;ngày&nbsp;trước&nbsp;khi&nbsp;khởi&nbsp;hành&nbsp;để&nbsp;sắp&nbsp;xếp&nbsp;giờ&nbsp;đón&nbsp;và&nbsp;cung&nbsp;cấp&nbsp;các&nbsp;thông&nbsp;tin&nbsp;cần&nbsp;thiết&nbsp;cho&nbsp;chuyển&nbsp;đi.</p>', '<p>Không&nbsp;có</p>', 3, 3, '/uploads/banners/banner-1774264639505-576996427.webp', 'promotion', 'active');

-- Dumping structure for table db_marketing_tour.tour_departures
DROP TABLE IF EXISTS `tour_departures`;
CREATE TABLE IF NOT EXISTS `tour_departures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL,
  `departure_date` date NOT NULL COMMENT 'Ngày khởi hành',
  `price_adult` decimal(15,2) NOT NULL COMMENT 'Giá người lớn',
  `original_price_adult` decimal(15,2) DEFAULT NULL COMMENT 'Giá gốc người lớn trước khi giảm',
  `price_child` decimal(15,2) DEFAULT 0.00 COMMENT 'Giá trẻ em',
  `price_infant` decimal(15,2) DEFAULT 0.00 COMMENT 'Giá em bé/trẻ nhỏ',
  `capacity` int(11) NOT NULL DEFAULT 0 COMMENT 'Tổng số chỗ có thể bán',
  `available_seats` int(11) NOT NULL DEFAULT 0 COMMENT 'Số chỗ còn có thể bán',
  `status` enum('open','full','cancelled') DEFAULT 'open' COMMENT 'Trạng thái mở bán',
  `flight` varchar(255) DEFAULT NULL COMMENT 'Chặng bay / thông tin chuyến bay',
  `flight_outbound` text DEFAULT NULL COMMENT 'Thông tin chuyến bay chặng đi',
  `flight_inbound` text DEFAULT NULL COMMENT 'Thông tin chuyến bay chặng về',
  PRIMARY KEY (`id`),
  KEY `tour_id` (`tour_id`),
  CONSTRAINT `tour_d` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.tour_departures: ~22 rows (approximately)
DELETE FROM `tour_departures`;
INSERT INTO `tour_departures` (`id`, `tour_id`, `departure_date`, `price_adult`, `original_price_adult`, `price_child`, `price_infant`, `capacity`, `available_seats`, `status`, `flight`, `flight_outbound`, `flight_inbound`) VALUES
	(1, 1, '2026-12-01', 3500000.00, 10000000.00, 2500000.00, 500000.00, 23, 20, 'open', NULL, NULL, NULL),
	(2, 1, '2026-12-10', 3600000.00, 10000000.00, 2600000.00, 500000.00, 16, 15, 'open', NULL, NULL, NULL),
	(3, 2, '2026-12-03', 5500000.00, 10000000.00, 4000000.00, 800000.00, 26, 26, 'open', NULL, NULL, NULL),
	(4, 2, '2026-12-15', 5700000.00, 10000000.00, 4200000.00, 800000.00, 12, 10, 'full', NULL, NULL, NULL),
	(5, 3, '2026-12-05', 4500000.00, 10000000.00, 3200000.00, 600000.00, 33, 30, 'open', NULL, NULL, NULL),
	(6, 3, '2026-12-20', 4600000.00, 10000000.00, 3300000.00, 600000.00, 7, 5, 'open', NULL, NULL, NULL),
	(7, 4, '2026-12-07', 7000000.00, 10000000.00, 5000000.00, 1000000.00, 14, 14, 'open', NULL, NULL, NULL),
	(8, 4, '2026-12-25', 7200000.00, 10000000.00, 5200000.00, 1000000.00, 0, 0, 'full', NULL, NULL, NULL),
	(9, 5, '2026-12-08', 4800000.00, 10000000.00, 3500000.00, 700000.00, 21, 21, 'open', NULL, NULL, NULL),
	(10, 5, '2026-12-28', 4900000.00, 10000000.00, 3600000.00, 700000.00, 9, 6, 'open', NULL, NULL, NULL),
	(11, 6, '2027-01-01', 4500000.00, 10000000.00, 3200000.00, 600000.00, 23, 20, 'open', NULL, NULL, NULL),
	(12, 6, '2027-01-10', 4600000.00, 10000000.00, 3300000.00, 600000.00, 12, 10, 'open', NULL, NULL, NULL),
	(13, 7, '2027-01-03', 8000000.00, 10000000.00, 6000000.00, 1200000.00, 16, 15, 'open', NULL, NULL, NULL),
	(14, 7, '2027-01-18', 8200000.00, 10000000.00, 6200000.00, 1200000.00, 1, 0, 'full', NULL, NULL, NULL),
	(15, 8, '2027-01-05', 3500000.00, 10000000.00, 2500000.00, 500000.00, 28, 25, 'open', NULL, NULL, NULL),
	(16, 8, '2027-01-20', 3600000.00, 10000000.00, 2600000.00, 500000.00, 11, 8, 'open', NULL, NULL, NULL),
	(17, 9, '2027-01-07', 3700000.00, 10000000.00, 2700000.00, 500000.00, 35, 30, 'open', NULL, NULL, NULL),
	(18, 10, '2027-01-09', 5800000.00, 10000000.00, 4200000.00, 800000.00, 15, 12, 'open', NULL, NULL, NULL),
	(19, 11, '2027-01-12', 6000000.00, 10000000.00, 4500000.00, 900000.00, 23, 20, 'open', NULL, NULL, NULL),
	(20, 11, '2027-01-25', 6200000.00, 10000000.00, 4700000.00, 900000.00, 15, 0, 'full', NULL, NULL, NULL),
	(62, 13, '2026-11-15', 10000000.00, 20000000.00, 1000000.00, 500000.00, 10, 10, 'open', NULL, NULL, NULL),
	(63, 13, '2026-11-10', 400000000.00, 400000000.00, 2000000.00, 400000.00, 200, 200, 'open', NULL, NULL, NULL);

-- Dumping structure for table db_marketing_tour.tour_images
DROP TABLE IF EXISTS `tour_images`;
CREATE TABLE IF NOT EXISTS `tour_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL,
  `image_url` text NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `tour_id` (`tour_id`),
  CONSTRAINT `fk_tour_images` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.tour_images: ~21 rows (approximately)
DELETE FROM `tour_images`;
INSERT INTO `tour_images` (`id`, `tour_id`, `image_url`, `sort_order`) VALUES
	(1, 1, '/uploads/banners/banner-1774264639505-576996427.webp', 1),
	(2, 1, '/uploads/banners/banner-1774264639505-576996427.webp', 2),
	(3, 2, '/uploads/banners/banner-1774264639505-576996427.webp', 1),
	(4, 2, '/uploads/banners/banner-1774264639505-576996427.webp', 2),
	(5, 3, '/uploads/banners/banner-1774264639505-576996427.webp', 1),
	(6, 3, '/uploads/banners/banner-1774264639505-576996427.webp', 2),
	(7, 4, '/uploads/banners/banner-1774264639505-576996427.webp', 1),
	(8, 4, '/uploads/banners/banner-1774264639505-576996427.webp', 2),
	(9, 5, '/uploads/banners/banner-1774264639505-576996427.webp', 1),
	(10, 5, '/uploads/banners/banner-1774264639505-576996427.webp', 2),
	(11, 6, '/uploads/banners/banner-1774264639505-576996427.webp', 1),
	(12, 6, '/uploads/banners/banner-1774264639505-576996427.webp', 2),
	(13, 7, '/uploads/banners/banner-1774264639505-576996427.webp', 1),
	(14, 7, '/uploads/banners/banner-1774264639505-576996427.webp', 2),
	(15, 8, '/uploads/banners/banner-1774264639505-576996427.webp', 1),
	(16, 8, '/uploads/banners/banner-1774264639505-576996427.webp', 2),
	(17, 9, '/uploads/banners/banner-1774264639505-576996427.webp', 1),
	(18, 10, '/uploads/banners/banner-1774264639505-576996427.webp', 1),
	(19, 11, '/uploads/banners/banner-1774264639505-576996427.webp', 1),
	(20, 11, '/uploads/banners/banner-1774264639505-576996427.webp', 2),
	(40, 13, '/uploads/tours/tour-1794625493380-521819701.JPEG', 0);

-- Dumping structure for table db_marketing_tour.tour_itineraries
DROP TABLE IF EXISTS `tour_itineraries`;
CREATE TABLE IF NOT EXISTS `tour_itineraries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL,
  `day_number` int(11) NOT NULL COMMENT 'Ngày thứ mấy (1, 2, 3...)',
  `title` text NOT NULL COMMENT 'Tiêu đề (VD: Ngày 1: Đón khách - Tham quan)',
  `content` longtext NOT NULL COMMENT 'Chi tiết các hoạt động trong ngày',
  PRIMARY KEY (`id`),
  KEY `tour_id` (`tour_id`),
  CONSTRAINT `fk_tour_it` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.tour_itineraries: ~23 rows (approximately)
DELETE FROM `tour_itineraries`;
INSERT INTO `tour_itineraries` (`id`, `tour_id`, `day_number`, `title`, `content`) VALUES
	(1, 1, 1, 'Ngày 1: Hà Nội - Sapa', 'Di chuyển, nhận phòng, tham quan bản Cát Cát'),
	(2, 1, 2, 'Ngày 2: Fansipan', 'Chinh phục Fansipan bằng cáp treo'),
	(3, 2, 1, 'Ngày 1: TP.HCM - Phú Quốc', 'Bay và nhận khách sạn'),
	(4, 2, 2, 'Ngày 2: Hòn Thơm', 'Đi cáp treo và vui chơi'),
	(5, 3, 1, 'Ngày 1: Đà Nẵng', 'Tham quan biển Mỹ Khê'),
	(6, 3, 2, 'Ngày 2: Bà Nà Hills', 'Checkin Cầu Vàng'),
	(7, 4, 1, 'Ngày 1: Quốc tế', 'Bay đi nước ngoài'),
	(8, 4, 2, 'Ngày 2: City tour', 'Tham quan trung tâm'),
	(9, 5, 1, 'Ngày 1: Hội An', 'Tham quan phố cổ'),
	(10, 5, 2, 'Ngày 2: Biển', 'Tắm biển'),
	(11, 6, 1, 'Ngày 1: Check-in', 'Nhận phòng'),
	(12, 6, 2, 'Ngày 2: Tham quan', 'Đi tour'),
	(13, 7, 1, 'Ngày 1: Khởi hành', 'Bay quốc tế'),
	(14, 7, 2, 'Ngày 2: City', 'Tham quan'),
	(15, 8, 1, 'Ngày 1: Sapa', 'Nhận phòng'),
	(16, 8, 2, 'Ngày 2: Fansipan', 'Leo núi'),
	(17, 9, 1, 'Ngày 1: Di chuyển', 'Check-in'),
	(18, 10, 1, 'Ngày 1: Phú Quốc', 'Tắm biển'),
	(19, 11, 1, 'Ngày 1: Resort', 'Nghỉ dưỡng'),
	(20, 11, 2, 'Ngày 2: Vui chơi', 'VinWonders'),
	(148, 13, 1, 'Đón khách ăn tối', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">12:30&nbsp;Quý&nbsp;khách&nbsp;tập&nbsp;trung&nbsp;tại&nbsp;Ga&nbsp;Quốc&nbsp;tế&nbsp;Sân&nbsp;bay&nbsp;Tân&nbsp;Sơn&nbsp;Nhất&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;hàng&nbsp;không&nbsp;khởi&nbsp;hành&nbsp;đi&nbsp;Malaysia.&nbsp;Chuyến&nbsp;bay:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">VN679&nbsp;SGN-KUL&nbsp;15:50&nbsp;-&nbsp;18:50.</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Tới&nbsp;Sân&nbsp;bay&nbsp;Quốc&nbsp;tế&nbsp;Kuala&nbsp;Lumpur,&nbsp;Quý&nbsp;khách&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;nhập&nbsp;cảnh&nbsp;Malaysia.&nbsp;Đoàn&nbsp;di&nbsp;chuyển&nbsp;đến&nbsp;nhà&nbsp;hàng&nbsp;dùng&nbsp;bữa&nbsp;tối.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Sau&nbsp;bữa&nbsp;tối,&nbsp;đoàn&nbsp;trở&nbsp;về&nbsp;khách&nbsp;sạn&nbsp;nhận&nbsp;phòng&nbsp;nghỉ&nbsp;ngơi.</span></p>'),
	(149, 13, 2, 'Tham quan', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Sáng:&nbsp;Quý&nbsp;khách&nbsp;dùng&nbsp;điểm&nbsp;tâm&nbsp;tại&nbsp;khách&nbsp;sạn.&nbsp;Đoàn&nbsp;tham&nbsp;quan</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Khu&nbsp;Putrajaya</strong><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">:&nbsp;Trung&nbsp;tâm&nbsp;hành&nbsp;chính&nbsp;mới&nbsp;của&nbsp;Malaysia&nbsp;&nbsp;với&nbsp;những&nbsp;địa&nbsp;danh&nbsp;du&nbsp;lịch&nbsp;nổi&nbsp;tiếng&nbsp;như:&nbsp;Nhà&nbsp;thờ&nbsp;Hồi&nbsp;giáo&nbsp;Putra,&nbsp;Văn&nbsp;phòng&nbsp;Thủ&nbsp;tướng,&nbsp;Trung&nbsp;tâm&nbsp;hội&nbsp;nghị&nbsp;(chụp&nbsp;hình&nbsp;bên&nbsp;ngoài).</span></p>'),
	(150, 13, 3, 'Chuẩn bị về', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Sáng:&nbsp;Quý&nbsp;khách&nbsp;dùng&nbsp;điểm&nbsp;tâm&nbsp;sáng&nbsp;tại&nbsp;khách&nbsp;sạn&nbsp;và&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;trả&nbsp;phòng.&nbsp;Đoàn&nbsp;tham&nbsp;quan</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Tháp&nbsp;Đôi&nbsp;Petronas</strong><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">:&nbsp;Biểu&nbsp;tượng&nbsp;hiện&nbsp;đại&nbsp;của&nbsp;Kuala&nbsp;Lumpur,&nbsp;nổi&nbsp;bật&nbsp;với&nbsp;kiến&nbsp;trúc&nbsp;tinh&nbsp;xảo&nbsp;và&nbsp;tầm&nbsp;nhìn&nbsp;toàn&nbsp;cảnh&nbsp;thành&nbsp;phố.&nbsp;Đây&nbsp;là&nbsp;niềm&nbsp;tự&nbsp;hào&nbsp;của&nbsp;người&nbsp;dân&nbsp;Malaysia&nbsp;được&nbsp;hoàn&nbsp;thành&nbsp;năm&nbsp;1998&nbsp;với&nbsp;tổng&nbsp;chiều&nbsp;cao&nbsp;452m&nbsp;và&nbsp;88&nbsp;tầng.</span></p>');

-- Dumping structure for table db_marketing_tour.tour_itinerary_translations
DROP TABLE IF EXISTS `tour_itinerary_translations`;
CREATE TABLE IF NOT EXISTS `tour_itinerary_translations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `itinerary_id` int(11) NOT NULL,
  `language` varchar(10) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tour_itinerary_translations_itinerary_id_language` (`itinerary_id`,`language`),
  CONSTRAINT `fk_tour_itinerary_translations_itinerary` FOREIGN KEY (`itinerary_id`) REFERENCES `tour_itineraries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=174 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.tour_itinerary_translations: ~26 rows (approximately)
DELETE FROM `tour_itinerary_translations`;
INSERT INTO `tour_itinerary_translations` (`id`, `itinerary_id`, `language`, `title`, `content`) VALUES
	(1, 1, 'vi', 'Ngày 1: Hà Nội - Sapa', 'Di chuyển, nhận phòng, tham quan bản Cát Cát'),
	(2, 2, 'vi', 'Ngày 2: Fansipan', 'Chinh phục Fansipan bằng cáp treo'),
	(3, 3, 'vi', 'Ngày 1: TP.HCM - Phú Quốc', 'Bay và nhận khách sạn'),
	(4, 4, 'vi', 'Ngày 2: Hòn Thơm', 'Đi cáp treo và vui chơi'),
	(5, 5, 'vi', 'Ngày 1: Đà Nẵng', 'Tham quan biển Mỹ Khê'),
	(6, 6, 'vi', 'Ngày 2: Bà Nà Hills', 'Checkin Cầu Vàng'),
	(7, 7, 'vi', 'Ngày 1: Quốc tế', 'Bay đi nước ngoài'),
	(8, 8, 'vi', 'Ngày 2: City tour', 'Tham quan trung tâm'),
	(9, 9, 'vi', 'Ngày 1: Hội An', 'Tham quan phố cổ'),
	(10, 10, 'vi', 'Ngày 2: Biển', 'Tắm biển'),
	(11, 11, 'vi', 'Ngày 1: Check-in', 'Nhận phòng'),
	(12, 12, 'vi', 'Ngày 2: Tham quan', 'Đi tour'),
	(13, 13, 'vi', 'Ngày 1: Khởi hành', 'Bay quốc tế'),
	(14, 14, 'vi', 'Ngày 2: City', 'Tham quan'),
	(15, 15, 'vi', 'Ngày 1: Sapa', 'Nhận phòng'),
	(16, 16, 'vi', 'Ngày 2: Fansipan', 'Leo núi'),
	(17, 17, 'vi', 'Ngày 1: Di chuyển', 'Check-in'),
	(18, 18, 'vi', 'Ngày 1: Phú Quốc', 'Tắm biển'),
	(19, 19, 'vi', 'Ngày 1: Resort', 'Nghỉ dưỡng'),
	(20, 20, 'vi', 'Ngày 2: Vui chơi', 'VinWonders'),
	(168, 148, 'en', 'Welcoming guests for dinner', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">12:30 You gather at the International Terminal Tan Son Nhat Airport to check-in for airline departure to Malaysia. Flight:</span><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">VN679 SGN-KUL 15:50 - 18:50.</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Arrive at Kuala Lumpur International Airport, you go through Malaysia entry procedures. The group moved to the restaurant for dinner.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">After dinner, the group returned to the hotel to check-in to rest.</span></p>'),
	(169, 148, 'zh', '招待客人共进晚餐', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">12:30 您在新山一机场国际航站楼集合，办理登机手续，搭乘飞往马来西亚的航班。 航班：</span><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">VN679 SGN-KUL 15:50 - 18:50。</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">到达吉隆坡国际机场，办理马来西亚入境手续。 一行人前往餐厅用晚餐。</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">晚餐后，一行人返回酒店入住休息。</span></p>'),
	(170, 149, 'en', 'Sightseeing', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Morning: You have breakfast at the hotel. Group visit</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Putrajaya Area</strong><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">: The new administrative centre of Malaysia  with famous tourist landmarks such as: Putra Mosque, Prime Minister\'s Office, Conference Centre (exterior photography).</span></p>'),
	(171, 149, 'zh', '观光', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">早上：您在酒店享用早餐。 团体参观</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">布城地区</strong><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">：马来西亚的新行政中心，拥有著名的旅游地标，例如：布特拉清真寺、总理办公室、会议中心（外观摄影）。</span></p>'),
	(172, 150, 'en', 'Prepare to return', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Morning: You have breakfast at the hotel and check-out procedures. Group visit</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Petronas Twin Towers</strong><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">: The modern icon of Kuala Lumpur, distinguished with its exquisite architecture and panoramic views of the city. This is the pride of Malaysians completed in 1998 with a total height of 452m and 88 storeys.</span></p>'),
	(173, 150, 'zh', '准备返回', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">早上：您在酒店享用早餐并办理退房手续。 团体参观</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">双子塔</strong><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">：吉隆坡的现代标志，以其精致的建筑和城市全景而闻名。 这是马来西亚人的骄傲，于 1998 年竣工，总高度 452m，88 层。</span></p>');

-- Dumping structure for table db_marketing_tour.tour_options
DROP TABLE IF EXISTS `tour_options`;
CREATE TABLE IF NOT EXISTS `tour_options` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL,
  `option_name` varchar(255) NOT NULL COMMENT 'Tên option (VD: Yêu cầu giường đôi, Phụ thu phòng đơn)',
  `price` decimal(15,2) DEFAULT 0.00 COMMENT 'Giá cộng thêm (có thể = 0)',
  `charge_type` enum('per_person','per_booking','quantity') DEFAULT 'quantity' COMMENT 'Cách tính: theo người, theo đơn, hoặc tự chọn số lượng',
  PRIMARY KEY (`id`),
  KEY `tour_id` (`tour_id`),
  CONSTRAINT `fk_tour_op` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.tour_options: ~21 rows (approximately)
DELETE FROM `tour_options`;
INSERT INTO `tour_options` (`id`, `tour_id`, `option_name`, `price`, `charge_type`) VALUES
	(1, 1, 'Phòng đơn', 500000.00, 'per_person'),
	(2, 1, 'Ăn VIP', 300000.00, 'per_person'),
	(3, 2, 'Xe đưa đón sân bay', 200000.00, 'per_booking'),
	(4, 2, 'Tour cano', 700000.00, 'per_person'),
	(5, 3, 'Buffet tối', 400000.00, 'per_person'),
	(6, 3, 'Xe riêng', 1000000.00, 'per_booking'),
	(7, 4, 'Visa', 2000000.00, 'per_person'),
	(8, 4, 'Bảo hiểm', 300000.00, 'per_person'),
	(9, 5, 'Ăn hải sản', 500000.00, 'per_person'),
	(10, 5, 'Thuê xe máy', 150000.00, 'quantity'),
	(11, 6, 'Spa', 600000.00, 'per_person'),
	(12, 6, 'Massage', 500000.00, 'per_person'),
	(13, 7, 'Guide riêng', 2000000.00, 'per_booking'),
	(14, 7, 'VIP lounge', 800000.00, 'per_person'),
	(15, 8, 'Leo Fansipan', 800000.00, 'per_person'),
	(16, 8, 'Xe jeep', 300000.00, 'quantity'),
	(17, 9, 'Thuê đồ trekking', 200000.00, 'quantity'),
	(18, 10, 'Lặn biển', 1000000.00, 'per_person'),
	(19, 11, 'Golf', 2000000.00, 'per_person'),
	(20, 11, 'Ăn tối BBQ', 600000.00, 'per_person'),
	(37, 13, 'Phòng đôi', 1000000.00, 'per_person');

-- Dumping structure for table db_marketing_tour.tour_pickup_locations
DROP TABLE IF EXISTS `tour_pickup_locations`;
CREATE TABLE IF NOT EXISTS `tour_pickup_locations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL,
  `location_name` varchar(255) NOT NULL COMMENT 'Tên điểm đón hoặc khu vực',
  `pickup_time` time DEFAULT NULL COMMENT 'Giờ đón dự kiến',
  `surcharge_amount` decimal(15,2) DEFAULT 0.00 COMMENT 'Phí phụ thu nếu có (mặc định 0)',
  PRIMARY KEY (`id`),
  KEY `tour_id` (`tour_id`),
  CONSTRAINT `fk_piclkup_location` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.tour_pickup_locations: ~23 rows (approximately)
DELETE FROM `tour_pickup_locations`;
INSERT INTO `tour_pickup_locations` (`id`, `tour_id`, `location_name`, `pickup_time`, `surcharge_amount`) VALUES
	(1, 1, 'Hà Nội', '06:00:00', 0.00),
	(2, 1, 'Sân bay Nội Bài', '07:00:00', 100000.00),
	(3, 2, 'TP.HCM', '05:00:00', 0.00),
	(4, 2, 'Sân bay Tân Sơn Nhất', '06:00:00', 100000.00),
	(5, 3, 'Đà Nẵng', '06:30:00', 0.00),
	(6, 3, 'Khách sạn', '07:00:00', 50000.00),
	(7, 4, 'Hà Nội', '08:00:00', 0.00),
	(8, 5, 'Hội An', '06:00:00', 0.00),
	(9, 6, 'Đà Nẵng', '06:00:00', 0.00),
	(10, 7, 'TP.HCM', '05:30:00', 0.00),
	(11, 8, 'Hà Nội', '06:00:00', 0.00),
	(12, 9, 'Sapa', '07:00:00', 0.00),
	(13, 10, 'Phú Quốc', '06:00:00', 0.00),
	(14, 11, 'Phú Quốc', '06:30:00', 0.00),
	(15, 2, 'Quận 1', '05:30:00', 50000.00),
	(16, 3, 'Quận Hải Châu', '06:00:00', 0.00),
	(17, 4, 'Quận Ba Đình', '06:00:00', 0.00),
	(18, 5, 'Biển An Bàng', '07:00:00', 0.00),
	(19, 6, 'Ngũ Hành Sơn', '06:00:00', 0.00),
	(20, 7, 'Quận 7', '05:30:00', 0.00),
	(101, 13, 'Hà Nội', '19:05:00', 1111.00),
	(102, 13, 'Bắc Giang', '21:05:00', 200000.00),
	(103, 13, 'Sài Gòn', '09:50:00', 100000.00);

-- Dumping structure for table db_marketing_tour.tour_translations
DROP TABLE IF EXISTS `tour_translations`;
CREATE TABLE IF NOT EXISTS `tour_translations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL,
  `language` varchar(10) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `summary` text DEFAULT NULL,
  `highlights` text DEFAULT NULL,
  `price_includes` text DEFAULT NULL,
  `price_excludes` text DEFAULT NULL,
  `terms_and_notes` text DEFAULT NULL,
  `cancellation_policy` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tour_translations_tour_id_language` (`tour_id`,`language`),
  CONSTRAINT `fk_tour_translations_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.tour_translations: ~19 rows (approximately)
DELETE FROM `tour_translations`;
INSERT INTO `tour_translations` (`id`, `tour_id`, `language`, `title`, `slug`, `summary`, `highlights`, `price_includes`, `price_excludes`, `terms_and_notes`, `cancellation_policy`) VALUES
	(1, 1, 'vi', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 3', 'tour-kham-pha-sapa-chinh-phuc-fansipan', 'Hành trình đến với thị trấn trong sương, khám phá bản Cát Cát và chinh phục nóc nhà Đông Dương.', NULL, NULL, NULL, NULL, NULL),
	(2, 2, 'vi', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 1', 'nghi-duong-phu-quoc-hon-thom', 'Tận hưởng nắng vàng biển xanh tại đảo ngọc Phú Quốc, đi cáp treo vượt biển dài nhất thế giới.', NULL, NULL, NULL, NULL, NULL),
	(3, 3, 'vi', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 1', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL),
	(4, 4, 'vi', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 2', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na1', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL),
	(5, 5, 'vi', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 3', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na2', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL),
	(6, 6, 'vi', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 4', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na3', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL),
	(7, 7, 'vi', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 5', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na4', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL),
	(8, 8, 'vi', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1', 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 'Hành trình đến với thị trấn trong sương, khám phá bản Cát Cát và chinh phục nóc nhà Đông Dương.', NULL, NULL, NULL, NULL, NULL),
	(9, 9, 'vi', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 2', 'tour-kham-pha-sapa-chinh-phuc-fansipan2', 'Hành trình đến với thị trấn trong sương, khám phá bản Cát Cát và chinh phục nóc nhà Đông Dương.', NULL, NULL, NULL, NULL, NULL),
	(10, 10, 'vi', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 2', 'nghi-duong-phu-quoc-hon-thom1', 'Tận hưởng nắng vàng biển xanh tại đảo ngọc Phú Quốc, đi cáp treo vượt biển dài nhất thế giới.', NULL, NULL, NULL, NULL, NULL),
	(11, 11, 'vi', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 3', 'nghi-duong-phu-quoc-hon-thom2', 'Tận hưởng nắng vàng biển xanh tại đảo ngọc Phú Quốc, đi cáp treo vượt biển dài nhất thế giới.', NULL, NULL, NULL, NULL, NULL),
	(14, 13, 'en', 'Malaysia - Singapore 5D4N Tour: Explore Southeast Asian Culture', 'tour-malaysia-singapore-5n4d-kham-pha-van-hoa-dong-nam-a', 'Explore Gardens by the Bay: Singapore\'s iconic ecological garden.', 'Deposit 50% of the Tour amount immediately after registering for the tour. \nCancel after registration, deposit will be lost 50% of total tour value.\nCancel tour 10 – 15 days before departure will be penalized 80% of total contract value.\nCancel tour 9 The day before the departure date will be penalized 100% of the contract value.\nIn cases of arriving late and missing the trip, you will not refund the tour money.\nIn case p If you are refused to get a Chinese visa, please pay a non-refundable fee of 3,500,000 VND/person/set of rejected Chinese visa medicine (this cost includes costs that the company has paid such as translation, letters of guarantee, visa application fees, airline ticket deposits, services booking fees overseas...)', '<p><strong>Transportation</strong></p><p>-&nbsp;Round-trip&nbsp;airline&nbsp;ticket&nbsp;by&nbsp;Vietnam&nbsp;Airline&nbsp;(23kg&nbsp;checked&nbsp;luggage&nbsp;+&nbsp;10kg&nbsp;hand-carried).</p><p>-&nbsp;Air-conditioned&nbsp;vehicles&nbsp;serve&nbsp;during&nbsp;the&nbsp;route.</p><p>-&nbsp;Airport&nbsp;security&nbsp;fees,&nbsp;aviation&nbsp;insurance,&nbsp;airport&nbsp;taxes&nbsp;in&nbsp;2&nbsp;countries&nbsp;(according&nbsp;to&nbsp;rules&nbsp;y&nbsp;determined&nbsp;at&nbsp;the&nbsp;time&nbsp;of&nbsp;ticket&nbsp;issuance).</p><p><strong>Accommodation</strong></p><p>-&nbsp;Standard&nbsp;3-4*&nbsp;local&nbsp;hotel&nbsp;(2&nbsp;guests/room;&nbsp;Male/female&nbsp;individual&nbsp;customers&nbsp;can&nbsp;arrange&nbsp;suitable&nbsp;rooms).</p><p><strong>Other&nbsp;services</strong></p><p>-&nbsp;Sightseeing&nbsp;tickets&nbsp;in&nbsp;the&nbsp;program.&nbsp;</p><p>-&nbsp;Meals&nbsp;according&nbsp;to&nbsp;the&nbsp;program.&nbsp;(ensure&nbsp;equivalent&nbsp;quantity&nbsp;&amp;&nbsp;quality&nbsp;if&nbsp;adjustable).</p><p>-&nbsp;Spring&nbsp;water&nbsp;01&nbsp;bottle/person/day.</p><p>-&nbsp;International&nbsp;travel&nbsp;insurance.&nbsp;</p><p>-&nbsp;Group&nbsp;leader&nbsp;and&nbsp;local&nbsp;guide&nbsp;serve&nbsp;during&nbsp;the&nbsp;journey.</p><p>-&nbsp;Gifted&nbsp;tourist&nbsp;hats.&nbsp;</p><p>-&nbsp;VAT.</p>', '<p>-&nbsp;Single&nbsp;room&nbsp;surcharge&nbsp;(if&nbsp;any):&nbsp;4,300,000&nbsp;VND/person/tour&nbsp;–&nbsp;4,800,000&nbsp;VND/person/tour.&nbsp;</p><p>-&nbsp;Tips&nbsp;for&nbsp;driver&nbsp;and&nbsp;guide:&nbsp;25&nbsp;USD/person/tour.</p><p>-&nbsp;Surcharge&nbsp;for&nbsp;customers&nbsp;of&nbsp;foreign&nbsp;nationality:&nbsp;660,000&nbsp;VND/person.</p><p>-&nbsp;Visa&nbsp;to&nbsp;re-enter&nbsp;Vietnam&nbsp;o&nbsp;foreign&nbsp;national&nbsp;guests&nbsp;according&nbsp;to&nbsp;current&nbsp;regulations&nbsp;(if&nbsp;any).</p><p>-&nbsp;Personal&nbsp;expenses:&nbsp;excess&nbsp;luggage,&nbsp;telephone,&nbsp;laundry,&nbsp;sightseeing,&nbsp;spending&nbsp;outside&nbsp;the&nbsp;program.</p>', '<p>Children&nbsp;policy</p><p><strong>1.&nbsp;General&nbsp;rules:</strong></p><p>-&nbsp;Each&nbsp;02&nbsp;adults&nbsp;can&nbsp;accompany&nbsp;01&nbsp;child.</p><p>-&nbsp;From&nbsp;the&nbsp;2nd&nbsp;child&nbsp;onwards,&nbsp;applicable&nbsp;Use&nbsp;the&nbsp;price&nbsp;according&nbsp;to&nbsp;the&nbsp;regulations&nbsp;for&nbsp;each&nbsp;age&nbsp;group&nbsp;(stated&nbsp;below).</p><p>-&nbsp;Children&nbsp;sleep&nbsp;in&nbsp;the&nbsp;bed&nbsp;with&nbsp;their&nbsp;parents.&nbsp;→&nbsp;If&nbsp;a&nbsp;own&nbsp;bed&nbsp;is&nbsp;needed:&nbsp;Charged&nbsp;as&nbsp;an&nbsp;adult.</p><p>-&nbsp;Expenses&nbsp;outside&nbsp;the&nbsp;program&nbsp;(if&nbsp;any)&nbsp;are&nbsp;paid&nbsp;by&nbsp;the&nbsp;family.</p><p><strong>2.&nbsp;Regulations&nbsp;by&nbsp;age:</strong></p><p>-&nbsp;Children&nbsp;under&nbsp;2&nbsp;years&nbsp;old:&nbsp;Prices&nbsp;as&nbsp;on&nbsp;the&nbsp;website,&nbsp;included&nbsp;airline&nbsp;tickets,&nbsp;no&nbsp;seats&nbsp;alone,&nbsp;sleeping&nbsp;with&nbsp;parents.</p><p>-&nbsp;Children&nbsp;from&nbsp;2&nbsp;-&nbsp;10&nbsp;years&nbsp;old:&nbsp;Prices&nbsp;as&nbsp;on&nbsp;the&nbsp;website,&nbsp;includes&nbsp;full&nbsp;services&nbsp;in&nbsp;the&nbsp;program.&nbsp;Sleeping&nbsp;with&nbsp;parents.&nbsp;From&nbsp;2nd&nbsp;child&nbsp;onwards:&nbsp;charged&nbsp;100%&nbsp;of&nbsp;adult&nbsp;price.</p><p>-&nbsp;Children&nbsp;from&nbsp;11&nbsp;years&nbsp;old&nbsp;and&nbsp;over:&nbsp;charged&nbsp;as&nbsp;adults.</p><p>-&nbsp;In&nbsp;case&nbsp;there&nbsp;is&nbsp;only&nbsp;1&nbsp;guest&nbsp;(adult)&nbsp;traveling&nbsp;with&nbsp;1&nbsp;child&nbsp;(under&nbsp;12&nbsp;years&nbsp;old),&nbsp;the&nbsp;child&nbsp;is&nbsp;charged&nbsp;the&nbsp;adult&nbsp;ticket&nbsp;price&nbsp;large&nbsp;to&nbsp;ensure&nbsp;services&nbsp;according&nbsp;to&nbsp;regulations.</p><p><strong>ID&nbsp;documents&nbsp;when&nbsp;joining&nbsp;the&nbsp;tour</strong></p><p>-&nbsp;Household&nbsp;Original&nbsp;passport&nbsp;and&nbsp;necessary&nbsp;documents.</p><p>-&nbsp;Children&nbsp;under&nbsp;14&nbsp;years&nbsp;old&nbsp;are&nbsp;required&nbsp;to&nbsp;bring&nbsp;birth&nbsp;certificate.&nbsp;</p><p>-&nbsp;Children&nbsp;need&nbsp;to&nbsp;be&nbsp;accompanied&nbsp;by&nbsp;parents&nbsp;or&nbsp;relatives&nbsp;over&nbsp;18&nbsp;years&nbsp;old;&nbsp;In&nbsp;case&nbsp;of&nbsp;traveling&nbsp;with&nbsp;relatives,&nbsp;a&nbsp;valid&nbsp;authorization&nbsp;is&nbsp;required.</p><p>Cancellation&nbsp;&amp;&nbsp;change&nbsp;policy</p><p>-&nbsp;From&nbsp;the&nbsp;time&nbsp;of&nbsp;posting&nbsp;Signed&nbsp;up&nbsp;to&nbsp;30&nbsp;days&nbsp;of&nbsp;departure:&nbsp;Cancellation&nbsp;fee&nbsp;50%&nbsp;of&nbsp;deposit.</p><p>-&nbsp;From&nbsp;15&nbsp;before&nbsp;departure&nbsp;date:&nbsp;Cancellation&nbsp;fee&nbsp;70%&nbsp;of&nbsp;total&nbsp;tour&nbsp;price.&nbsp;</p><p>-&nbsp;After&nbsp;the&nbsp;above&nbsp;time:&nbsp;Cancellation&nbsp;fee&nbsp;100%&nbsp;of&nbsp;total&nbsp;tour&nbsp;price.</p><p>-&nbsp;Tour&nbsp;cancellation/change&nbsp;time&nbsp;is&nbsp;recorded&nbsp;in&nbsp;business&nbsp;hours&nbsp;and&nbsp;calculated&nbsp;on&nbsp;business&nbsp;day&nbsp;(excluding&nbsp;Saturday,&nbsp;Sunday&nbsp;and&nbsp;Holidays/Tet).&nbsp;Requests&nbsp;submitted&nbsp;outside&nbsp;business&nbsp;hours&nbsp;will&nbsp;be&nbsp;counted&nbsp;from&nbsp;the&nbsp;beginning&nbsp;of&nbsp;business&nbsp;hours&nbsp;of&nbsp;the&nbsp;next&nbsp;day.</p><p>-&nbsp;Please&nbsp;send&nbsp;a&nbsp;cancellation&nbsp;request&nbsp;via&nbsp;email&nbsp;or&nbsp;the&nbsp;company&#39;s&nbsp;official&nbsp;contact&nbsp;channel&nbsp;to&nbsp;be&nbsp;recorded.&nbsp;Telephone&nbsp;notification&nbsp;will&nbsp;not&nbsp;be&nbsp;considered&nbsp;a&nbsp;basis&nbsp;for&nbsp;cancellation&nbsp;policy.</p><p>Visa&nbsp;Information</p><p>-&nbsp;Visa&nbsp;exemption&nbsp;for&nbsp;The&nbsp;customer&nbsp;holds&nbsp;Vietnamese&nbsp;nationality.</p><p>-&nbsp;Passport&nbsp;intact&nbsp;and&nbsp;still&nbsp;valid&nbsp;6&nbsp;months&nbsp;from&nbsp;the&nbsp;end&nbsp;date&nbsp;of&nbsp;the&nbsp;tour.&nbsp;</p><p><strong>Note&nbsp;about&nbsp;residency&nbsp;status</strong></p><p>-&nbsp;You&nbsp;hold&nbsp;dual&nbsp;nationality,&nbsp;Travel&nbsp;Document&nbsp;or&nbsp;residency&nbsp;status&nbsp;please&nbsp;inform&nbsp;when&nbsp;registering&nbsp;and&nbsp;provide&nbsp;full&nbsp;relevant&nbsp;documents.</p><p>-&nbsp;Guests&nbsp;only&nbsp;have&nbsp;a&nbsp;green&nbsp;card&nbsp;but&nbsp;not&nbsp;A&nbsp;valid&nbsp;Vietnamese&nbsp;passport&nbsp;will&nbsp;not&nbsp;be&nbsp;eligible&nbsp;to&nbsp;register&nbsp;for&nbsp;a&nbsp;tour&nbsp;to&nbsp;a&nbsp;third&nbsp;country.</p><p>-&nbsp;Guests&nbsp;are&nbsp;overseas&nbsp;Vietnamese&nbsp;or&nbsp;nationals&nbsp;c&nbsp;foreign&nbsp;nationals&nbsp;with&nbsp;visas&nbsp;to&nbsp;enter&nbsp;Vietnam&nbsp;need&nbsp;to&nbsp;bring&nbsp;with&nbsp;them&nbsp;when&nbsp;joining&nbsp;the&nbsp;tour.</p><p>-&nbsp;In&nbsp;case&nbsp;of&nbsp;using&nbsp;ABTC&nbsp;(APEC),&nbsp;h&nbsp;For&nbsp;official,&nbsp;diplomatic&nbsp;passports&nbsp;or&nbsp;self-applying&nbsp;a&nbsp;visa,&nbsp;please&nbsp;notify&nbsp;in&nbsp;advance&nbsp;to&nbsp;receive&nbsp;appropriate&nbsp;advice.</p><p>Conditions&nbsp;for&nbsp;participation&nbsp;in&nbsp;the&nbsp;tour&nbsp;r</p><p><strong>Age&nbsp;and&nbsp;health:</strong></p><p>-&nbsp;Tour&nbsp;applies&nbsp;to&nbsp;guests&nbsp;under&nbsp;70&nbsp;years&nbsp;old.</p><p>-&nbsp;Guests&nbsp;from&nbsp;70&nbsp;years&nbsp;old&nbsp;and&nbsp;above&nbsp;You&nbsp;need&nbsp;to&nbsp;pay&nbsp;an&nbsp;additional&nbsp;premium&nbsp;insurance&nbsp;according&nbsp;to&nbsp;regulations.</p><p>-&nbsp;From&nbsp;75&nbsp;years&nbsp;old&nbsp;or&nbsp;older,&nbsp;you&nbsp;need&nbsp;to&nbsp;provide&nbsp;a&nbsp;certificate&nbsp;of&nbsp;good&nbsp;health&nbsp;due&nbsp;to&nbsp;An&nbsp;authorized&nbsp;medical&nbsp;facility&nbsp;and&nbsp;a&nbsp;relative&nbsp;under&nbsp;60&nbsp;years&nbsp;old&nbsp;accompanying.</p><p>-&nbsp;Pregnant&nbsp;guests&nbsp;please&nbsp;inform&nbsp;when&nbsp;registering;&nbsp;Need&nbsp;to&nbsp;consult&nbsp;a&nbsp;doctor&nbsp;before&nbsp;joining&nbsp;the&nbsp;tour.</p><p>-&nbsp;Do&nbsp;not&nbsp;accept&nbsp;pregnant&nbsp;customers&nbsp;of&nbsp;5&nbsp;months&nbsp;or&nbsp;more&nbsp;for&nbsp;safety&nbsp;reasons.</p><p>-&nbsp;You&nbsp;need&nbsp;to&nbsp;ensure&nbsp;your&nbsp;health&nbsp;be&nbsp;fit&nbsp;to&nbsp;participate&nbsp;in&nbsp;the&nbsp;activities&nbsp;in&nbsp;the&nbsp;tour.</p><p>-&nbsp;If&nbsp;you&nbsp;have&nbsp;special&nbsp;health&nbsp;conditions,&nbsp;please&nbsp;inform&nbsp;the&nbsp;consultant&nbsp;before&nbsp;booking&nbsp;the&nbsp;tour.&nbsp;You&nbsp;may&nbsp;be&nbsp;required&nbsp;to&nbsp;provide&nbsp;a&nbsp;health&nbsp;certificate&nbsp;or&nbsp;sign&nbsp;a&nbsp;commitment&nbsp;in&nbsp;some&nbsp;necessary&nbsp;cases.</p><p><strong>Regulations&nbsp;by&nbsp;group:&nbsp;&lt;&nbsp;/strong&gt;</strong></p><p><strong>-&nbsp;The&nbsp;program&nbsp;can&nbsp;adjust&nbsp;the&nbsp;order&nbsp;of&nbsp;tours&nbsp;according&nbsp;to&nbsp;the&nbsp;actual&nbsp;situation&nbsp;but&nbsp;still&nbsp;ensures&nbsp;full&nbsp;points.</strong></p><p><strong>-&nbsp;Tour&nbsp;departs&nbsp;when&nbsp;enough&nbsp;15&nbsp;adult&nbsp;customers,&nbsp;if&nbsp;the&nbsp;number&nbsp;is&nbsp;not&nbsp;sufficient,&nbsp;the&nbsp;company&nbsp;will&nbsp;notify&nbsp;and&nbsp;re-arrange&nbsp;the&nbsp;departure&nbsp;date&nbsp;or&nbsp;refund.</strong></p><p><strong>-&nbsp;Due&nbsp;to&nbsp;the&nbsp;nature&nbsp;of&nbsp;joint&nbsp;tours,&nbsp;You&nbsp;need&nbsp;to&nbsp;follow&nbsp;the&nbsp;group&nbsp;throughout&nbsp;the&nbsp;journey&nbsp;and&nbsp;return&nbsp;on&nbsp;the&nbsp;end&nbsp;of&nbsp;the&nbsp;tour.</strong></p><p><strong>-&nbsp;The&nbsp;services&nbsp;in&nbsp;the&nbsp;program&nbsp;have&nbsp;been&nbsp;arranged&nbsp;in&nbsp;advance&nbsp;by&nbsp;the&nbsp;group;&nbsp;In&nbsp;case&nbsp;of&nbsp;non-use&nbsp;for&nbsp;personal&nbsp;reasons,&nbsp;there&nbsp;will&nbsp;be&nbsp;no&nbsp;refund.</strong></p><p><strong>Exit&nbsp;and&nbsp;exit:</strong></p><p><strong>-&nbsp;You&nbsp;need&nbsp;to&nbsp;ensure&nbsp;your&nbsp;personal&nbsp;documents&nbsp;are&nbsp;valid&nbsp;according&nbsp;to&nbsp;import/exit&nbsp;regulations,&nbsp;when&nbsp;joining&nbsp;the&nbsp;tour.&nbsp;In&nbsp;case&nbsp;of&nbsp;not&nbsp;being&nbsp;allowed&nbsp;to&nbsp;exit/enter&nbsp;the&nbsp;country,&nbsp;the&nbsp;trip&nbsp;cannot&nbsp;be&nbsp;performed&nbsp;due&nbsp;to&nbsp;disapproval&nbsp;by&nbsp;the&nbsp;authorities&nbsp;(for&nbsp;any&nbsp;reason),&nbsp;the&nbsp;tour&nbsp;cost&nbsp;will&nbsp;not&nbsp;be&nbsp;refundable.&nbsp;The&nbsp;company&nbsp;will&nbsp;support&nbsp;guidance&nbsp;to&nbsp;the&nbsp;extent&nbsp;possible&nbsp;to&nbsp;solve&nbsp;for&nbsp;you.&nbsp;Any&nbsp;incurred&nbsp;costs&nbsp;you&nbsp;must&nbsp;actively&nbsp;arrange.</strong></p><p><strong>-&nbsp;For&nbsp;customers&nbsp;with&nbsp;significant&nbsp;changes&nbsp;in&nbsp;characteristics&nbsp;facial&nbsp;deformation,&nbsp;for&nbsp;example,&nbsp;cosmetic&nbsp;surgery,&nbsp;please&nbsp;renew&nbsp;your&nbsp;passport&nbsp;according&nbsp;to&nbsp;regulations&nbsp;before&nbsp;departure.&nbsp;In&nbsp;case&nbsp;the&nbsp;passport&nbsp;no&nbsp;longer&nbsp;suits&nbsp;the&nbsp;current&nbsp;appearance&nbsp;and&nbsp;problems&nbsp;arise&nbsp;when&nbsp;exiting&nbsp;the&nbsp;entry,&nbsp;you&nbsp;please&nbsp;bear&nbsp;your&nbsp;responsibility.&nbsp;Service&nbsp;cancellation&nbsp;costs&nbsp;(if&nbsp;any)&nbsp;will&nbsp;be&nbsp;applied&nbsp;according&nbsp;to&nbsp;regulations.</strong></p><p><strong>-&nbsp;For&nbsp;customers&nbsp;who&nbsp;have&nbsp;transformed,&nbsp;the&nbsp;information&nbsp;on&nbsp;the&nbsp;Passport&nbsp;and&nbsp;CCCD&nbsp;must&nbsp;be&nbsp;consistent&nbsp;and&nbsp;match.&nbsp;The&nbsp;image&nbsp;on&nbsp;the&nbsp;passport&nbsp;needs&nbsp;to&nbsp;be&nbsp;taken&nbsp;after&nbsp;gender&nbsp;transition/cosmetic&nbsp;surgery,&nbsp;ensuring&nbsp;clear&nbsp;identification&nbsp;according&nbsp;to&nbsp;the&nbsp;actual&nbsp;status&nbsp;Yes,&nbsp;the&nbsp;same&nbsp;as&nbsp;the&nbsp;passport&nbsp;currently&nbsp;in&nbsp;use.</strong></p><p><strong>Force&nbsp;majeure:</strong></p><p><strong>-&nbsp;Flight&nbsp;times&nbsp;may&nbsp;change&nbsp;according&nbsp;to&nbsp;the&nbsp;dry&nbsp;cargo&nbsp;carrier&nbsp;ng.</strong></p><p><strong>-&nbsp;In&nbsp;situations&nbsp;beyond&nbsp;control&nbsp;such&nbsp;as&nbsp;weather,&nbsp;natural&nbsp;disasters,&nbsp;epidemics,&nbsp;security&nbsp;incidents,&nbsp;war,&nbsp;airports&nbsp;y&nbsp;closure&nbsp;or&nbsp;change&nbsp;from&nbsp;transportation&nbsp;unit,&nbsp;…&nbsp;the&nbsp;schedule&nbsp;may&nbsp;be&nbsp;adjusted&nbsp;to&nbsp;ensure&nbsp;your&nbsp;safety&nbsp;and&nbsp;benefits.&nbsp;The&nbsp;company&nbsp;will&nbsp;make&nbsp;maximum&nbsp;efforts&nbsp;to&nbsp;support&nbsp;and&nbsp;coordinate&nbsp;with&nbsp;customers&nbsp;to&nbsp;handle&nbsp;arising&nbsp;issues.&nbsp;However,&nbsp;related&nbsp;expenses&nbsp;such&nbsp;as&nbsp;food,&nbsp;travel,&nbsp;stay,&nbsp;changing/rebooking&nbsp;tickets...&nbsp;(if&nbsp;any),&nbsp;please&nbsp;pay&nbsp;according&nbsp;to&nbsp;actuality.&nbsp;The&nbsp;company&nbsp;will&nbsp;accompany&nbsp;and&nbsp;support&nbsp;so&nbsp;that&nbsp;you&nbsp;have&nbsp;the&nbsp;most&nbsp;suitable&nbsp;and&nbsp;convenient&nbsp;plan.</strong></p><p><strong>Instructor</strong></p><p><strong>-&nbsp;Guide&nbsp;Guide&nbsp;(HDV)&nbsp;The&nbsp;will&nbsp;contact&nbsp;you&nbsp;approximately&nbsp;2&nbsp;days&nbsp;before&nbsp;departure&nbsp;to&nbsp;arrange&nbsp;a&nbsp;pickup&nbsp;time&nbsp;and&nbsp;provide&nbsp;the&nbsp;necessary&nbsp;information&nbsp;for&nbsp;transfer.</strong></p>', '<p>None</p>'),
	(15, 13, 'zh', '马来西亚-新加坡5天4夜游：探索东南亚文化', 'tour-malaysia-singapore-5n4d-kham-pha-van-hoa-dong-nam-a', '探索滨海湾花园：新加坡标志性的生态花园。', '<p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">探索滨海湾花园：新加坡标志性的生态花园。</span></p><p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">参观滨海湾金沙和鱼尾狮公园：狮子岛图标。</span></p><p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">参观神秘的黑风洞并征服 272 个彩色楼梯。</span></p><p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">体验云顶高原：云端娱乐之城。</span></p><p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">报到布特拉清真寺和吉隆坡独立广场。</span></p>', '<p><strong>交通</strong></p><p>-越南航空公司往返机票（23公斤托运行李+10公斤手提行李）。 </p><p>- 沿途提供空调车辆。</p><p>- 2 个国家的机场安检费、航空保险、机场税（根据规定） y 在出票时确定）。</p><p><strong>住宿</strong></p><p>- 标准 3-4* 当地酒店（2 位客人/房间；男/女个人客户可安排合适的房间）。</p><p><strong>其他服务</strong></p><p>- 计划内的观光门票。 </p><p>- 根据计划膳食。 （如果可调节，请确保同等数量和质量）。</p><p>- 矿泉水 01 瓶/人/天。</p><p>- 国际旅行保险。 </p><p>- 团队领队和当地导游在旅途中提供服务。</p><p>- 赠送游客帽子。 </p><p>- 增值税。</p>', '<p>- 单间附加费（如有）：4,300,000 越南盾/人/旅游 – 4,800,000 越南盾/人/旅游。 </p><p>- 司机和导游小费：25 美元/人/团。</p><p>- 外籍游客附加费：660,000 越南盾/人。</p><p>- 根据外籍游客重新进入越南的签证遵守现行规定（如果有）。</p><p>- 个人费用：超重行李、电话、洗衣、观光、计划外的支出。</p>', '<p>儿童政策</p><p><strong>1. 一般规则：</strong></p><p>- 每 02 名成人可陪同 01 名儿童。</p><p>- 从第二个儿童开始，适用。遵守每个年龄段的规定（如下所述）。</p><p>- 孩子们与父母一起睡在床上。 → 如果需要自己的床：按成人收费。</p><p>- 计划外的费用（如有）由家庭支付。</p><p><strong>2. 按年龄划分的规定：</strong></p><p>- 2 岁以下儿童：以网站上显示的价格为准，包括机票、不单独座位、与父母同睡。</p><p>- 2 - 10 岁儿童：以网站上显示的价格为准，包括计划中的全套服务。 和父母一起睡觉。 第 2 个儿童起：按成人价格的 100% 收费。</p><p>- 11 岁及以上儿童：按成人收费。</p><p>- 如果只有 1 名客人（成人）与 1 名儿童（12 岁以下）一起旅行），儿童按成人票价收取较高费用，以确保服务按规定进行。</p><p><strong>参团时的身份证件</strong></p><p>-家庭护照原件和必要文件。</p><p>- 14 岁以下儿童需携带出生证明。 </p><p>-儿童需要由父母或年满18岁的亲戚陪同； 如果与亲戚一起旅行，则需要有效授权。</p><p>取消和更改政策</p><p>- 自发布签名之日起至出发前 30 天：取消费用押金的 50%。</p><p>- 出发日期前 15 点起：取消费用为旅游总价的 70%。 </p><p>- 在上述时间之后：取消费用为旅游总价的 100%。</p><p>- 旅游取消/更改时间按营业时间记录，并在工作日计算（不包括星期六、星期日和节假日/春节）。 营业时间外提交的请求将从次日营业时间开始计算。</p><p>- 请通过电子邮件或公司官方联系渠道发送取消请求以进行记录。 电话通知不会被视为取消政策的依据。</p><p>签证信息</p><p>-持有越南国籍的客户可免签证。</p><p>-护照完好无损，且自旅行结束之日起 6 个月内仍然有效。 </p><p><strong>有关居住身份的说明</strong></p><p>-您拥有双重国籍、旅行证件或居住身份请在注册时告知，并提供完整的相关文件。</p><p>- 客人只有绿卡，但没有有效的越南护照，将没有资格报名参加第三国旅游。</p><p>- 客人是海外越南人或国民c 持有越南签证的外国人参加旅游时需要携带。</p><p>- 如果使用 ABTC (APEC)，h 适用于官方、外交护照或自行申请护照签证，请提前通知以获得适当的建议。</p><p>参加旅游的条件</p><p><strong>年龄和健康状况：</strong></p><p>-旅游适用于70岁以下的游客。</p><p>-70岁及以上的游客您需要按照规定缴纳额外的保险费。</p><p>- 75岁或以上，您需要提供在授权医疗机构的健康状况证明和60岁以下的亲属老伴。</p><p>- 怀孕客人请在登记时告知； 参加行程前需咨询医生。</p><p>-出于安全考虑，请勿接待怀孕5个月或以上的游客。</p><p>-您需要确保自己的健康状况适合参加行程中的活动。</p><p>-如果您有特殊的健康状况，请在预订旅游之前告知顾问。 某些必要情况下，您可能需要提供健康证明或签署承诺书。</p><p><strong>按群体规定：< /strong></p><p>- 程序可根据实际情况调整行程顺序，但仍能保证满分。</p><p>- 当达到 15 名成年顾客时，如人数不足，行程将出发，公司将通知并重新安排出发日期或退款。</p><p>- 由于联合旅游的性质，您需要全程跟随团队，并在行程结束时返回。</p><p>- 项目中的服务已由团队提前安排； 如因个人原因未使用，将不予退款。</p><p><strong>退出与退出：</strong></p><p>-您在参团时，需要根据进出境规定确保您的个人证件有效。 如果不被允许出/入境，由于当局不批准（出于任何原因）而无法进行旅行，旅游费用将不予退还。 公司将在可能的范围内支持指导，为您解决问题。 任何产生的费用您必须积极安排。</p><p>-对于面部变形特征发生重大变化的顾客，例如整容手术，请在出发前按规定更新护照。 如果护照不再符合现在的外观，并在出境时出现问题，请您自行承担责任。 取消服务费用（如有）将按照规定收取。</p><p>- 对于已转换的客户，护照和 CCCD 上的信息必须一致且匹配。 护照上的图像需要在变性/整容手术后拍摄，确保根据实际状况清晰识别是的，与当前使用的护照相同。</p><p><strong>不可抗力：</strong></p><p>-航班时间可能会根据干货承运商的情况而变化。</p><p>- 无法控制的情况，例如天气、自然灾害、流行病、安全事件、战争、机场如果运输单位关闭或发生变化，……时间表可能会进行调整，以确保您的安全和利益。 公司将尽最大努力支持并与客户协调处理出现的问题。 但相关费用如餐饮、交通、住宿、改签/重新预订机票……（如有），请按实际支付。 公司将全程陪同和支持，以便您拥有最合适、最方便的计划。</p><p>教练</p><p>- 导游指南 (HDV)我们将在出发前大约 2 天与您联系，安排接机时间并提供转机所需的信息。</p>', '<p>无</p>'),
	(18, 1, 'en', 'Sapa Discovery Tour - Conquer Fansipan Peak 3', 'sapa-discovery-tour-conquer-fansipan-peak-3', 'Journey to the misty mountain town, explore Cat Cat village, and conquer the roof of Indochina.', NULL, NULL, NULL, NULL, NULL),
	(19, 1, 'zh', '沙巴探索之旅 - 征服番西邦峰 3', 'sha-ba-tan-suo-zhi-lv-zheng-fu-fan-xi-bang-feng-3', '前往云雾缭绕的山城，探索猫猫村，并征服印度支那屋脊。', NULL, NULL, NULL, NULL, NULL),
	(20, 8, 'en', 'Sapa Discovery Tour - Conquer Fansipan Peak 1', 'sapa-discovery-tour-conquer-fansipan-peak-1', 'Journey to the misty mountain town, explore Cat Cat village, and conquer the roof of Indochina.', NULL, NULL, NULL, NULL, NULL),
	(21, 8, 'zh', '沙巴探索之旅 - 征服番西邦峰 1', 'sha-ba-tan-suo-zhi-lv-zheng-fu-fan-xi-bang-feng-1', '前往云雾缭绕的山城，探索猫猫村，并征服印度支那屋脊。', NULL, NULL, NULL, NULL, NULL),
	(22, 9, 'en', 'Sapa Discovery Tour - Conquer Fansipan Peak 2', 'sapa-discovery-tour-conquer-fansipan-peak-2', 'Journey to the misty mountain town, explore Cat Cat village, and conquer the roof of Indochina.', NULL, NULL, NULL, NULL, NULL),
	(23, 9, 'zh', '沙巴探索之旅 - 征服番西邦峰 2', 'sha-ba-tan-suo-zhi-lv-zheng-fu-fan-xi-bang-feng-2', '前往云雾缭绕的山城，探索猫猫村，并征服印度支那屋脊。', NULL, NULL, NULL, NULL, NULL);

-- Dumping structure for table db_marketing_tour.translations
DROP TABLE IF EXISTS `translations`;
CREATE TABLE IF NOT EXISTS `translations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `translation_key` varchar(160) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `vi` text DEFAULT NULL,
  `en` text DEFAULT NULL,
  `zh` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `translation_key` (`translation_key`)
) ENGINE=InnoDB AUTO_INCREMENT=374 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.translations: ~372 rows (approximately)
DELETE FROM `translations`;
INSERT INTO `translations` (`id`, `translation_key`, `description`, `vi`, `en`, `zh`, `created_at`, `updated_at`) VALUES
	(1, 'admin.menu.banners', 'quan ly banner', 'Quan ly banner', 'Banner Management', 'Banner Management', '2026-07-21 21:41:05', '2026-07-23 22:04:40'),
	(2, 'admin.menu.bookings', 'admin.menu.bookings', 'Quan ly don', 'Booking Management', 'Booking Management', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(3, 'admin.menu.content', 'admin.menu.content', 'Bai viet', 'Content', 'Content', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(4, 'admin.menu.dashboard', 'admin.menu.dashboard', 'Bang dieu khien', 'Dashboard', 'Dashboard', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(5, 'admin.menu.reviews', 'admin.menu.reviews', 'Quan ly danh gia', 'Review Management', 'Review Management', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(6, 'admin.menu.tours', 'admin.menu.tours', 'Quan ly tour', 'Tour Management', 'Tour Management', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(7, 'admin.menu.translations', 'admin.menu.translations', 'Quản lý Ngôn ngữ', 'Translations', 'Translations', '2026-07-21 21:41:05', '2026-07-21 22:09:20'),
	(8, 'admin.translations.actions', 'admin.translations.actions', 'Hanh dong', 'Actions', 'Actions', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(9, 'admin.translations.add', 'admin.translations.add', 'Them key', 'Add key', 'Add key', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(10, 'admin.translations.chinese', 'admin.translations.chinese', 'Tieng Trung', 'Chinese', 'Chinese', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(11, 'admin.translations.confirmDelete', 'admin.translations.confirmDelete', 'Xoa ban dich nay?', 'Delete this translation?', 'Delete this translation?', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(12, 'admin.translations.createTitle', 'admin.translations.createTitle', 'Them ban dich', 'Create translation', 'Create translation', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(13, 'admin.translations.deleteError', 'admin.translations.deleteError', 'Khong the xoa ban dich', 'Unable to delete translation', 'Unable to delete translation', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(14, 'admin.translations.deleteSuccess', 'admin.translations.deleteSuccess', 'Da xoa ban dich', 'Translation deleted', 'Translation deleted', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(15, 'admin.translations.description', 'admin.translations.description', 'Mo ta', 'Description', 'Description', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(16, 'admin.translations.editTitle', 'admin.translations.editTitle', 'Sua ban dich', 'Edit translation', 'Edit translation', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(17, 'admin.translations.editorHint', 'admin.translations.editorHint', 'Gia tri luu o day se uu tien hon JSON local.', 'Values saved here override local JSON translations.', 'Values saved here override local JSON translations.', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(18, 'admin.translations.empty', 'admin.translations.empty', 'Khong tim thay ban dich', 'No translations found', 'No translations found', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(19, 'admin.translations.english', 'admin.translations.english', 'Tieng Anh', 'English', 'English', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(20, 'admin.translations.key', 'admin.translations.key', 'Key', 'Key', 'Key', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(21, 'admin.translations.loadError', 'admin.translations.loadError', 'Khong the tai danh sach ngon ngu', 'Unable to load translations', 'Unable to load translations', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(22, 'admin.translations.saveError', 'admin.translations.saveError', 'Khong the luu ban dich', 'Unable to save translation', 'Unable to save translation', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(23, 'admin.translations.saveSuccess', 'admin.translations.saveSuccess', 'Da luu ban dich', 'Translation saved', 'Translation saved', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(24, 'admin.translations.searchPlaceholder', 'admin.translations.searchPlaceholder', 'Tim key hoac noi dung...', 'Search key or content...', 'Search key or content...', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(26, 'admin.translations.total', 'admin.translations.total', '{{count}} key', '{{count}} keys', '{{count}} keys', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(27, 'admin.translations.vietnamese', 'admin.translations.vietnamese', 'Tieng Viet', 'Vietnamese', 'Vietnamese', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(28, 'auth.backToLogin', 'auth.backToLogin', 'Quay lại đăng nhập', 'Back to login', '返回登录', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(29, 'auth.confirmNewPasswordPlaceholder', 'auth.confirmNewPasswordPlaceholder', 'Xác nhận mật khẩu mới', 'Confirm new password', '确认新密码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(30, 'auth.confirmPasswordPlaceholder', 'auth.confirmPasswordPlaceholder', 'Xác nhận mật khẩu', 'Confirm password', '确认密码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(31, 'auth.createAccount', 'auth.createAccount', 'Tạo tài khoản mới', 'Create New Account', '创建新账户', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(32, 'auth.createPasswordPlaceholder', 'auth.createPasswordPlaceholder', 'Tạo mật khẩu', 'Create password', '创建密码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(33, 'auth.emailPlaceholder', 'auth.emailPlaceholder', 'Nhập địa chỉ email', 'Enter email address', '输入电子邮件地址', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(34, 'auth.expireIn', 'auth.expireIn', 'Mã hết hạn sau', 'Code expires in', '代码过期时间', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(35, 'auth.forgotPasswordDesc', 'auth.forgotPasswordDesc', 'Nhập email của bạn để nhận mã xác thực đặt lại mật khẩu.', 'Enter your email to receive a password reset verification code.', '输入您的电子邮件以接收密码重置验证码。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(36, 'auth.forgotPasswordText', 'auth.forgotPasswordText', 'Quên mật khẩu?', 'Forgot password?', '忘记密码？', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(37, 'auth.fullNamePlaceholder', 'auth.fullNamePlaceholder', 'Nhập họ và tên', 'Enter full name', '输入全名', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(38, 'auth.hasAccount', 'auth.hasAccount', 'Đã có tài khoản?', 'Already have an account?', '已有账户？', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(39, 'auth.loginDesc', 'auth.loginDesc', 'Vui lòng đăng nhập để tiếp tục', 'Please login to continue', '请登录以继续', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(40, 'auth.loginSuccess', 'auth.loginSuccess', 'Đăng nhập thành công!', 'Login successful!', '登录成功！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(41, 'auth.loginTitle', 'auth.loginTitle', 'Đăng nhập', 'Login', '登录', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(42, 'auth.newPasswordPlaceholder', 'auth.newPasswordPlaceholder', 'Mật khẩu mới', 'New password', '新密码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(43, 'auth.noAccount', 'auth.noAccount', 'Chưa có tài khoản?', 'Don\'t have an account?', '没有账户？', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(44, 'auth.otpSent', 'auth.otpSent', 'Mã OTP đã được gửi!', 'OTP has been sent!', 'OTP已发送！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(45, 'auth.otpSentTo', 'auth.otpSentTo', 'Mã OTP đã được gửi đến', 'OTP has been sent to', 'OTP已发送至', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(46, 'auth.passwordMismatch', 'auth.passwordMismatch', 'Mật khẩu không khớp!', 'Passwords do not match!', '密码不匹配！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(47, 'auth.passwordPlaceholder', 'auth.passwordPlaceholder', 'Nhập mật khẩu', 'Enter password', '输入密码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(48, 'auth.phonePlaceholder', 'auth.phonePlaceholder', 'Nhập số điện thoại', 'Enter phone number', '输入电话号码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(49, 'auth.registerDesc', 'auth.registerDesc', 'Đăng ký để trải nghiệm kỳ nghỉ tuyệt vời', 'Register to experience a wonderful vacation', '注册以体验美好的假期', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(50, 'auth.registerNow', 'auth.registerNow', 'Đăng ký ngay', 'Register now', '立即注册', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(51, 'auth.registerTitle', 'auth.registerTitle', 'Đăng ký', 'Register', '注册', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(52, 'auth.resendOtpAfter', 'auth.resendOtpAfter', 'Gửi lại mã sau', 'Resend code in', '重新发送代码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(53, 'auth.resendOtpBtn', 'auth.resendOtpBtn', 'Gửi lại mã OTP', 'Resend OTP', '重新发送OTP', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(54, 'auth.resendOtpSuccess', 'auth.resendOtpSuccess', 'Đã gửi lại mã OTP!', 'OTP has been resent!', 'OTP已重新发送！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(55, 'auth.resetPasswordBtn', 'auth.resetPasswordBtn', 'Đặt lại mật khẩu', 'Reset Password', '重置密码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(56, 'auth.resetPasswordDesc', 'auth.resetPasswordDesc', 'Vui lòng nhập mật khẩu mới của bạn.', 'Please enter your new password.', '请输入您的新密码。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(57, 'auth.resetSuccess', 'auth.resetSuccess', 'Đặt lại mật khẩu thành công!', 'Password reset successfully!', '密码重置成功！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(58, 'auth.sendOtpBtn', 'auth.sendOtpBtn', 'Gửi mã xác thực', 'Send Verification Code', '发送验证码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(59, 'auth.verifyBtn', 'auth.verifyBtn', 'Xác thực', 'Verify', '验证', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(60, 'auth.verifyEmailTitle', 'auth.verifyEmailTitle', 'Xác thực Email', 'Verify Email', '验证电子邮件', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(61, 'auth.verifyOtpTitle', 'auth.verifyOtpTitle', 'Xác thực mã OTP', 'Verify OTP Code', '验证OTP代码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(62, 'auth.verifySuccess', 'auth.verifySuccess', 'Xác thực thành công!', 'Verification successful!', '验证成功！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(63, 'auth.welcomeBack', 'auth.welcomeBack', 'Chào mừng trở lại', 'Welcome Back', '欢迎回来', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(64, 'booking.adult', 'booking.adult', 'Người lớn', 'Adults', '成人', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(65, 'booking.adultAge', 'booking.adultAge', 'Trên 10 tuổi', 'Over 10 years old', '10岁以上', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(66, 'booking.adultPrice', 'booking.adultPrice', '{{count}} Người lớn × {{price}}', '{{count}} Adults × {{price}}', '{{count}} 成人 × {{price}}', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(67, 'booking.bookNow', 'booking.bookNow', 'Đặt Tour Ngay', 'Book Now', '立即预订', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(68, 'booking.child', 'booking.child', 'Trẻ em', 'Children', '儿童', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(69, 'booking.childAge', 'booking.childAge', 'Từ 5 - 10 tuổi', '5 - 10 years old', '5 - 10岁', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(70, 'booking.childPrice', 'booking.childPrice', '{{count}} Trẻ em × {{price}}', '{{count}} Children × {{price}}', '{{count}} 儿童 × {{price}}', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(71, 'booking.customerNote', 'booking.customerNote', 'Ghi chú', 'Note', '备注', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(72, 'booking.departureDate', 'booking.departureDate', 'Ngày khởi hành', 'Departure Date', '出发日期', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(73, 'booking.errGeneric', 'booking.errGeneric', 'Có lỗi xảy ra, vui lòng thử lại', 'An error occurred, please try again', '出现错误，请重试', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(74, 'booking.errLoginRequired', 'booking.errLoginRequired', 'Vui lòng đăng nhập để đặt tour!', 'Please log in to book a tour!', '请登录后再预订行程！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(75, 'booking.errSelectDeparture', 'booking.errSelectDeparture', 'Vui lòng chọn ngày khởi hành!', 'Please select a departure date!', '请选择出发日期！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(76, 'booking.errSelectPickup', 'booking.errSelectPickup', 'Vui lòng chọn điểm đón!', 'Please select a pickup point!', '请选择接送地点！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(77, 'booking.extraServiceTotal', 'booking.extraServiceTotal', 'Dịch vụ thêm', 'Extra services', '附加服务', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(78, 'booking.extraServices', 'booking.extraServices', 'Dịch vụ thêm (tùy chọn)', 'Extra Services (optional)', '附加服务（可选）', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(79, 'booking.infant', 'booking.infant', 'Em bé', 'Infants', '婴儿', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(80, 'booking.infantAge', 'booking.infantAge', 'Dưới 5 tuổi', 'Under 5 years old', '5岁以下', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(81, 'booking.infantPrice', 'booking.infantPrice', '{{count}} Trẻ nhỏ × {{price}}', '{{count}} Infants × {{price}}', '{{count}} 婴儿 × {{price}}', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(82, 'booking.noDepartureList', 'booking.noDepartureList', 'Không có lịch khởi hành', 'No departures available', '暂无出发日期', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(83, 'booking.noDepartures', 'booking.noDepartures', 'Chưa có lịch khởi hành', 'No departures available', '暂无出发日期', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(84, 'booking.passengers', 'booking.passengers', 'Hành khách', 'Passengers', '旅客', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(85, 'booking.perAdult', 'booking.perAdult', '/người lớn', '/adult', '/成人', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(86, 'booking.perBooking', 'booking.perBooking', '/đơn', '/booking', '/订单', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(87, 'booking.perPerson', 'booking.perPerson', '/người', '/person', '/人', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(88, 'booking.pickupPoint', 'booking.pickupPoint', 'Điểm đón', 'Pickup Point', '接送地点', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(89, 'booking.pickupSurcharge', 'booking.pickupSurcharge', 'Phụ thu đón ({{count}} người)', 'Pickup surcharge ({{count}} pax)', '接送附加费（{{count}}人）', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(90, 'booking.priceFrom', 'booking.priceFrom', 'Giá từ', 'From', '价格起', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(91, 'booking.processing', 'booking.processing', 'Đang xử lý...', 'Processing...', '处理中...', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(92, 'booking.quantity', 'booking.quantity', 'Số lượng:', 'Quantity:', '数量：', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(93, 'booking.seats', 'booking.seats', 'chỗ', 'seats', '座位', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(94, 'booking.seatsLeft', 'booking.seatsLeft', 'Còn {{count}} chỗ', '{{count}} seats left', '剩余 {{count}} 个座位', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(95, 'booking.selectDeparture', 'booking.selectDeparture', '— Chọn ngày khởi hành —', '— Select departure date —', '— 选择出发日期 —', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(96, 'booking.selectPickup', 'booking.selectPickup', '— Chọn điểm đón —', '— Select pickup point —', '— 选择接送地点 —', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(97, 'booking.soldOut', 'booking.soldOut', 'Hết chỗ', 'Sold out', '已售罄', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(98, 'booking.submitBooking', 'booking.submitBooking', 'Đặt Tour Ngay', 'Book Now', '立即预订', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(99, 'booking.successMessage', 'booking.successMessage', 'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.', 'We will contact you as soon as possible.', '我们将尽快与您联系。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(100, 'booking.successTitle', 'booking.successTitle', 'Đặt Tour Thành Công!', 'Booking Successful!', '预订成功！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(101, 'booking.total', 'booking.total', 'Tổng cộng', 'Total', '总计', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(102, 'booking.totalPassengers', 'booking.totalPassengers', 'Tổng: {{count}} hành khách', 'Total: {{count}} passengers', '共 {{count}} 位旅客', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(103, 'common.cancel', 'common.cancel', 'Hủy', 'Cancel', '取消', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(104, 'common.close', 'common.close', 'Đóng', 'Close', '关闭', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(105, 'common.loading', 'common.loading', 'Đang tải...', 'Loading...', '加载中...', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(106, 'common.login', 'common.login', 'Đăng nhập', 'Login', '登录', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(107, 'common.register', 'common.register', 'Đăng ký', 'Register', '注册', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(108, 'common.save', 'common.save', 'Lưu', 'Save', '保存', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(109, 'common.search', 'common.search', 'Tìm kiếm', 'Search', '搜索', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(110, 'footer.about', 'footer.about', 'Về Chúng Tôi', 'About Us', '关于我们', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(111, 'footer.aboutUs', 'footer.aboutUs', 'VỀ KỲ NGHỈ TUYỆT VỜI', 'ABOUT KY NGHỈ TUYET VOI', '关于 KyNghiTuyetVoi', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(112, 'footer.address', 'footer.address', 'Phố Nhổn, P. Phương Canh, Q. Bắc Từ Liêm, TP. Hà Nội', 'Nhon Street, Phuong Canh Ward, Bac Tu Liem Dist., Hanoi', '河内市北慈廉区1号Nhon街', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(113, 'footer.blog', 'footer.blog', 'Blog Du Lịch', 'Travel Blog', '旅游博客', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(114, 'footer.copyright', 'footer.copyright', '© 2026 Marketing Tour. Tất cả các quyền được bảo lưu.', '© 2026 Marketing Tour. All rights reserved.', '© 2026 Marketing Tour. 保留所有权利。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(115, 'footer.faq', 'footer.faq', 'Câu Hỏi Thường Gặp', 'FAQ', '常见问题', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(116, 'footer.info', 'footer.info', 'THÔNG TIN CẦN BIẾT', 'USEFUL INFO', '重要信息', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(117, 'footer.needHelp', 'footer.needHelp', 'BẠN CẦN TRỢ GIÚP?', 'NEED HELP?', '需要帮助？', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(118, 'footer.partners', 'footer.partners', 'Đối Tác', 'Partners', '合作伙伴', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(119, 'footer.payment', 'footer.payment', 'Hướng Dẫn Thanh Toán', 'Payment Guide', '支付指南', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(120, 'footer.policy', 'footer.policy', 'Chính Sách Bảo Mật', 'Privacy Policy', '隐私政策', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(121, 'footer.terms', 'footer.terms', 'Điều Khoản Sử Dụng', 'Terms of Use', '使用条款', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(122, 'guide.back', 'guide.back', 'Quay lại', 'Back', '返回', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(123, 'guide.backToList', 'guide.backToList', 'Quay lại danh sách', 'Back to list', '返回列表', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(124, 'guide.empty', 'guide.empty', 'Chưa có bài hướng dẫn nào', 'No guide articles yet', '暂无指南文章', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(125, 'guide.notFoundDesc', 'guide.notFoundDesc', 'Bài hướng dẫn không tồn tại hoặc đã bị ẩn.', 'This guide article does not exist or has been hidden.', '该指南文章不存在或已被隐藏。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(126, 'guide.notFoundTitle', 'guide.notFoundTitle', 'Không tìm thấy', 'Not found', '未找到', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(127, 'guide.subtitle', 'guide.subtitle', 'Mẹo và thông tin hữu ích cho chuyến đi của bạn', 'Helpful tips and information for your trip', '为您的旅程提供实用提示和信息', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(128, 'guide.title', 'guide.title', 'Hướng Dẫn Du Lịch', 'Travel Guides', '旅游指南', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(129, 'guide.updatedAt', 'guide.updatedAt', 'Cập nhật', 'Updated', '更新', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(130, 'header.adminPanel', 'header.adminPanel', 'Trang Quản Trị', 'Admin Panel', '管理面板', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(131, 'header.brandName', 'header.brandName', 'Beautiful Holiday', 'Beautiful Holiday', 'Beautiful Holiday', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(132, 'header.domesticTour', 'header.domesticTour', 'Tour Trong Nước', 'Domestic Tours', '国内旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(133, 'header.guest', 'header.guest', 'Khách', 'Guest', '用户', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(134, 'header.guides', 'header.guides', 'Cẩm Nang', 'Guides', '指南', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(135, 'header.history', 'header.history', 'Lịch Sử Đặt Tour', 'Booking History', '预订历史', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(136, 'header.home', 'header.home', 'Trang Chủ', 'Home', '首页', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(137, 'header.internationalTour', 'header.internationalTour', 'Tour Quốc Tế', 'International Tours', '国际旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(138, 'header.logout', 'header.logout', 'Đăng Xuất', 'Logout', '登出', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(139, 'header.lookupBooking', 'header.lookupBooking', 'Tra Cứu Đơn', 'Lookup Booking', '查询订单', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(140, 'header.profile', 'header.profile', 'Tài Khoản', 'Profile', '个人资料', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(141, 'history.adults', 'history.adults', 'Người lớn', 'Adults', '成人', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(142, 'history.bookingDate', 'history.bookingDate', 'Ngày đặt', 'Booking Date', '预订日期', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(143, 'history.bookingDetails', 'history.bookingDetails', 'Chi tiết đặt tour', 'Booking Details', '预订详情', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(144, 'history.bookingHistory', 'history.bookingHistory', 'Lịch sử đặt tour', 'Booking History', '预订历史', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(145, 'history.bookings', 'history.bookings', 'booking', 'bookings', '预订', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(146, 'history.cancelBooking', 'history.cancelBooking', 'Hủy', 'Cancel', '取消', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(147, 'history.cancelFail', 'history.cancelFail', 'Hủy booking thất bại.', 'Booking cancellation failed.', '取消预订失败。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(148, 'history.cancelSuccess', 'history.cancelSuccess', 'Hủy booking thành công!', 'Booking cancelled successfully!', '成功取消预订！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(149, 'history.children', 'history.children', 'Trẻ em', 'Children', '儿童', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(150, 'history.collapse', 'history.collapse', 'Thu gọn', 'Collapse', '收起', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(151, 'history.confirmCancel', 'history.confirmCancel', 'Xác nhận hủy', 'Confirm Cancellation', '确认取消', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(152, 'history.confirmCancelDesc', 'history.confirmCancelDesc', 'Bạn có chắc chắn muốn hủy booking này không? Thao tác không thể hoàn tác.', 'Are you sure you want to cancel this booking? This action cannot be undone.', '您确定要取消此预订吗？此操作无法撤消。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(153, 'history.confirmDelete', 'history.confirmDelete', 'Xác nhận xóa', 'Confirm Deletion', '确认删除', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(154, 'history.confirmDeleteDesc', 'history.confirmDeleteDesc', 'Bạn có chắc chắn muốn xóa lịch sử này không?', 'Are you sure you want to delete this history?', '您确定要删除此历史记录吗？', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(155, 'history.contact', 'history.contact', 'Liên hệ', 'Contact', '联系', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(156, 'history.contactPerson', 'history.contactPerson', 'Người liên hệ', 'Contact Person', '联系人', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(157, 'history.deleteFail', 'history.deleteFail', 'Xóa lịch sử thất bại.', 'History deletion failed.', '删除历史记录失败。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(158, 'history.deleteHistory', 'history.deleteHistory', 'Xóa', 'Delete', '删除', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(159, 'history.deleteSuccess', 'history.deleteSuccess', 'Xóa lịch sử thành công!', 'History deleted successfully!', '成功删除历史记录！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(160, 'history.departure', 'history.departure', 'Khởi hành', 'Departure', '出发', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(161, 'history.duration', 'history.duration', 'Thời lượng', 'Duration', '时长', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(162, 'history.errorFetchHistory', 'history.errorFetchHistory', 'Lỗi khi lấy lịch sử đặt tour. Vui lòng thử lại sau.', 'Error fetching booking history. Please try again later.', '获取预订历史记录时出错。请稍后再试。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(163, 'history.exploreTours', 'history.exploreTours', 'Khám phá tour ngay', 'Explore tours now', '立即探索行程', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(164, 'history.goBack', 'history.goBack', 'Quay lại', 'Go Back', '返回', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(165, 'history.infants', 'history.infants', 'Trẻ nhỏ', 'Infants', '婴儿', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(166, 'history.loadingHistory', 'history.loadingHistory', 'Đang tải lịch sử...', 'Loading history...', '正在加载历史记录...', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(167, 'history.manageTrips', 'history.manageTrips', 'Quản lý và theo dõi các chuyến đi của bạn', 'Manage and track your trips', '管理和跟踪您的行程', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(168, 'history.nameNotUpdated', 'history.nameNotUpdated', 'Chưa cập nhật tên', 'Name not updated', '名称未更新', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(169, 'history.next', 'history.next', 'Sau', 'Next', '下一页', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(170, 'history.noTrips', 'history.noTrips', 'Chưa có chuyến đi nào', 'No trips yet', '暂无行程', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(171, 'history.noTripsDesc', 'history.noTripsDesc', 'Bạn chưa đặt tour nào. Đừng bỏ lỡ các ưu đãi tuyệt vời, hãy bắt đầu chuyến hành trình của mình ngay hôm nay!', 'You haven\'t booked any tours yet. Don\'t miss out on great deals, start your journey today!', '您还没有预订任何行程。不要错过优惠，今天就开始您的旅程吧！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(172, 'history.none', 'history.none', 'Không có', 'None', '无', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(173, 'history.notSelected', 'history.notSelected', 'Chưa chọn', 'Not selected', '未选择', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(174, 'history.notUpdated', 'history.notUpdated', 'Chưa cập nhật', 'Not updated', '未更新', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(175, 'history.page', 'history.page', 'Trang', 'Page', '页', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(176, 'history.pickupPoint', 'history.pickupPoint', 'Điểm đón', 'Pickup Point', '接送点', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(177, 'history.prev', 'history.prev', 'Trước', 'Prev', '上一页', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(178, 'history.statusCancelled', 'history.statusCancelled', 'Đã hủy', 'Cancelled', '已取消', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(179, 'history.statusCompleted', 'history.statusCompleted', 'Hoàn thành', 'Completed', '已完成', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(180, 'history.statusConfirmed', 'history.statusConfirmed', 'Đã xác nhận', 'Confirmed', '已确认', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(181, 'history.statusPending', 'history.statusPending', 'Đang xử lý', 'Pending', '处理中', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(182, 'history.total', 'history.total', 'Tổng', 'Total', '总计', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(183, 'history.totalAmount', 'history.totalAmount', 'Tổng tiền', 'Total Amount', '总金额', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(184, 'history.tourName', 'history.tourName', 'Tên tour', 'Tour Name', '行程名称', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(185, 'history.viewDetails', 'history.viewDetails', 'Xem chi tiết', 'View Details', '查看详情', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(186, 'history.yourNote', 'history.yourNote', 'Ghi chú từ bạn', 'Your note', '您的备注', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(187, 'home.browseTypeDesc', 'home.browseTypeDesc', 'Lựa chọn điểm đến lý tưởng cho kỳ nghỉ sắp tới với các tour du lịch đa dạng, chất lượng cao từ trong nước đến quốc tế.', 'Choose the ideal destination for your upcoming vacation with diverse, high-quality domestic and international tours.', '为您即将到来的假期选择理想的目的地，享受多样化、高品质的国内和国际旅游。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(188, 'home.browseTypeHeading', 'home.browseTypeHeading', 'Khám Phá Hành Trình Của Bạn', 'Discover Your Journey', '探索您的旅程', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(189, 'home.domesticDesc', 'home.domesticDesc', 'Khám phá vẻ đẹp bất tận của Việt Nam từ miền non nước hữu tình đến những bãi biển thơ mộng.', 'Discover the endless beauty of Vietnam, from picturesque mountains to poetic beaches.', '探索越南的无尽之美，从如画的山脉到诗意的海滩。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(190, 'home.domesticTour', 'home.domesticTour', 'Tour Nội Địa', 'Domestic Tours', '国内旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(191, 'home.exploreNext', 'home.exploreNext', 'Khám phá tiếp', 'Explore next', '继续探索', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(192, 'home.featuredDesc', 'home.featuredDesc', 'Những hành trình được yêu thích nhất', 'Most loved journeys', '最受欢迎的旅程', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(193, 'home.featuredTours', 'home.featuredTours', 'Tour Nổi Bật', 'Featured Tours', '精选旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(194, 'home.heroDesc', 'home.heroDesc', 'Tour du lịch nội địa và quốc tế chất lượng cao với giá tốt nhất trên thị trường.', 'High-quality domestic and international tours with the best prices on the market.', '高品质的国内和国际旅游，市场最佳价格。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(195, 'home.heroTitle1', 'home.heroTitle1', 'Hành trình đáng nhớ', 'Memorable journeys', '难忘的旅程', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(196, 'home.heroTitle2', 'home.heroTitle2', 'bắt đầu từ đây', 'start here', '从这里开始', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(197, 'home.internationalDesc', 'home.internationalDesc', 'Trải nghiệm văn hóa đa dạng, thưởng thức ẩm thực độc đáo và chinh phục những vùng đất mới khắp thế giới.', 'Experience diverse cultures, enjoy unique cuisines, and conquer new lands around the world.', '体验多元文化，享受独特美食，征服世界各地的新土地。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(198, 'home.internationalTour', 'home.internationalTour', 'Tour Quốc Tế', 'International Tours', '国际旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(199, 'home.noFeaturedTours', 'home.noFeaturedTours', 'Chưa có tour nổi bật nào', 'No featured tours available', '暂无精选旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(200, 'home.noSaleTours', 'home.noSaleTours', 'Chưa có tour ưu đãi nào', 'No promotional tours available', '暂无优惠旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(201, 'home.perGuest', 'home.perGuest', '/ Khách', '/ Guest', '/ 人', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(202, 'home.priceFrom', 'home.priceFrom', 'Giá tour trọn gói chỉ từ', 'Package tours from only', '包价旅游仅需', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(203, 'home.saleDesc', 'home.saleDesc', 'Tour giảm giá đặc biệt, số lượng có hạn', 'Special discounted tours, limited quantity', '特价折扣旅游，数量有限', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(204, 'home.saleTours', 'home.saleTours', 'Tour Ưu Đãi Tốt Nhất Hôm Nay', 'Best Deals Today', '今日最佳优惠', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(205, 'home.search.10to20M', 'home.search.10to20M', 'Từ 10 - 20 triệu', '10 - 20 million', '1000万 - 2000万', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(206, 'home.search.5to10M', 'home.search.5to10M', 'Từ 5 - 10 triệu', '5 - 10 million', '500万 - 1000万', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(207, 'home.search.allPrices', 'home.search.allPrices', 'Tất cả mức giá', 'All prices', '所有价格', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(208, 'home.search.budgetLabel', 'home.search.budgetLabel', 'Ngân sách', 'Budget', '预算', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(209, 'home.search.button', 'home.search.button', 'Tìm Kiếm', 'Search', '搜索', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(210, 'home.search.departureLabel', 'home.search.departureLabel', 'Ngày khởi hành', 'Departure date', '出发日期', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(211, 'home.search.destinationLabel', 'home.search.destinationLabel', 'Bạn muốn đi đâu?', 'Where do you want to go?', '你想去哪里？', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(212, 'home.search.destinationPlaceholder', 'home.search.destinationPlaceholder', 'Tên tour, điểm đến...', 'Tour name, destination...', '旅游名称，目的地...', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(213, 'home.search.over20M', 'home.search.over20M', 'Trên 20 triệu', 'Over 20 million', '2000万以上', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(214, 'home.search.selectDeparture', 'home.search.selectDeparture', 'Chọn ngày khởi hành...', 'Select departure date...', '选择出发日期...', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(215, 'home.search.under5M', 'home.search.under5M', 'Dưới 5 triệu', 'Under 5 million', '500万以下', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(216, 'home.sloganTag', 'home.sloganTag', 'Khám phá thế giới cùng chúng tôi', 'Explore the world with us', '与我们一起探索世界', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(217, 'home.viewList', 'home.viewList', 'Xem danh sách', 'View list', '查看列表', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(218, 'home.viewMore', 'home.viewMore', 'Xem thêm', 'View more', '查看更多', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(219, 'lookup.adults', 'lookup.adults', 'Người lớn:', 'Adults:', '成人：', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(220, 'lookup.booker', 'lookup.booker', 'Người đặt:', 'Booked by:', '预订人：', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(221, 'lookup.bookingCode', 'lookup.bookingCode', 'Mã đơn:', 'Booking Code:', '预订代码：', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(222, 'lookup.bookingDetails', 'lookup.bookingDetails', 'Thông tin đặt tour chi tiết', 'Detailed Booking Information', '预订详细信息', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(223, 'lookup.children', 'lookup.children', 'Trẻ em:', 'Children:', '儿童：', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(224, 'lookup.collapse', 'lookup.collapse', 'Thu gọn', 'Collapse', '收起', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(225, 'lookup.contactForQuote', 'lookup.contactForQuote', 'Liên hệ để nhận báo giá', 'Contact for quote', '联系获取报价', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(226, 'lookup.contactInfo', 'lookup.contactInfo', 'Thông tin liên hệ', 'Contact Information', '联系方式', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(227, 'lookup.createdDate', 'lookup.createdDate', 'Ngày lập đơn', 'Created Date', '创建日期', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(228, 'lookup.customerNote', 'lookup.customerNote', 'Ghi chú từ khách hàng', 'Customer Note', '客户备注', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(229, 'lookup.days', 'lookup.days', 'ngày', 'days', '天', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(230, 'lookup.departure', 'lookup.departure', 'Khởi hành:', 'Departure:', '出发：', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(231, 'lookup.duration', 'lookup.duration', 'Thời lượng:', 'Duration:', '时长：', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(232, 'lookup.email', 'lookup.email', 'Email', 'Email', '电子邮件', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(233, 'lookup.errEmailFormat', 'lookup.errEmailFormat', 'Sai định dạng email (VD: abc@gmail.com)', 'Invalid email format (e.g. abc@gmail.com)', '电子邮件格式无效（例如 abc@gmail.com）', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(234, 'lookup.errEmailRequired', 'lookup.errEmailRequired', 'Vui lòng nhập email', 'Please enter an email', '请输入电子邮件', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(235, 'lookup.errPhoneFormat', 'lookup.errPhoneFormat', 'Vui lòng nhập số điện thoại hợp lệ (từ 9 số)', 'Please enter a valid phone number (at least 9 digits)', '请输入有效的电话号码（至少 9 位数字）', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(236, 'lookup.errPhoneRequired', 'lookup.errPhoneRequired', 'Vui lòng nhập số điện thoại', 'Please enter a phone number', '请输入电话号码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(237, 'lookup.estimatedTotal', 'lookup.estimatedTotal', 'Tổng tiền dự kiến', 'Estimated Total', '预计总计', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(238, 'lookup.infants', 'lookup.infants', 'Trẻ nhỏ:', 'Infants:', '婴儿：', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(239, 'lookup.itineraryDetails', 'lookup.itineraryDetails', 'Chi tiết lịch trình', 'Itinerary Details', '行程详情', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(240, 'lookup.lookupBooking', 'lookup.lookupBooking', 'Tra Cứu Đơn Đặt Tour', 'Lookup Booking', '查询预订', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(241, 'lookup.lookupDesc', 'lookup.lookupDesc', 'Nhập email và số điện thoại đã sử dụng khi đặt tour để xem chi tiết lịch trình của bạn.', 'Enter the email and phone number used when booking to view your itinerary details.', '输入预订时使用的电子邮件和电话号码，以查看您的行程详情。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(242, 'lookup.lookupError', 'lookup.lookupError', 'Có lỗi xảy ra khi tra cứu. Vui lòng thử lại sau.', 'An error occurred while searching. Please try again later.', '查询时出错。请稍后再试。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(243, 'lookup.nights', 'lookup.nights', 'đêm', 'nights', '晚', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(244, 'lookup.noBookingsDesc', 'lookup.noBookingsDesc', 'Vui lòng kiểm tra lại email hoặc số điện thoại bạn đã điền hoặc liên hệ hotline để được hỗ trợ.', 'Please double-check the email or phone number you entered, or contact our hotline for support.', '请仔细检查您输入的电子邮件或电话号码，或联系我们的热线寻求支持。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(245, 'lookup.noBookingsFound', 'lookup.noBookingsFound', 'Không tìm thấy đơn đặt tour nào', 'No bookings found', '未找到预订', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(246, 'lookup.noRequest', 'lookup.noRequest', 'Không có yêu cầu', 'No request', '无要求', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(247, 'lookup.notDetermined', 'lookup.notDetermined', 'Chưa xác định', 'Not determined', '未确定', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(248, 'lookup.participants', 'lookup.participants', 'Số người tham gia', 'Participants', '参与者', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(249, 'lookup.phoneNumber', 'lookup.phoneNumber', 'Số điện thoại', 'Phone Number', '电话号码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(250, 'lookup.pickupPoint', 'lookup.pickupPoint', 'Điểm đón:', 'Pickup Point:', '接送点：', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(251, 'lookup.searchNow', 'lookup.searchNow', 'Tra cứu ngay', 'Search Now', '立即查询', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(252, 'lookup.searchResults', 'lookup.searchResults', 'Kết quả tra cứu ({{count}} đơn)', 'Search results ({{count}} bookings)', '查询结果（{{count}} 个预订）', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(253, 'lookup.searching', 'lookup.searching', 'Đang tra cứu...', 'Searching...', '查询中...', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(254, 'lookup.statusCancelled', 'lookup.statusCancelled', 'Đã hủy', 'Cancelled', '已取消', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(255, 'lookup.statusCompleted', 'lookup.statusCompleted', 'Hoàn thành', 'Completed', '已完成', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(256, 'lookup.statusPending', 'lookup.statusPending', 'Đang xử lý', 'Pending', '处理中', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(257, 'lookup.tourNameNotUpdated', 'lookup.tourNameNotUpdated', 'Tour chưa cập nhật tên', 'Tour name not updated', '行程名称未更新', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(258, 'lookup.viewDetails', 'lookup.viewDetails', 'Xem chi tiết', 'View Details', '查看详情', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(259, 'notification.emptyDescription', 'notification.emptyDescription', 'Khi có lượt thích, phản hồi bình luận hoặc cập nhật đặt tour, thông báo sẽ xuất hiện ở đây.', 'Likes, comment replies, and booking updates will appear here.', '点赞、评论回复和预订更新会显示在这里。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(260, 'notification.emptyTitle', 'notification.emptyTitle', 'Bạn chưa có thông báo nào', 'You do not have any notifications yet', '您还没有通知', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(261, 'notification.fetchError', 'notification.fetchError', 'Không thể tải danh sách thông báo.', 'Unable to load notifications.', '无法加载通知列表。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(262, 'notification.markAllRead', 'notification.markAllRead', 'Đánh dấu tất cả đã đọc', 'Mark all as read', '全部标为已读', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(263, 'notification.markAllReadSuccess', 'notification.markAllReadSuccess', 'Đã đánh dấu tất cả thông báo là đã đọc', 'All notifications have been marked as read', '所有通知已标为已读', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(264, 'notification.markReadError', 'notification.markReadError', 'Không thể cập nhật trạng thái thông báo.', 'Unable to update notification status.', '无法更新通知状态。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(265, 'notification.nextPage', 'notification.nextPage', 'Trang sau', 'Next page', '下一页', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(266, 'notification.openNotifications', 'notification.openNotifications', 'Mở thông báo', 'Open notifications', '打开通知', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(267, 'notification.pageSubtitle', 'notification.pageSubtitle', '{{count}} thông báo trong tài khoản của bạn', '{{count}} notifications in your account', '您的账户中有 {{count}} 条通知', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(268, 'notification.pageTitle', 'notification.pageTitle', 'Tất cả thông báo', 'All Notifications', '所有通知', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(269, 'notification.previousPage', 'notification.previousPage', 'Trang trước', 'Previous page', '上一页', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(270, 'notification.retry', 'notification.retry', 'Thử lại', 'Try again', '重试', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(271, 'notification.title', 'notification.title', 'Thông báo', 'Notifications', '通知', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(272, 'notification.viewAll', 'notification.viewAll', 'Xem tất cả thông báo', 'View all notifications', '查看所有通知', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(273, 'profile.changePassword', 'profile.changePassword', 'Đổi mật khẩu', 'Change Password', '修改密码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(274, 'profile.confirmNewPassword', 'profile.confirmNewPassword', 'Xác nhận mật khẩu mới', 'Confirm New Password', '确认新密码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(275, 'profile.currentPassword', 'profile.currentPassword', 'Mật khẩu hiện tại', 'Current Password', '当前密码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(276, 'profile.emailReadOnly', 'profile.emailReadOnly', 'Email (Không thể thay đổi)', 'Email (Read-only)', '邮箱（不可修改）', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(277, 'profile.fullName', 'profile.fullName', 'Họ và tên', 'Full Name', '姓名', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(278, 'profile.invalidPhone', 'profile.invalidPhone', 'Số điện thoại không hợp lệ (10-11 số)', 'Invalid phone number (10-11 digits)', '电话号码无效（10-11位数字）', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(279, 'profile.myAccount', 'profile.myAccount', 'Tài khoản của tôi', 'My Account', '我的账户', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(280, 'profile.newPassword', 'profile.newPassword', 'Mật khẩu mới', 'New Password', '新密码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(281, 'profile.passwordChangeFail', 'profile.passwordChangeFail', 'Đổi mật khẩu thất bại', 'Password change failed', '密码修改失败', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(282, 'profile.passwordChangeSuccess', 'profile.passwordChangeSuccess', 'Đổi mật khẩu thành công!', 'Password changed successfully!', '密码修改成功！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(283, 'profile.passwordMismatch', 'profile.passwordMismatch', 'Mật khẩu xác nhận không khớp', 'Passwords do not match', '两次密码不一致', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(284, 'profile.passwordRequirements', 'profile.passwordRequirements', 'Mật khẩu mới phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt', 'New password must be at least 8 characters, including 1 uppercase, 1 lowercase, 1 number, and 1 special character', '新密码至少8个字符，包含至少1个大写字母、1个小写字母、1个数字和1个特殊字符', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(285, 'profile.personalInfo', 'profile.personalInfo', 'Thông tin cá nhân', 'Personal Information', '个人信息', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(286, 'profile.phoneNumber', 'profile.phoneNumber', 'Số điện thoại', 'Phone Number', '电话号码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(287, 'profile.profileUpdateFail', 'profile.profileUpdateFail', 'Cập nhật thất bại', 'Update failed', '更新失败', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(288, 'profile.profileUpdateSuccess', 'profile.profileUpdateSuccess', 'Cập nhật hồ sơ thành công!', 'Profile updated successfully!', '个人资料更新成功！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(289, 'profile.saveChanges', 'profile.saveChanges', 'Lưu thay đổi', 'Save Changes', '保存更改', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(290, 'profile.updatePassword', 'profile.updatePassword', 'Cập nhật mật khẩu', 'Update Password', '更新密码', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(291, 'profile.uploadAvatar', 'profile.uploadAvatar', 'Tải ảnh đại diện', 'Upload Avatar', '上传头像', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(292, 'tour.card.contact', 'tour.card.contact', 'Liên hệ', 'Contact', '联系', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(293, 'tour.card.durationDays', 'tour.card.durationDays', '{{days}} Ngày', '{{days}} Days', '{{days}} 天', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(294, 'tour.card.durationDaysNights', 'tour.card.durationDaysNights', '{{days}} Ngày {{nights}} Đêm', '{{days}} Days {{nights}} Nights', '{{days}} 天 {{nights}} 晚', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(295, 'tour.card.featured', 'tour.card.featured', 'Nổi bật', 'Featured', '精选', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(296, 'tour.card.from', 'tour.card.from', 'Giá từ', 'From', '起价', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(297, 'tour.card.promotion', 'tour.card.promotion', 'Khuyến mãi', 'Promotion', '促销', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(298, 'tour.detail.cancellationPolicy', 'tour.detail.cancellationPolicy', 'Quy định hoàn hủy', 'Cancellation Policy', '取消政策', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(299, 'tour.detail.communityReviews', 'tour.detail.communityReviews', 'Đánh giá cộng đồng ({{count}})', 'Community Reviews ({{count}})', '社区评价（{{count}}）', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(300, 'tour.detail.customer', 'tour.detail.customer', 'Khách hàng', 'Customer', '客户', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(301, 'tour.detail.customerExperience', 'tour.detail.customerExperience', 'Trải nghiệm thực tế từ khách hàng', 'Customer Experiences', '客户体验', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(302, 'tour.detail.customerExperienceDesc', 'tour.detail.customerExperienceDesc', 'Những chia sẻ chân thực từ khách hàng trên toàn hệ thống', 'Authentic shares from customers across the system', '来自系统内客户的真实分享', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(303, 'tour.detail.defaultReviewComment', 'tour.detail.defaultReviewComment', 'Chuyến đi thật tuyệt vời! Mọi thứ từ khách sạn đến hướng dẫn viên đều vượt mong đợi. Chắc chắn tôi sẽ đặt thêm nhiều tour nữa tại đây.', 'The trip was wonderful! Everything from the hotel to the tour guide exceeded expectations. I will definitely book more tours here.', '这次旅行非常棒！从酒店到导游，一切都超出预期。我一定会继续在这里预订更多旅游。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(304, 'tour.detail.defaultReviewTour', 'tour.detail.defaultReviewTour', 'Tour Khuyến Mãi Đặc Biệt', 'Special Promotion Tour', '特别促销旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(305, 'tour.detail.highlights', 'tour.detail.highlights', 'Điểm nổi bật', 'Highlights', '亮点', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(306, 'tour.detail.itinerary', 'tour.detail.itinerary', 'Lịch trình chi tiết', 'Detailed Itinerary', '详细行程', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(307, 'tour.detail.mockReviews', 'tour.detail.mockReviews', '[object Object],[object Object],[object Object]', '[object Object],[object Object],[object Object]', '[object Object],[object Object],[object Object]', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(308, 'tour.detail.nextRelatedTours', 'tour.detail.nextRelatedTours', 'Xem tour liên quan tiếp theo', 'View next related tours', '查看下一个相关旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(309, 'tour.detail.noCommunityReviews', 'tour.detail.noCommunityReviews', 'Chưa có đánh giá nào. Hãy là người đầu tiên!', 'No reviews yet. Be the first to share your experience!', '暂无评价。成为第一个分享体验的人吧！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(310, 'tour.detail.notFoundDesc', 'tour.detail.notFoundDesc', 'Tour này có thể đã ngừng hoặc không tồn tại.', 'This tour may have been discontinued or does not exist.', '此旅游可能已停止或不存在。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(311, 'tour.detail.perPerson', 'tour.detail.perPerson', '/người', '/person', '/人', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(312, 'tour.detail.photos', 'tour.detail.photos', 'Ảnh', 'Photos', '照片', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(313, 'tour.detail.prevRelatedTours', 'tour.detail.prevRelatedTours', 'Xem tour liên quan trước đó', 'View previous related tours', '查看上一个相关旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(314, 'tour.detail.priceExcludes', 'tour.detail.priceExcludes', 'Giá không bao gồm', 'Price Excludes', '价格不包含', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(315, 'tour.detail.priceIncludes', 'tour.detail.priceIncludes', 'Giá bao gồm', 'Price Includes', '价格包含', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(316, 'tour.detail.relatedTours', 'tour.detail.relatedTours', 'Tour liên quan dành cho bạn', 'Related Tours for You', '为您推荐的相关旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(317, 'tour.detail.relatedToursDesc', 'tour.detail.relatedToursDesc', 'Gợi ý theo cùng loại tour, tour nổi bật và các ưu đãi đang mở bán', 'Suggested by tour type, featured picks, and active deals', '根据同类旅游、精选产品和当前优惠为您推荐', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(318, 'tour.detail.sortLabel', 'tour.detail.sortLabel', 'Sắp xếp', 'Sort', '排序', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(319, 'tour.detail.sortNewest', 'tour.detail.sortNewest', 'Mới nhất', 'Newest', '最新', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(320, 'tour.detail.suggested', 'tour.detail.suggested', 'Gợi ý', 'Suggested', '推荐', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(321, 'tour.detail.termsNotes', 'tour.detail.termsNotes', 'Điều khoản & Lưu ý', 'Terms & Notes', '条款和注意事项', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(322, 'tour.filter.all', 'tour.filter.all', 'Tất cả', 'All', '全部', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(323, 'tour.filter.badgeFeatured', 'tour.filter.badgeFeatured', 'Tour nổi bật', 'Featured tours', '精选旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(324, 'tour.filter.badgePromotion', 'tour.filter.badgePromotion', 'Tour ưu đãi', 'Promotional tours', '促销旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(325, 'tour.filter.budget10To20M', 'tour.filter.budget10To20M', '10 - 20 triệu', '10 - 20 million', '1000万 - 2000万', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(326, 'tour.filter.budget5To10M', 'tour.filter.budget5To10M', '5 - 10 triệu', '5 - 10 million', '500万 - 1000万', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(327, 'tour.filter.budgetOver20M', 'tour.filter.budgetOver20M', 'Trên 20 triệu', 'Over 20 million', '2000万以上', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(328, 'tour.filter.budgetUnder5M', 'tour.filter.budgetUnder5M', 'Dưới 5 triệu', 'Under 5 million', '500万以下', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(329, 'tour.list.allDesc', 'tour.list.allDesc', 'Khám phá những hành trình phù hợp nhất với bạn', 'Discover the best journeys for you', '发现最适合您的旅程', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(330, 'tour.list.allLabel', 'tour.list.allLabel', 'Kết quả tìm kiếm', 'Search Results', '搜索结果', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(331, 'tour.list.apply', 'tour.list.apply', 'Áp dụng', 'Apply', '应用', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(332, 'tour.list.changeFilter', 'tour.list.changeFilter', 'Thử thay đổi bộ lọc để xem thêm kết quả', 'Try changing the filters to see more results', '尝试更改过滤器以查看更多结果', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(333, 'tour.list.clearAll', 'tour.list.clearAll', 'Xóa tất cả', 'Clear all', '全部清除', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(334, 'tour.list.clearFilterBtn', 'tour.list.clearFilterBtn', 'Xóa bộ lọc', 'Clear filters', '清除过滤器', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(335, 'tour.list.domesticDesc', 'tour.list.domesticDesc', 'Khám phá vẻ đẹp Việt Nam từ Bắc đến Nam', 'Discover the beauty of Vietnam from North to South', '探索从北到南的越南之美', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(336, 'tour.list.domesticLabel', 'tour.list.domesticLabel', 'Tour Nội Địa', 'Domestic Tours', '国内游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(337, 'tour.list.filterBtn', 'tour.list.filterBtn', 'Bộ lọc', 'Filters', '过滤器', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(338, 'tour.list.filterBudget', 'tour.list.filterBudget', 'Ngân sách', 'Budget', '预算', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(339, 'tour.list.filterDepartureDate', 'tour.list.filterDepartureDate', 'Ngày khởi hành', 'Departure Date', '出发日期', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(340, 'tour.list.filterDeparturePoint', 'tour.list.filterDeparturePoint', 'Điểm khởi hành', 'Departure Point', '出发地', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(341, 'tour.list.filterDestination', 'tour.list.filterDestination', 'Điểm đến', 'Destination', '目的地', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(342, 'tour.list.filterSort', 'tour.list.filterSort', 'Sắp xếp theo', 'Sort by', '排序方式', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(343, 'tour.list.filterTitle', 'tour.list.filterTitle', 'Bộ lọc tìm kiếm', 'Search Filters', '搜索过滤器', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(344, 'tour.list.filterType', 'tour.list.filterType', 'Loại tour', 'Tour Type', '旅游类型', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(345, 'tour.list.internationalDesc', 'tour.list.internationalDesc', 'Trải nghiệm văn hóa đa dạng khắp thế giới', 'Experience diverse cultures around the world', '体验世界各地不同的文化', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(346, 'tour.list.internationalLabel', 'tour.list.internationalLabel', 'Tour Quốc Tế', 'International Tours', '国际游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(347, 'tour.list.noResults', 'tour.list.noResults', 'Không tìm thấy tour', 'No tours found', '未找到旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(348, 'tour.list.showingResults', 'tour.list.showingResults', 'Hiển thị {{count}} / {{total}} tour', 'Showing {{count}} / {{total}} tours', '显示 {{count}} / {{total}} 个旅游', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(349, 'tour.review.addImage', 'tour.review.addImage', 'Thêm ảnh', 'Add photo', '添加照片', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(350, 'tour.review.cannotCheckEligibility', 'tour.review.cannotCheckEligibility', 'Không thể kiểm tra quyền đánh giá.', 'Unable to check review eligibility.', '无法检查评价资格。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(351, 'tour.review.checkingEligibility', 'tour.review.checkingEligibility', 'Đang kiểm tra quyền đánh giá...', 'Checking review eligibility...', '正在检查评价资格...', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(352, 'tour.review.commentPlaceholder', 'tour.review.commentPlaceholder', 'Nhận xét của bạn...', 'Your comment...', '您的评论...', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(353, 'tour.review.formTitle', 'tour.review.formTitle', 'Gửi đánh giá của bạn', 'Send your review', '提交您的评价', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(354, 'tour.review.genericError', 'tour.review.genericError', 'Có lỗi xảy ra', 'Something went wrong', '发生错误', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(355, 'tour.review.imagesLabel', 'tour.review.imagesLabel', 'Hình ảnh thực tế (tối đa 5 ảnh)', 'Real photos (up to 5 images)', '真实照片（最多 5 张）', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(356, 'tour.review.loginDesc', 'tour.review.loginDesc', 'Bạn cần đăng nhập để có thể gửi nhận xét và hình ảnh cho tour này.', 'You need to sign in to submit comments and photos for this tour.', '您需要登录后才能为此旅游提交评论和图片。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(357, 'tour.review.loginTitle', 'tour.review.loginTitle', 'Đăng nhập để đánh giá', 'Sign in to review', '登录后评价', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(358, 'tour.review.maxImages', 'tour.review.maxImages', 'Bạn chỉ được tải lên tối đa 5 hình ảnh.', 'You can upload up to 5 images.', '最多只能上传 5 张图片。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(359, 'tour.review.notEligibleTitle', 'tour.review.notEligibleTitle', 'Chưa thể đánh giá', 'Review not available yet', '暂时无法评价', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(360, 'tour.review.pendingApproval', 'tour.review.pendingApproval', 'Đánh giá của bạn đang chờ duyệt và sẽ hiển thị sau khi được phê duyệt.', 'Your review is pending approval and will appear after it is approved.', '您的评价正在等待审核，审核通过后将显示。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(361, 'tour.review.ratingLabel', 'tour.review.ratingLabel', 'Đánh giá sao', 'Star rating', '星级评分', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(362, 'tour.review.ratingRequired', 'tour.review.ratingRequired', 'Vui lòng chọn số sao', 'Please select a star rating', '请选择星级评分', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(363, 'tour.review.reasons.alreadyReviewed', 'tour.review.reasons.alreadyReviewed', 'Bạn đã đánh giá tour này rồi.', 'You have already reviewed this tour.', '您已经评价过此旅游。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(364, 'tour.review.reasons.bookingRequired', 'tour.review.reasons.bookingRequired', 'Bạn cần có booking đã được duyệt cho tour này để đánh giá.', 'You need an approved booking for this tour before you can review it.', '您需要有此旅游的已批准预订后才能评价。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(365, 'tour.review.reasons.tourNotFinished', 'tour.review.reasons.tourNotFinished', 'Bạn chỉ có thể đánh giá sau khi chuyến du lịch kết thúc.', 'You can only review after the trip has ended.', '您只能在行程结束后进行评价。', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(366, 'tour.review.submit', 'tour.review.submit', 'Gửi đánh giá', 'Submit review', '提交评价', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(367, 'tour.review.submitting', 'tour.review.submitting', 'Đang gửi...', 'Submitting...', '正在提交...', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(368, 'tour.review.thankYou', 'tour.review.thankYou', 'Cảm ơn bạn đã đánh giá!', 'Thank you for your review!', '感谢您的评价！', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(369, 'tour.sort.dateAsc', 'tour.sort.dateAsc', 'Ngày khởi hành gần nhất', 'Earliest Departure', '最早出发', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(370, 'tour.sort.default', 'tour.sort.default', 'Mặc định', 'Default', '默认', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(371, 'tour.sort.priceAsc', 'tour.sort.priceAsc', 'Giá thấp → cao', 'Price: Low to High', '价格：从低到高', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(372, 'tour.sort.priceDesc', 'tour.sort.priceDesc', 'Giá cao → thấp', 'Price: High to Low', '价格：从高到低', '2026-07-21 21:41:05', '2026-07-21 21:41:05'),
	(373, 'admin.translations.subtitle', 'admin.translations.subtitle', 'Quản lý Translate VI,EN,ZH', 'Manage Translate VI,EN,ZH', 'Manage Translate VI,EN,ZH', '2026-07-21 22:07:06', '2026-07-21 22:07:06');

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
  `is_active` tinyint(4) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `language` varchar(10) NOT NULL DEFAULT 'vi',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`),
  UNIQUE KEY `phone_number_2` (`phone_number`),
  KEY `role_id` (`role_id`),
  KEY `email_2` (`email`),
  CONSTRAINT `fk_user` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.users: ~17 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `role_id`, `full_name`, `email`, `password`, `phone_number`, `avatar_url`, `is_active`, `last_login`, `created_at`, `updated_at`, `language`) VALUES
	(1, 1, 'Quản Trị Viên', '1@gmail.com', '$2a$12$9PTNubZ9YiqLA0fE4dKvROIcct3pSzRG0JZx7UVL8y9lhVQBJeDw.', '0901234567', '/uploads/avatars/avatar-1-1774261565350-737873517.jpg', 1, '2026-11-14 09:02:55', '2026-03-02 09:21:46', '2026-04-01 16:10:10', 'vi'),
	(2, 2, 'Nguyễn Văn A', 'nguyenvana@gmail.com', '$2y$10$abcdefghijklmnopqrstuv', '0912345678', 'https://ui-avatars.com/api/?name=Nguyễn+A', 1, NULL, '2026-03-02 09:21:46', '2026-03-02 09:21:46', 'vi'),
	(3, 2, 'Trần Thị B', 'tranthib@gmail.com', '$2y$10$abcdefghijklmnopqrstuv', '0987654321', 'https://ui-avatars.com/api/?name=Trần+B', 1, NULL, '2026-03-02 09:21:46', '2026-03-02 09:21:46', 'vi'),
	(7, 1, 'minhtuyen', 'minhtuyenk201@gmail.com', '$2a$12$y7JNSGrtvndiRqNAx2fN9eomoC0x/eCCKIpggIyfwhiReTGr3LZjC', NULL, '/uploads/avatars/avatar-7-1777293312005-679122399.jpg', 1, '2026-07-05 11:38:03', '2026-03-11 22:11:21', '2026-04-27 19:35:12', 'vi'),
	(11, 2, 'Cường Trần', 'tranhungcuong31720@gmail.com', '$2a$12$USBvRGkNzIAk2jzWr.F6JesYjVrzhZEWxlT/pKMS4gxVrpcbr2A82', '0978818244', NULL, 1, NULL, '2026-09-09 16:44:46', '2026-09-09 16:44:46', 'en'),
	(17, 2, 'Cường Trần', 'cuong3172002acc1@gmail.com', '$2a$12$6oMYBhFSAyLPNrCtxFF.X.1bwtpjZ/YVupyTjOGULcJ907svk.5nC', '0978818243', NULL, 1, NULL, '2026-09-09 16:58:22', '2026-09-09 16:58:22', 'en'),
	(18, 2, 'Khach Hang', 'user_1788947911660@example.com', '$2a$12$9NTiRnHzyKp.tkE7UCXNNuY2iHTKjsb/Vp3omXD62pxragEc1u3mq', '0947911660', NULL, 0, NULL, '2026-09-09 16:58:32', '2026-09-09 16:58:32', 'vi'),
	(19, 2, 'Trần Văn Bình', 'tranbinh19@example.com', '$2a$12$6oMYBhFSAyLPNrCtxFF.X.1bwtpjZ/YVupyTjOGULcJ907svk.5nC', '0901000019', NULL, 1, NULL, '2026-09-09 16:58:22', '2026-09-09 16:58:22', 'en'),
	(20, 2, 'Lê Minh Đức', 'leduc20@example.com', '$2a$12$6oMYBhFSAyLPNrCtxFF.X.1bwtpjZ/YVupyTjOGULcJ907svk.5nC', '0901000020', NULL, 1, NULL, '2026-09-09 16:58:22', '2026-09-09 16:58:22', 'en'),
	(21, 2, 'Phạm Quốc Huy', 'phamhuy21@example.com', '$2a$12$6oMYBhFSAyLPNrCtxFF.X.1bwtpjZ/YVupyTjOGULcJ907svk.5nC', '0901000021', NULL, 1, NULL, '2026-09-09 16:58:22', '2026-09-09 16:58:22', 'en'),
	(22, 2, 'Hoàng Văn Nam', 'hoangnam22@example.com', '$2a$12$6oMYBhFSAyLPNrCtxFF.X.1bwtpjZ/YVupyTjOGULcJ907svk.5nC', '0901000022', NULL, 1, NULL, '2026-09-09 16:58:22', '2026-09-09 16:58:22', 'en'),
	(23, 2, 'Đỗ Minh Quân', 'doquan23@example.com', '$2a$12$6oMYBhFSAyLPNrCtxFF.X.1bwtpjZ/YVupyTjOGULcJ907svk.5nC', '0901000023', NULL, 1, NULL, '2026-09-09 16:58:22', '2026-09-09 16:58:22', 'en'),
	(24, 2, 'Vũ Thành Long', 'vulong24@example.com', '$2a$12$6oMYBhFSAyLPNrCtxFF.X.1bwtpjZ/YVupyTjOGULcJ907svk.5nC', '0901000024', NULL, 1, NULL, '2026-09-09 16:58:22', '2026-09-09 16:58:22', 'en'),
	(25, 2, 'Bùi Anh Tuấn', 'buituan25@example.com', '$2a$12$6oMYBhFSAyLPNrCtxFF.X.1bwtpjZ/YVupyTjOGULcJ907svk.5nC', '0901000025', NULL, 1, NULL, '2026-09-09 16:58:22', '2026-09-09 16:58:22', 'en'),
	(26, 2, 'Ngô Đức Anh', 'ngoanh26@example.com', '$2a$12$6oMYBhFSAyLPNrCtxFF.X.1bwtpjZ/YVupyTjOGULcJ907svk.5nC', '0901000026', NULL, 1, NULL, '2026-09-09 16:58:22', '2026-09-09 16:58:22', 'en'),
	(27, 2, 'Đặng Minh Khoa', 'dangkhoa27@example.com', '$2a$12$6oMYBhFSAyLPNrCtxFF.X.1bwtpjZ/YVupyTjOGULcJ907svk.5nC', '0901000027', NULL, 1, NULL, '2026-09-09 16:58:22', '2026-09-09 16:58:22', 'en'),
	(28, 2, 'Nguyễn Văn An', 'nguyenan18@example.com', '$2a$12$6oMYBhFSAyLPNrCtxFF.X.1bwtpjZ/YVupyTjOGULcJ907svk.5nC', '0901000018', NULL, 1, NULL, '2026-09-09 16:58:22', '2026-09-09 16:58:22', 'en');

-- Dumping structure for table db_marketing_tour.votes
DROP TABLE IF EXISTS `votes`;
CREATE TABLE IF NOT EXISTS `votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL COMMENT 'id tour vote',
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `is_approved` tinyint(4) DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `likes_count` int(11) DEFAULT 0,
  `admin_reply` text DEFAULT NULL,
  `admin_reply_at` datetime DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tour_id` (`tour_id`),
  CONSTRAINT `fk_vote` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.votes: ~27 rows (approximately)
DELETE FROM `votes`;
INSERT INTO `votes` (`id`, `tour_id`, `customer_name`, `customer_email`, `rating`, `comment`, `is_approved`, `created_at`, `images`, `likes_count`, `admin_reply`, `admin_reply_at`, `parent_id`, `user_id`) VALUES
	(1, 1, 'A', 'a@mail.com', 5, 'Rất tốt', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(2, 2, 'B', 'b@mail.com', 4, 'Ổn áp', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(3, 3, 'C', 'c@mail.com', 5, 'Tuyệt vời', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(4, 4, 'D', 'd@mail.com', 3, 'Bình thường', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(5, 5, 'E', 'e@mail.com', 5, 'Rất đáng tiền', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(6, 6, 'F', 'f@mail.com', 4, 'Ok', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(7, 7, 'G', 'g@mail.com', 5, 'Xuất sắc', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(8, 8, 'H', 'h@mail.com', 4, 'Tốt', 1, '2026-04-02 18:56:57', NULL, 1, NULL, NULL, NULL, NULL),
	(9, 9, 'I', 'i@mail.com', 3, 'Tạm', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(10, 10, 'K', 'k@mail.com', 5, 'Đỉnh', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(11, 11, 'L', 'l@mail.com', 4, 'Hài lòng', 1, '2026-04-02 18:56:57', NULL, 1, NULL, NULL, NULL, NULL),
	(12, 1, 'M', 'm@mail.com', 5, 'Rất đẹp', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(13, 2, 'N', 'n@mail.com', 4, 'Được', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(14, 3, 'O', 'o@mail.com', 5, 'Rất ok', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(15, 4, 'P', 'p@mail.com', 3, 'Chấp nhận', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(16, 5, 'Q', 'q@mail.com', 5, 'Best', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(17, 6, 'R', 'r@mail.com', 4, 'Nice', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(18, 7, 'S', 's@mail.com', 5, 'Good', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(19, 8, 'T', 't@mail.com', 4, 'Ổn', 1, '2026-04-02 18:56:57', NULL, 1, NULL, NULL, NULL, NULL),
	(20, 9, 'U', 'u@mail.com', 3, 'Trung bình', 1, '2026-04-02 18:56:57', NULL, 0, NULL, NULL, NULL, NULL),
	(21, 4, 'minhtuyen', 'minhtuyenk201@gmail.com', 4, NULL, 1, '2026-04-18 22:15:50', NULL, 0, NULL, NULL, NULL, 7),
	(23, 13, 'minhtuyen', 'minhtuyenk201@gmail.com', 5, NULL, 1, '2026-04-27 16:15:26', '["/uploads/votes/vote-1777281326336-88179091.jpg"]', 2, NULL, NULL, NULL, 7),
	(24, 13, 'minhtuyen', 'minhtuyenk201@gmail.com', 0, 'nice', 1, '2026-04-27 16:37:27', NULL, 0, NULL, NULL, 23, 7),
	(25, 13, 'minhtuyen', 'minhtuyenk201@gmail.com', 0, '@minhtuyen really', 1, '2026-04-27 16:39:10', NULL, 1, NULL, NULL, 23, 7),
	(26, 13, 'minhtuyen', 'minhtuyenk201@gmail.com', 0, 'aaaaaaa\r\n', 1, '2026-04-27 17:09:55', NULL, 0, NULL, NULL, 23, 7),
	(27, 13, 'minhtuyen', 'minhtuyenk201@gmail.com', 0, '@minhtuyen \naaaaa', 1, '2026-04-27 19:37:27', NULL, 0, NULL, NULL, 23, 7),
	(28, 13, 'minhtuyen', 'minhtuyenk201@gmail.com', 5, 'nice', 1, '2026-04-27 19:38:06', NULL, 0, NULL, NULL, NULL, 7);

-- Dumping structure for table db_marketing_tour.vote_likes
DROP TABLE IF EXISTS `vote_likes`;
CREATE TABLE IF NOT EXISTS `vote_likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vote_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`vote_id`,`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.vote_likes: ~2 rows (approximately)
DELETE FROM `vote_likes`;
INSERT INTO `vote_likes` (`id`, `vote_id`, `user_id`, `created_at`) VALUES
	(2, 8, 8, '2026-06-13 09:27:34'),
	(3, 19, 8, '2026-06-13 09:27:36');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
