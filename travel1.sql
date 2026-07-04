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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.banners: ~6 rows (approximately)
DELETE FROM `banners`;
INSERT INTO `banners` (`id`, `tour_id`, `title`, `image_url`, `target_link`, `position`, `is_active`, `created_at`, `updated_at`) VALUES
	(7, 2, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park', '/uploads/banners/banner-1777299559761-562877284.jpg', '/tours/nghi-duong-phu-quoc-hon-thom', 'hero', 1, '2026-04-01 11:54:59', '2026-04-27 14:19:19'),
	(9, 11, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park', '/uploads/banners/banner-1777476492776-338103359.jpg', '/tours/nghi-duong-phu-quoc-hon-thom2', 'hero', 1, '2026-04-29 15:28:12', '2026-04-29 15:28:12'),
	(12, 10, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park', '/uploads/banners/banner-1777476549017-229992436.jpg', '/tours/nghi-duong-phu-quoc-hon-thom1', 'hero', 1, '2026-04-29 15:29:09', '2026-04-29 15:29:09'),
	(13, 9, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan', '/uploads/banners/banner-1777476550442-669196842.jpg', '/tours/tour-kham-pha-sapa-chinh-phuc-fansipan2', 'hero', 1, '2026-04-29 15:29:10', '2026-04-29 15:29:10'),
	(14, 8, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan', '/uploads/banners/banner-1777476550894-892454798.jpg', '/tours/tour-kham-pha-sapa-chinh-phuc-fansipan1', 'hero', 1, '2026-04-29 15:29:10', '2026-04-29 15:29:10'),
	(18, 15, 'Tour Đài Loan 5N4Đ: HCM - Cao Hùng - Đài Trung - Đài Bắc - Thủy Cung X-park', '/uploads/banners/banner-1778326102895-854054055.jpg', '/tours/tour-dai-loan-5n4d-hcm-cao-hung-dai-trung-dai-bac-thuy-cung-x-park', 'hero', 1, '2026-05-09 11:28:22', '2026-05-09 11:28:22');

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.booking_options: ~3 rows (approximately)
DELETE FROM `booking_options`;
INSERT INTO `booking_options` (`id`, `booking_id`, `option_name`, `price`, `quantity`, `total`) VALUES
	(3, 23, 'Lặn biển', 1000000.00, 1, 1000000.00),
	(4, 32, 'Golf', 2000000.00, 15, 30000000.00),
	(5, 32, 'Ăn tối BBQ', 600000.00, 15, 9000000.00);

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
  `departure_date` date DEFAULT NULL,
  `adult_count` int(11) NOT NULL DEFAULT 1,
  `child_count` int(11) NOT NULL DEFAULT 0,
  `infant_count` int(11) NOT NULL DEFAULT 0,
  `status` enum('pending','contacted','approved','cancelled') DEFAULT 'pending',
  `tour_title_snapshot` varchar(500) DEFAULT NULL,
  `departure_date_snapshot` date DEFAULT NULL,
  `adult_price_snapshot` decimal(12,2) DEFAULT NULL,
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
  CONSTRAINT `bk_depa` FOREIGN KEY (`departure_id`) REFERENCES `tour_departures` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `bk_pick` FOREIGN KEY (`pickup_location_id`) REFERENCES `tour_pickup_locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bk_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.bookings: ~25 rows (approximately)
DELETE FROM `bookings`;
INSERT INTO `bookings` (`id`, `user_id`, `tour_id`, `departure_id`, `pickup_location_id`, `booking_code`, `customer_name`, `customer_email`, `customer_phone`, `adult_qty`, `child_qty`, `infant_qty`, `customer_note`, `departure_date`, `adult_count`, `child_count`, `infant_count`, `status`, `tour_title_snapshot`, `departure_date_snapshot`, `adult_price_snapshot`, `child_price_snapshot`, `infant_price_snapshot`, `pickup_location_snapshot`, `pickup_price_snapshot`, `total_price`, `admin_note`, `created_at`, `updated_at`) VALUES
	(1, 2, 1, 1, 1, 'BK001', 'Nguyễn Văn A', 'a@gmail.com', '0911111111', 2, 1, 0, NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 3', '2026-05-01', 3500000.00, 2500000.00, 500000.00, NULL, NULL, 9500000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(2, 3, 2, 3, 3, 'BK002', 'Trần Thị B', 'b@gmail.com', '0922222222', 1, 0, 0, NULL, NULL, 1, 0, 0, 'cancelled', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 1', '2026-05-03', 5500000.00, 4000000.00, 800000.00, NULL, NULL, 5500000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(3, 2, 3, 5, 5, 'BK003', 'Lê Văn C', 'c@gmail.com', '0933333333', 2, 0, 1, NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 1', '2026-05-05', 4500000.00, 3200000.00, 600000.00, NULL, NULL, 9600000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(4, 3, 4, 7, 7, 'BK004', 'Phạm Thị D', 'd@gmail.com', '0944444444', 1, 1, 0, NULL, NULL, 1, 0, 0, 'contacted', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 2', '2026-05-07', 7000000.00, 5000000.00, 1000000.00, NULL, NULL, 9000000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(5, 2, 5, 9, 8, 'BK005', 'Hoàng Văn E', 'e@gmail.com', '0955555555', 3, 0, 0, NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 3', '2026-05-08', 4800000.00, 3500000.00, 700000.00, NULL, NULL, 14400000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(6, 3, 6, 11, 9, 'BK006', 'Đỗ Văn F', 'f@gmail.com', '0966666666', 2, 1, 0, NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 4', '2026-06-01', 4500000.00, 3200000.00, 600000.00, NULL, NULL, 9800000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(8, 3, 8, 15, 11, 'BK008', 'Trần H', 'h@gmail.com', '0988888888', 2, 0, 0, NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1', '2026-06-05', 3500000.00, 2500000.00, 500000.00, NULL, NULL, 7000000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(9, 2, 9, 17, 12, 'BK009', 'Lê I', 'i@gmail.com', '0999999999', 1, 1, 0, NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 2', '2026-06-07', 3700000.00, 2700000.00, 500000.00, NULL, NULL, 6400000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(10, 3, 10, 18, 13, 'BK010', 'Phạm K', 'k@gmail.com', '0900000000', 2, 0, 0, NULL, NULL, 1, 0, 0, 'approved', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 2', '2026-06-09', 5800000.00, 4200000.00, 800000.00, NULL, NULL, 11600000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(11, 2, 11, 19, 14, 'BK011', 'Hoàng L', 'l@gmail.com', '0910000000', 2, 1, 0, NULL, NULL, 1, 0, 0, 'approved', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 3', '2026-06-12', 6000000.00, 4500000.00, 900000.00, NULL, NULL, 13500000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(12, 3, 1, 2, 2, 'BK012', 'User12', 'u12@gmail.com', '0911111122', 1, 0, 0, NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 3', '2026-05-10', 3600000.00, 2600000.00, 500000.00, NULL, NULL, 3600000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(13, 2, 2, 4, 4, 'BK013', 'User13', 'u13@gmail.com', '0911111133', 2, 0, 0, NULL, NULL, 1, 0, 0, 'approved', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 1', '2026-05-15', 5700000.00, 4200000.00, 800000.00, NULL, NULL, 11400000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(14, 3, 3, 6, 6, 'BK014', 'User14', 'u14@gmail.com', '0911111144', 1, 1, 0, NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 1', '2026-05-20', 4600000.00, 3300000.00, 600000.00, NULL, NULL, 7900000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(15, 2, 4, 8, 7, 'BK015', 'User15', 'u15@gmail.com', '0911111155', 1, 0, 0, NULL, NULL, 1, 0, 0, 'cancelled', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 2', '2026-05-25', 7200000.00, 5200000.00, 1000000.00, NULL, NULL, 7000000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(16, 3, 5, 10, 8, 'BK016', 'User16', 'u16@gmail.com', '0911111166', 2, 1, 0, NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 3', '2026-05-28', 4900000.00, 3600000.00, 700000.00, NULL, NULL, 12000000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(17, 2, 6, 12, 9, 'BK017', 'User17', 'u17@gmail.com', '0911111177', 2, 0, 0, NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 4', '2026-06-10', 4600000.00, 3300000.00, 600000.00, NULL, NULL, 9000000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(18, 3, 7, 14, 10, 'BK018', 'User18', 'u18@gmail.com', '0911111188', 1, 0, 0, NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 5', '2026-06-18', 8200000.00, 6200000.00, 1200000.00, NULL, NULL, 8200000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(19, 2, 8, 16, 11, 'BK019', 'User19', 'u19@gmail.com', '0911111199', 3, 0, 0, NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1', '2026-06-20', 3600000.00, 2600000.00, 500000.00, NULL, NULL, 10800000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(20, 3, 9, 17, 12, 'BK020', 'User20', 'u20@gmail.com', '0911111200', 2, 1, 0, NULL, NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 2', '2026-06-07', 3700000.00, 2700000.00, 500000.00, NULL, NULL, 9100000.00, NULL, '2026-04-02 18:56:51', '2026-04-02 18:56:51'),
	(23, 7, 10, 18, 13, 'BKMOH0MID52C0FB6', 'minhtuyen', 'minhtuyenk201@gmail.com', '0000000000', 1, 0, 0, NULL, NULL, 1, 0, 0, 'approved', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 2', '2026-06-09', 5800000.00, 4200000.00, 800000.00, NULL, NULL, 6800000.00, NULL, '2026-04-27 16:49:21', '2026-04-27 16:49:21'),
	(24, 7, 7, 13, NULL, 'BKMOH101AS1BB547', 'minhtuyen', 'minhtuyenk201@gmail.com', '0000000000', 1, 0, 0, NULL, NULL, 1, 0, 0, 'approved', 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 5', '2026-06-03', 8000000.00, 6000000.00, 1200000.00, NULL, NULL, 8000000.00, NULL, '2026-04-27 16:59:52', '2026-04-27 16:59:52'),
	(27, 7, 8, 15, 11, 'BKMOH6DVII2D0BAD', 'minhtuyen', 'minhtuyenk201@gmail.com', '0000000000', 1, 0, 0, 'aaaaaaaaa', NULL, 1, 0, 0, 'approved', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1', '2026-06-05', 3500000.00, 2500000.00, 500000.00, NULL, NULL, 3500000.00, NULL, '2026-04-27 19:30:36', '2026-04-27 19:30:36'),
	(31, 1, 11, 20, NULL, 'BKMOK4F63VBCD6FC', 'Quản Trị Viên', '1@gmail.com', '0901234567', 15, 0, 0, NULL, NULL, 1, 0, 0, 'cancelled', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 3', '2026-06-25', 6200000.00, 4700000.00, 900000.00, NULL, NULL, 93000000.00, NULL, '2026-04-29 20:58:55', '2026-04-29 20:58:55'),
	(32, 8, 11, 20, 14, 'BKMONM62QE867C0E', 'Cường Trần', 'tranhungcuong31720@gmail.com', '0978818244', 15, 0, 0, NULL, NULL, 1, 0, 0, 'approved', 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 3', '2026-06-25', 6200000.00, 4700000.00, 900000.00, NULL, NULL, 132000000.00, NULL, '2026-05-02 07:39:03', '2026-05-02 07:39:03'),
	(44, 8, 8, 16, 11, 'BKMQBSZDV7591722', 'Cường Trần', 'tranhungcuong31720@gmail.com', '0978818244', 2, 3, 3, NULL, NULL, 1, 0, 0, 'cancelled', 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1', '2026-06-20', 3600000.00, 2600000.00, 500000.00, NULL, NULL, 16500000.00, NULL, '2026-06-13 10:35:58', '2026-06-13 10:35:58');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
  CONSTRAINT `1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.category_translations: ~2 rows (approximately)
DELETE FROM `category_translations`;
INSERT INTO `category_translations` (`id`, `category_id`, `language`, `name`, `slug`, `description`) VALUES
	(1, 1, 'vi', 'Tour Nội Địa', 'tour-noi-dia', 'Khám phá vẻ đẹp hùng vĩ của đất nước Việt Nam từ Bắc chí Nam.'),
	(2, 2, 'vi', 'Tour Quốc Tế', 'tour-quoc-te', 'Trải nghiệm văn hóa, ẩm thực và cảnh quan kỳ thú tại các quốc gia trên thế giới.');

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
  CONSTRAINT `1` FOREIGN KEY (`guide_id`) REFERENCES `guides` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.guide_translations: ~2 rows (approximately)
DELETE FROM `guide_translations`;
INSERT INTO `guide_translations` (`id`, `guide_id`, `language`, `title`, `slug`, `content`) VALUES
	(1, 1, 'vi', 'Hướng dẫn đặt tour trên hệ thống', 'huong-dan-dat-tour', '<h2>Cách&nbsp;đặt&nbsp;tour</h2><p>Bước&nbsp;1:&nbsp;Chọn&nbsp;tour...&nbsp;Bước&nbsp;2:&nbsp;Điền&nbsp;thông&nbsp;tin...&nbsp;Bước&nbsp;3:&nbsp;Chờ&nbsp;admin&nbsp;liên&nbsp;hệ.1</p>'),
	(2, 2, 'vi', 'Chính sách hoàn hủy tour', 'chinh-sach-hoan-huy', '<h2>Chính sách hủy</h2><p>Hủy trước 7 ngày hoàn 100% tiền. Hủy trước 3 ngày hoàn 50% tiền.</p>');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.guides: ~2 rows (approximately)
DELETE FROM `guides`;
INSERT INTO `guides` (`id`, `title`, `slug`, `content`, `is_active`, `updated_at`) VALUES
	(1, 'Hướng dẫn đặt tour trên hệ thống', 'huong-dan-dat-tour', '<h2>Cách&nbsp;đặt&nbsp;tour</h2><p>Bước&nbsp;1:&nbsp;Chọn&nbsp;tour...&nbsp;Bước&nbsp;2:&nbsp;Điền&nbsp;thông&nbsp;tin...&nbsp;Bước&nbsp;3:&nbsp;Chờ&nbsp;admin&nbsp;liên&nbsp;hệ.1</p>', 1, '2026-03-02 13:42:13'),
	(2, 'Chính sách hoàn hủy tour', 'chinh-sach-hoan-huy', '<h2>Chính sách hủy</h2><p>Hủy trước 7 ngày hoàn 100% tiền. Hủy trước 3 ngày hoàn 50% tiền.</p>', 1, '2026-03-02 09:21:47');

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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.notifications: ~29 rows (approximately)
DELETE FROM `notifications`;
INSERT INTO `notifications` (`id`, `user_id`, `type`, `sender_name`, `message`, `related_id`, `related_slug`, `is_read`, `created_at`) VALUES
	(1, 7, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills". Vui lòng chờ nhân viên liên hệ xác nhận.', 24, NULL, 1, '2026-04-27 16:59:52'),
	(2, 7, 'booking', 'Hệ thống', 'đơn đặt tour "Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills" của bạn đã được duyệt', 24, NULL, 1, '2026-04-27 17:00:07'),
	(3, 7, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park". Vui lòng chờ nhân viên liên hệ xác nhận.', 25, 'nghi-duong-phu-quoc-hon-thom', 0, '2026-04-27 17:37:32'),
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
	(29, 8, 'booking', 'Hệ thống', 'bạn đã đặt thành công tour "Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1". Vui lòng chờ nhân viên liên hệ xác nhận.', 44, 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 0, '2026-06-13 10:35:58');

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table db_marketing_tour.otps: ~0 rows (approximately)
DELETE FROM `otps`;

-- Dumping structure for table db_marketing_tour.roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`),
  UNIQUE KEY `role_name_2` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.roles: ~2 rows (approximately)
DELETE FROM `roles`;
INSERT INTO `roles` (`id`, `role_name`) VALUES
	(1, 'ADMIN'),
	(2, 'CUSTOMER');

-- Dumping structure for table db_marketing_tour.tour_departures
DROP TABLE IF EXISTS `tour_departures`;
CREATE TABLE IF NOT EXISTS `tour_departures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL,
  `departure_date` date NOT NULL COMMENT 'Ngày khởi hành',
  `price_adult` decimal(15,2) NOT NULL COMMENT 'Giá người lớn',
  `price_child` decimal(15,2) DEFAULT 0.00 COMMENT 'Giá trẻ em',
  `price_infant` decimal(15,2) DEFAULT 0.00 COMMENT 'Giá em bé/trẻ nhỏ',
  `available_seats` int(11) NOT NULL DEFAULT 0 COMMENT 'Số lượng khách tối đa nhận',
  `status` enum('open','full','cancelled') DEFAULT 'open' COMMENT 'Trạng thái mở bán',
  PRIMARY KEY (`id`),
  KEY `tour_id` (`tour_id`),
  CONSTRAINT `tour_d` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.tour_departures: ~23 rows (approximately)
DELETE FROM `tour_departures`;
INSERT INTO `tour_departures` (`id`, `tour_id`, `departure_date`, `price_adult`, `price_child`, `price_infant`, `available_seats`, `status`) VALUES
	(1, 1, '2026-05-01', 3500000.00, 2500000.00, 500000.00, 20, 'open'),
	(2, 1, '2026-05-10', 3600000.00, 2600000.00, 500000.00, 15, 'open'),
	(3, 2, '2026-05-03', 5500000.00, 4000000.00, 800000.00, 26, 'open'),
	(4, 2, '2026-05-15', 5700000.00, 4200000.00, 800000.00, 10, 'full'),
	(5, 3, '2026-05-05', 4500000.00, 3200000.00, 600000.00, 30, 'open'),
	(6, 3, '2026-05-20', 4600000.00, 3300000.00, 600000.00, 5, 'open'),
	(7, 4, '2026-05-07', 7000000.00, 5000000.00, 1000000.00, 12, 'open'),
	(8, 4, '2026-05-25', 7200000.00, 5200000.00, 1000000.00, 0, 'full'),
	(9, 5, '2026-05-08', 4800000.00, 3500000.00, 700000.00, 18, 'open'),
	(10, 5, '2026-05-28', 4900000.00, 3600000.00, 700000.00, 6, 'open'),
	(11, 6, '2026-06-01', 4500000.00, 3200000.00, 600000.00, 20, 'open'),
	(12, 6, '2026-06-10', 4600000.00, 3300000.00, 600000.00, 10, 'open'),
	(13, 7, '2026-06-03', 8000000.00, 6000000.00, 1200000.00, 15, 'open'),
	(14, 7, '2026-06-18', 8200000.00, 6200000.00, 1200000.00, 0, 'full'),
	(15, 8, '2026-06-05', 3500000.00, 2500000.00, 500000.00, 25, 'open'),
	(16, 8, '2026-06-20', 3600000.00, 2600000.00, 500000.00, 8, 'open'),
	(17, 9, '2026-06-07', 3700000.00, 2700000.00, 500000.00, 30, 'open'),
	(18, 10, '2026-06-09', 5800000.00, 4200000.00, 800000.00, 12, 'open'),
	(19, 11, '2026-06-12', 6000000.00, 4500000.00, 900000.00, 20, 'open'),
	(20, 11, '2026-06-25', 6200000.00, 4700000.00, 900000.00, 0, 'full'),
	(31, 13, '2026-04-03', 24999999.00, 1000000.00, 500000.00, 10, 'open'),
	(32, 13, '2026-04-10', 400000000.00, 2000000.00, 400000.00, 20, 'open'),
	(59, 15, '2026-05-01', 3500000.00, 200000.00, 100000.00, 20, 'open');

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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.tour_images: ~23 rows (approximately)
DELETE FROM `tour_images`;
INSERT INTO `tour_images` (`id`, `tour_id`, `image_url`, `sort_order`) VALUES
	(1, 1, '/uploads/tours/tour-1777299641824-589815401.jpg', 1),
	(2, 1, '/uploads/tours/tour-1777299641824-589815401.jpg', 2),
	(3, 2, '/uploads/tours/tour-1777299641824-589815401.jpg', 1),
	(4, 2, '/uploads/tours/tour-1777299641824-589815401.jpg', 2),
	(5, 3, '/uploads/tours/tour-1777299641824-589815401.jpg', 1),
	(6, 3, '/uploads/tours/tour-1777299641824-589815401.jpg', 2),
	(7, 4, '/uploads/tours/tour-1777299641824-589815401.jpg', 1),
	(8, 4, '/uploads/tours/tour-1777299641824-589815401.jpg', 2),
	(9, 5, '/uploads/tours/tour-1777299641824-589815401.jpg', 1),
	(10, 5, '/uploads/tours/tour-1777299641824-589815401.jpg', 2),
	(11, 6, '/uploads/tours/tour-1777299641824-589815401.jpg', 1),
	(12, 6, '/uploads/tours/tour-1777299641824-589815401.jpg', 2),
	(13, 7, '/uploads/tours/tour-1777299641824-589815401.jpg', 1),
	(14, 7, '/uploads/tours/tour-1777299641824-589815401.jpg', 2),
	(15, 8, '/uploads/tours/tour-1777299641824-589815401.jpg', 1),
	(16, 8, '/uploads/tours/tour-1777299641824-589815401.jpg', 2),
	(17, 9, '/uploads/tours/tour-1777299641824-589815401.jpg', 1),
	(18, 10, '/uploads/tours/tour-1777299641824-589815401.jpg', 1),
	(19, 11, '/uploads/tours/tour-1777299641824-589815401.jpg', 1),
	(20, 11, '/uploads/tours/tour-1777299641824-589815401.jpg', 2),
	(32, 15, '/uploads/tours/tour-1777472919828-688992166.webp', 0),
	(33, 15, '/uploads/tours/tour-1777472919832-743990366.jpg', 1),
	(34, 15, '/uploads/tours/tour-1777472919834-732399310.webp', 2);

-- Dumping structure for table db_marketing_tour.tour_itineraries
DROP TABLE IF EXISTS `tour_itineraries`;
CREATE TABLE IF NOT EXISTS `tour_itineraries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL,
  `day_number` int(11) NOT NULL COMMENT 'Ngày thứ mấy (1, 2, 3...)',
  `title` varchar(255) NOT NULL COMMENT 'Tiêu đề (VD: Ngày 1: Đón khách - Tham quan)',
  `content` longtext NOT NULL COMMENT 'Chi tiết các hoạt động trong ngày',
  PRIMARY KEY (`id`),
  KEY `tour_id` (`tour_id`),
  CONSTRAINT `fk_tour_it` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.tour_itineraries: ~25 rows (approximately)
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
	(36, 13, 1, 'Đón khách ăn tối', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">12:30&nbsp;Quý&nbsp;khách&nbsp;tập&nbsp;trung&nbsp;tại&nbsp;Ga&nbsp;Quốc&nbsp;tế&nbsp;Sân&nbsp;bay&nbsp;Tân&nbsp;Sơn&nbsp;Nhất&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;hàng&nbsp;không&nbsp;khởi&nbsp;hành&nbsp;đi&nbsp;Malaysia.&nbsp;Chuyến&nbsp;bay:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">VN679&nbsp;SGN-KUL&nbsp;15:50&nbsp;-&nbsp;18:50.</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Tới&nbsp;Sân&nbsp;bay&nbsp;Quốc&nbsp;tế&nbsp;Kuala&nbsp;Lumpur,&nbsp;Quý&nbsp;khách&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;nhập&nbsp;cảnh&nbsp;Malaysia.&nbsp;Đoàn&nbsp;di&nbsp;chuyển&nbsp;đến&nbsp;nhà&nbsp;hàng&nbsp;dùng&nbsp;bữa&nbsp;tối.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Sau&nbsp;bữa&nbsp;tối,&nbsp;đoàn&nbsp;trở&nbsp;về&nbsp;khách&nbsp;sạn&nbsp;nhận&nbsp;phòng&nbsp;nghỉ&nbsp;ngơi.</span></p>'),
	(37, 13, 2, 'Tham quan', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Sáng:&nbsp;Quý&nbsp;khách&nbsp;dùng&nbsp;điểm&nbsp;tâm&nbsp;tại&nbsp;khách&nbsp;sạn.&nbsp;Đoàn&nbsp;tham&nbsp;quan</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Khu&nbsp;Putrajaya</strong><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">:&nbsp;Trung&nbsp;tâm&nbsp;hành&nbsp;chính&nbsp;mới&nbsp;của&nbsp;Malaysia&nbsp;&nbsp;với&nbsp;những&nbsp;địa&nbsp;danh&nbsp;du&nbsp;lịch&nbsp;nổi&nbsp;tiếng&nbsp;như:&nbsp;Nhà&nbsp;thờ&nbsp;Hồi&nbsp;giáo&nbsp;Putra,&nbsp;Văn&nbsp;phòng&nbsp;Thủ&nbsp;tướng,&nbsp;Trung&nbsp;tâm&nbsp;hội&nbsp;nghị&nbsp;(chụp&nbsp;hình&nbsp;bên&nbsp;ngoài).</span></p>'),
	(38, 13, 3, 'Chuẩn bị về', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Sáng:&nbsp;Quý&nbsp;khách&nbsp;dùng&nbsp;điểm&nbsp;tâm&nbsp;sáng&nbsp;tại&nbsp;khách&nbsp;sạn&nbsp;và&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;trả&nbsp;phòng.&nbsp;Đoàn&nbsp;tham&nbsp;quan</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Tháp&nbsp;Đôi&nbsp;Petronas</strong><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">:&nbsp;Biểu&nbsp;tượng&nbsp;hiện&nbsp;đại&nbsp;của&nbsp;Kuala&nbsp;Lumpur,&nbsp;nổi&nbsp;bật&nbsp;với&nbsp;kiến&nbsp;trúc&nbsp;tinh&nbsp;xảo&nbsp;và&nbsp;tầm&nbsp;nhìn&nbsp;toàn&nbsp;cảnh&nbsp;thành&nbsp;phố.&nbsp;Đây&nbsp;là&nbsp;niềm&nbsp;tự&nbsp;hào&nbsp;của&nbsp;người&nbsp;dân&nbsp;Malaysia&nbsp;được&nbsp;hoàn&nbsp;thành&nbsp;năm&nbsp;1998&nbsp;với&nbsp;tổng&nbsp;chiều&nbsp;cao&nbsp;452m&nbsp;và&nbsp;88&nbsp;tầng.</span></p>'),
	(72, 15, 1, 'đón khách', '<p>22:30:&nbsp;Quý&nbsp;khách&nbsp;tập&nbsp;trung&nbsp;tại&nbsp;sân&nbsp;bay&nbsp;Quốc&nbsp;tế&nbsp;Tân&nbsp;Sơn&nbsp;Nhất,&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;chuyến&nbsp;bay&nbsp;đi&nbsp;Đài&nbsp;Bắc,&nbsp;chuyến&nbsp;bay&nbsp;dự&nbsp;kiến:&nbsp;BR382&nbsp;SGNTPE&nbsp;01:55</p>'),
	(73, 15, 2, 'Tham quan Đài Bắc- Cao Hùng', '<p>Đoàn&nbsp;đáp&nbsp;sân&nbsp;bay&nbsp;quốc&nbsp;tế&nbsp;Đào&nbsp;Viên,&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;nhập&nbsp;cảnh.&nbsp;Xe&nbsp;và&nbsp;HDV&nbsp;đón&nbsp;đoàn,&nbsp;di&nbsp;chuyển&nbsp;đi&nbsp;dùng&nbsp;bữa&nbsp;sáng.</p><p>Khởi&nbsp;hành&nbsp;đi&nbsp;Cao&nbsp;Hùng,&nbsp;trên&nbsp;đường&nbsp;tham&nbsp;quan:</p><p>Bảo&nbsp;tàng&nbsp;Kỳ&nbsp;Mỹ&nbsp;(Chimei&nbsp;Museum)&nbsp;-&nbsp;Một&nbsp;trong&nbsp;những&nbsp;bảo&nbsp;tàng&nbsp;đắt&nbsp;giá&nbsp;nhất&nbsp;thế&nbsp;giới,&nbsp;sở&nbsp;hữu&nbsp;bộ&nbsp;sưu&nbsp;tập&nbsp;nghệ&nbsp;thuật&nbsp;&amp;&nbsp;lịch&nbsp;sử&nbsp;độc&nbsp;đáo.&nbsp;Kiến&nbsp;trúc&nbsp;ấn&nbsp;tượng&nbsp;kết&nbsp;hợp&nbsp;không&nbsp;gian&nbsp;trưng&nbsp;bày&nbsp;đẳng&nbsp;cấp&nbsp;mang&nbsp;đến&nbsp;trải&nbsp;nghiệm&nbsp;đặc&nbsp;sắc&nbsp;(Đã&nbsp;bao&nbsp;gồm&nbsp;vé&nbsp;vào&nbsp;cửa).</p>');

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
  CONSTRAINT `1` FOREIGN KEY (`itinerary_id`) REFERENCES `tour_itineraries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.tour_itinerary_translations: ~25 rows (approximately)
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
	(21, 36, 'vi', 'Đón khách ăn tối', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">12:30&nbsp;Quý&nbsp;khách&nbsp;tập&nbsp;trung&nbsp;tại&nbsp;Ga&nbsp;Quốc&nbsp;tế&nbsp;Sân&nbsp;bay&nbsp;Tân&nbsp;Sơn&nbsp;Nhất&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;hàng&nbsp;không&nbsp;khởi&nbsp;hành&nbsp;đi&nbsp;Malaysia.&nbsp;Chuyến&nbsp;bay:&nbsp;</span><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">VN679&nbsp;SGN-KUL&nbsp;15:50&nbsp;-&nbsp;18:50.</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Tới&nbsp;Sân&nbsp;bay&nbsp;Quốc&nbsp;tế&nbsp;Kuala&nbsp;Lumpur,&nbsp;Quý&nbsp;khách&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;nhập&nbsp;cảnh&nbsp;Malaysia.&nbsp;Đoàn&nbsp;di&nbsp;chuyển&nbsp;đến&nbsp;nhà&nbsp;hàng&nbsp;dùng&nbsp;bữa&nbsp;tối.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Sau&nbsp;bữa&nbsp;tối,&nbsp;đoàn&nbsp;trở&nbsp;về&nbsp;khách&nbsp;sạn&nbsp;nhận&nbsp;phòng&nbsp;nghỉ&nbsp;ngơi.</span></p>'),
	(22, 37, 'vi', 'Tham quan', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Sáng:&nbsp;Quý&nbsp;khách&nbsp;dùng&nbsp;điểm&nbsp;tâm&nbsp;tại&nbsp;khách&nbsp;sạn.&nbsp;Đoàn&nbsp;tham&nbsp;quan</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Khu&nbsp;Putrajaya</strong><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">:&nbsp;Trung&nbsp;tâm&nbsp;hành&nbsp;chính&nbsp;mới&nbsp;của&nbsp;Malaysia&nbsp;&nbsp;với&nbsp;những&nbsp;địa&nbsp;danh&nbsp;du&nbsp;lịch&nbsp;nổi&nbsp;tiếng&nbsp;như:&nbsp;Nhà&nbsp;thờ&nbsp;Hồi&nbsp;giáo&nbsp;Putra,&nbsp;Văn&nbsp;phòng&nbsp;Thủ&nbsp;tướng,&nbsp;Trung&nbsp;tâm&nbsp;hội&nbsp;nghị&nbsp;(chụp&nbsp;hình&nbsp;bên&nbsp;ngoài).</span></p>'),
	(23, 38, 'vi', 'Chuẩn bị về', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Sáng:&nbsp;Quý&nbsp;khách&nbsp;dùng&nbsp;điểm&nbsp;tâm&nbsp;sáng&nbsp;tại&nbsp;khách&nbsp;sạn&nbsp;và&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;trả&nbsp;phòng.&nbsp;Đoàn&nbsp;tham&nbsp;quan</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Tháp&nbsp;Đôi&nbsp;Petronas</strong><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">:&nbsp;Biểu&nbsp;tượng&nbsp;hiện&nbsp;đại&nbsp;của&nbsp;Kuala&nbsp;Lumpur,&nbsp;nổi&nbsp;bật&nbsp;với&nbsp;kiến&nbsp;trúc&nbsp;tinh&nbsp;xảo&nbsp;và&nbsp;tầm&nbsp;nhìn&nbsp;toàn&nbsp;cảnh&nbsp;thành&nbsp;phố.&nbsp;Đây&nbsp;là&nbsp;niềm&nbsp;tự&nbsp;hào&nbsp;của&nbsp;người&nbsp;dân&nbsp;Malaysia&nbsp;được&nbsp;hoàn&nbsp;thành&nbsp;năm&nbsp;1998&nbsp;với&nbsp;tổng&nbsp;chiều&nbsp;cao&nbsp;452m&nbsp;và&nbsp;88&nbsp;tầng.</span></p>'),
	(24, 72, 'vi', 'đón khách', '<p>22:30:&nbsp;Quý&nbsp;khách&nbsp;tập&nbsp;trung&nbsp;tại&nbsp;sân&nbsp;bay&nbsp;Quốc&nbsp;tế&nbsp;Tân&nbsp;Sơn&nbsp;Nhất,&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;chuyến&nbsp;bay&nbsp;đi&nbsp;Đài&nbsp;Bắc,&nbsp;chuyến&nbsp;bay&nbsp;dự&nbsp;kiến:&nbsp;BR382&nbsp;SGNTPE&nbsp;01:55</p>'),
	(25, 73, 'vi', 'Tham quan Đài Bắc- Cao Hùng', '<p>Đoàn&nbsp;đáp&nbsp;sân&nbsp;bay&nbsp;quốc&nbsp;tế&nbsp;Đào&nbsp;Viên,&nbsp;làm&nbsp;thủ&nbsp;tục&nbsp;nhập&nbsp;cảnh.&nbsp;Xe&nbsp;và&nbsp;HDV&nbsp;đón&nbsp;đoàn,&nbsp;di&nbsp;chuyển&nbsp;đi&nbsp;dùng&nbsp;bữa&nbsp;sáng.</p><p>Khởi&nbsp;hành&nbsp;đi&nbsp;Cao&nbsp;Hùng,&nbsp;trên&nbsp;đường&nbsp;tham&nbsp;quan:</p><p>Bảo&nbsp;tàng&nbsp;Kỳ&nbsp;Mỹ&nbsp;(Chimei&nbsp;Museum)&nbsp;-&nbsp;Một&nbsp;trong&nbsp;những&nbsp;bảo&nbsp;tàng&nbsp;đắt&nbsp;giá&nbsp;nhất&nbsp;thế&nbsp;giới,&nbsp;sở&nbsp;hữu&nbsp;bộ&nbsp;sưu&nbsp;tập&nbsp;nghệ&nbsp;thuật&nbsp;&amp;&nbsp;lịch&nbsp;sử&nbsp;độc&nbsp;đáo.&nbsp;Kiến&nbsp;trúc&nbsp;ấn&nbsp;tượng&nbsp;kết&nbsp;hợp&nbsp;không&nbsp;gian&nbsp;trưng&nbsp;bày&nbsp;đẳng&nbsp;cấp&nbsp;mang&nbsp;đến&nbsp;trải&nbsp;nghiệm&nbsp;đặc&nbsp;sắc&nbsp;(Đã&nbsp;bao&nbsp;gồm&nbsp;vé&nbsp;vào&nbsp;cửa).</p>');

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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
	(26, 13, 'Phòng đôi', 1000000.00, 'per_person');

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
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.tour_pickup_locations: ~24 rows (approximately)
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
	(34, 13, 'Hà Nội', '19:05:00', 0.00),
	(35, 13, 'Bắc Giang', '21:05:00', 200000.00),
	(36, 13, 'Sài Gòn', '09:50:00', 100000.00),
	(57, 15, 'Hà Nội', '21:28:00', 0.00);

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
  CONSTRAINT `1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.tour_translations: ~13 rows (approximately)
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
	(12, 13, 'vi', 'Tour Malaysia - Singapore 5N4Đ: Khám Phá Văn Hóa Đông Nam Á', 'tour-malaysia-singapore-5n4d-kham-pha-van-hoa-dong-nam-a', 'Khám phá Gardens by the Bay: Vườn sinh thái biểu tượng Singapore.', '<p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">Khám&nbsp;phá&nbsp;Gardens&nbsp;by&nbsp;the&nbsp;Bay:&nbsp;Vườn&nbsp;sinh&nbsp;thái&nbsp;biểu&nbsp;tượng&nbsp;Singapore.</span></p><p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">Ghé&nbsp;thăm&nbsp;Marina&nbsp;Bay&nbsp;Sands&nbsp;và&nbsp;Merlion&nbsp;Park:&nbsp;Biểu&nbsp;tượng&nbsp;quốc&nbsp;đảo&nbsp;sư&nbsp;tử.</span></p><p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">Tham&nbsp;quan&nbsp;Động&nbsp;Batu&nbsp;huyền&nbsp;bí&nbsp;&amp;&nbsp;chinh&nbsp;phục&nbsp;272&nbsp;bậc&nbsp;thang&nbsp;sắc&nbsp;màu.</span></p><p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">Trải&nbsp;nghiệm&nbsp;cao&nbsp;nguyên&nbsp;Genting:&nbsp;Thành&nbsp;phố&nbsp;giải&nbsp;trí&nbsp;giữa&nbsp;mây&nbsp;trời.</span></p><p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">Check-in&nbsp;Nhà&nbsp;thờ&nbsp;Hồi&nbsp;giáo&nbsp;Putra&nbsp;&amp;&nbsp;Quảng&nbsp;trường&nbsp;Độc&nbsp;Lập&nbsp;Kuala&nbsp;Lumpur.</span></p>', '<p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Vận&nbsp;chuyển</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Vé&nbsp;máy&nbsp;bay&nbsp;khứ&nbsp;hồi&nbsp;theo&nbsp;hãng&nbsp;Vietnam&nbsp;Airline&nbsp;(23kg&nbsp;hành&nbsp;lý&nbsp;ký&nbsp;gửi&nbsp;+&nbsp;xách&nbsp;tay&nbsp;10kg).</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Xe&nbsp;máy&nbsp;lạnh&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;tuyến.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Phí&nbsp;an&nbsp;ninh&nbsp;sân&nbsp;bay,&nbsp;bảo&nbsp;hiểm&nbsp;hàng&nbsp;không,&nbsp;thuế&nbsp;phi&nbsp;trường&nbsp;2&nbsp;nước&nbsp;(theo&nbsp;quy&nbsp;định&nbsp;tại&nbsp;thời&nbsp;điểm&nbsp;xuất&nbsp;vé).</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Lưu&nbsp;trú</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Khách&nbsp;sạn&nbsp;tiêu&nbsp;chuẩn&nbsp;3-4*&nbsp;địa&nbsp;phương&nbsp;(2&nbsp;khách/phòng;&nbsp;khách&nbsp;lẻ&nbsp;nam/nữ&nbsp;có&nbsp;thể&nbsp;bố&nbsp;trí&nbsp;phòng&nbsp;phù&nbsp;hợp).</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Dịch&nbsp;vụ&nbsp;khác</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Vé&nbsp;tham&nbsp;quan&nbsp;trong&nbsp;chương&nbsp;trình.&nbsp;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Các&nbsp;bữa&nbsp;ăn&nbsp;theo&nbsp;chương&nbsp;trình.&nbsp;(đảm&nbsp;bảo&nbsp;số&nbsp;lượng&nbsp;&amp;&nbsp;chất&nbsp;lượng&nbsp;tương&nbsp;đương&nbsp;nếu&nbsp;có&nbsp;điều&nbsp;chỉnh).</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Nước&nbsp;suối&nbsp;01&nbsp;chai/khách/ngày.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Bảo&nbsp;hiểm&nbsp;du&nbsp;lịch&nbsp;quốc&nbsp;tế.&nbsp;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trưởng&nbsp;đoàn&nbsp;và&nbsp;HDV&nbsp;địa&nbsp;phương&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;hành&nbsp;trình.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Tặng&nbsp;nón&nbsp;du&nbsp;lịch.&nbsp;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Thuế&nbsp;VAT.</span></p>', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Phụ&nbsp;thu&nbsp;phòng&nbsp;đơn&nbsp;(nếu&nbsp;có):&nbsp;4.300.000đ/khách/tour&nbsp;-&nbsp;4.800.000đ/khách/tour.&nbsp;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Tips&nbsp;cho&nbsp;tài&nbsp;xế&nbsp;và&nbsp;hướng&nbsp;dẫn&nbsp;viên:&nbsp;25&nbsp;USD/khách/tour.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Phụ&nbsp;thu&nbsp;đối&nbsp;với&nbsp;khách&nbsp;mang&nbsp;quốc&nbsp;tịch&nbsp;nước&nbsp;ngoài:&nbsp;660.000đ/khách.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Visa&nbsp;tái&nbsp;nhập&nbsp;Việt&nbsp;Nam&nbsp;cho&nbsp;khách&nbsp;quốc&nbsp;tịch&nbsp;nước&nbsp;ngoài&nbsp;theo&nbsp;quy&nbsp;định&nbsp;hiện&nbsp;hành&nbsp;(nếu&nbsp;có).</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Chi&nbsp;phí&nbsp;cá&nbsp;nhân:&nbsp;hành&nbsp;lý&nbsp;quá&nbsp;cước,&nbsp;điện&nbsp;thoại,&nbsp;giặt&nbsp;ủi,&nbsp;tham&nbsp;quan,&nbsp;chi&nbsp;tiêu&nbsp;ngoài&nbsp;chương&nbsp;trình.</span></p>', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 60, 113);">Chính&nbsp;sách&nbsp;trẻ&nbsp;em</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">1.&nbsp;Quy&nbsp;định&nbsp;chung:</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Mỗi&nbsp;02&nbsp;người&nbsp;lớn&nbsp;được&nbsp;kèm&nbsp;01&nbsp;trẻ&nbsp;em.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Từ&nbsp;trẻ&nbsp;thứ&nbsp;02&nbsp;trở&nbsp;đi,&nbsp;áp&nbsp;dụng&nbsp;mức&nbsp;giá&nbsp;theo&nbsp;quy&nbsp;định&nbsp;của&nbsp;từng&nbsp;nhóm&nbsp;tuổi&nbsp;(nêu&nbsp;bên&nbsp;dưới).</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trẻ&nbsp;em&nbsp;ngủ&nbsp;chung&nbsp;giường&nbsp;với&nbsp;bố&nbsp;mẹ.&nbsp;→&nbsp;Nếu&nbsp;cần&nbsp;giường&nbsp;riêng:&nbsp;Tính&nbsp;như&nbsp;người&nbsp;lớn.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Chi&nbsp;phí&nbsp;ngoài&nbsp;chương&nbsp;trình&nbsp;(nếu&nbsp;có)&nbsp;gia&nbsp;đình&nbsp;tự&nbsp;chi&nbsp;trả.</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">2.&nbsp;Quy&nbsp;định&nbsp;theo&nbsp;độ&nbsp;tuổi:</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trẻ&nbsp;dưới&nbsp;2&nbsp;tuổi:&nbsp;Giá&nbsp;như&nbsp;trên&nbsp;website,&nbsp;đã&nbsp;bao&nbsp;gồm&nbsp;vé&nbsp;máy&nbsp;bay,&nbsp;không&nbsp;có&nbsp;ghế&nbsp;riêng,&nbsp;ngủ&nbsp;chung&nbsp;với&nbsp;bố&nbsp;mẹ.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trẻ&nbsp;từ&nbsp;2&nbsp;-&nbsp;10&nbsp;tuổi:&nbsp;Giá&nbsp;như&nbsp;trên&nbsp;website,&nbsp;bao&nbsp;gồm&nbsp;đầy&nbsp;đủ&nbsp;dịch&nbsp;vụ&nbsp;trong&nbsp;chương&nbsp;trình.&nbsp;Ngủ&nbsp;chung&nbsp;với&nbsp;bố&nbsp;mẹ.&nbsp;Từ&nbsp;trẻ&nbsp;thứ&nbsp;02&nbsp;trở&nbsp;đi:&nbsp;tính&nbsp;100%&nbsp;giá&nbsp;người&nbsp;lớn.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trẻ&nbsp;từ&nbsp;11&nbsp;tuổi&nbsp;trở&nbsp;lên:&nbsp;tính&nbsp;giá&nbsp;như&nbsp;người&nbsp;lớn.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trong&nbsp;trường&nbsp;hợp&nbsp;chỉ&nbsp;có&nbsp;1&nbsp;khách&nbsp;(người&nbsp;lớn)&nbsp;đi&nbsp;với&nbsp;1&nbsp;bé&nbsp;(dưới&nbsp;12&nbsp;tuổi),&nbsp;bé&nbsp;được&nbsp;tính&nbsp;giá&nbsp;vé&nbsp;người&nbsp;lớn&nbsp;để&nbsp;đảm&nbsp;bảo&nbsp;dịch&nbsp;vụ&nbsp;theo&nbsp;quy&nbsp;định.</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Giấy&nbsp;tờ&nbsp;tùy&nbsp;thân&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Hộ&nbsp;chiếu&nbsp;bản&nbsp;chính&nbsp;và&nbsp;các&nbsp;giấy&nbsp;tờ&nbsp;cần&nbsp;thiết.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trẻ&nbsp;em&nbsp;dưới&nbsp;14&nbsp;tuổi&nbsp;bắt&nbsp;buộc&nbsp;mang&nbsp;theo&nbsp;giấy&nbsp;khai&nbsp;sinh.&nbsp;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trẻ&nbsp;em&nbsp;cần&nbsp;có&nbsp;bố&nbsp;mẹ&nbsp;hoặc&nbsp;người&nbsp;thân&nbsp;trên&nbsp;18&nbsp;tuổi&nbsp;đi&nbsp;cùng;&nbsp;trường&nbsp;hợp&nbsp;đi&nbsp;cùng&nbsp;người&nbsp;thân&nbsp;cần&nbsp;có&nbsp;giấy&nbsp;ủy&nbsp;quyền&nbsp;hợp&nbsp;lệ.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 60, 113);">Chính&nbsp;sách&nbsp;hủy&nbsp;&amp;&nbsp;thay&nbsp;đổi</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Từ&nbsp;thời&nbsp;điểm&nbsp;đăng&nbsp;ký&nbsp;đến&nbsp;trước&nbsp;30&nbsp;ngày&nbsp;khởi&nbsp;hành:&nbsp;Phí&nbsp;hủy&nbsp;50%&nbsp;tiền&nbsp;cọc.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Từ&nbsp;15&nbsp;trước&nbsp;ngày&nbsp;khởi&nbsp;hành:&nbsp;Phí&nbsp;hủy&nbsp;70%&nbsp;tổng&nbsp;giá&nbsp;tour.&nbsp;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Sau&nbsp;thời&nbsp;gian&nbsp;trên:&nbsp;Phí&nbsp;hủy&nbsp;100%&nbsp;tổng&nbsp;giá&nbsp;tour.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Thời&nbsp;gian&nbsp;hủy/thay&nbsp;đổi&nbsp;tour&nbsp;được&nbsp;ghi&nbsp;nhận&nbsp;trong&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;và&nbsp;tính&nbsp;theo&nbsp;ngày&nbsp;làm&nbsp;việc&nbsp;(không&nbsp;bao&nbsp;gồm&nbsp;Thứ&nbsp;Bảy,&nbsp;Chủ&nbsp;Nhật&nbsp;và&nbsp;Lễ/Tết).&nbsp;Các&nbsp;yêu&nbsp;cầu&nbsp;gửi&nbsp;ngoài&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;sẽ&nbsp;được&nbsp;tính&nbsp;từ&nbsp;đầu&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;của&nbsp;ngày&nbsp;kế&nbsp;tiếp.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Quý&nbsp;khách&nbsp;vui&nbsp;lòng&nbsp;gửi&nbsp;yêu&nbsp;cầu&nbsp;hủy&nbsp;qua&nbsp;email&nbsp;hoặc&nbsp;kênh&nbsp;liên&nbsp;hệ&nbsp;chính&nbsp;thức&nbsp;của&nbsp;công&nbsp;ty&nbsp;để&nbsp;được&nbsp;ghi&nbsp;nhận.&nbsp;Thông&nbsp;báo&nbsp;qua&nbsp;điện&nbsp;thoại&nbsp;sẽ&nbsp;chưa&nbsp;được&nbsp;xem&nbsp;là&nbsp;căn&nbsp;cứ&nbsp;áp&nbsp;dụng&nbsp;chính&nbsp;sách&nbsp;hủy.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 60, 113);">Thông&nbsp;tin&nbsp;Visa</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Miễn&nbsp;visa&nbsp;cho&nbsp;khách&nbsp;mang&nbsp;quốc&nbsp;tịch&nbsp;Việt&nbsp;Nam.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Hộ&nbsp;chiếu&nbsp;nguyên&nbsp;vẹn&nbsp;và&nbsp;còn&nbsp;thời&nbsp;hạn&nbsp;sử&nbsp;dụng&nbsp;6&nbsp;tháng&nbsp;tính&nbsp;từ&nbsp;ngày&nbsp;kết&nbsp;thúc&nbsp;tour.&nbsp;</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Lưu&nbsp;ý&nbsp;về&nbsp;tình&nbsp;trạng&nbsp;cư&nbsp;trú</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Quý&nbsp;khách&nbsp;mang&nbsp;2&nbsp;quốc&nbsp;tịch,&nbsp;Travel&nbsp;Document&nbsp;hoặc&nbsp;tình&nbsp;trạng&nbsp;cư&nbsp;trú&nbsp;đặc&nbsp;biệt&nbsp;vui&nbsp;lòng&nbsp;thông&nbsp;báo&nbsp;khi&nbsp;đăng&nbsp;ký&nbsp;và&nbsp;cung&nbsp;cấp&nbsp;đầy&nbsp;đủ&nbsp;giấy&nbsp;tờ&nbsp;liên&nbsp;quan.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Khách&nbsp;chỉ&nbsp;có&nbsp;thẻ&nbsp;xanh&nbsp;nhưng&nbsp;không&nbsp;còn&nbsp;hộ&nbsp;chiếu&nbsp;Việt&nbsp;Nam&nbsp;còn&nbsp;hiệu&nbsp;lực&nbsp;sẽ&nbsp;không&nbsp;đủ&nbsp;điều&nbsp;kiện&nbsp;đăng&nbsp;ký&nbsp;tour&nbsp;sang&nbsp;nước&nbsp;thứ&nbsp;ba.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Khách&nbsp;là&nbsp;Việt&nbsp;Kiều&nbsp;hoặc&nbsp;quốc&nbsp;tịch&nbsp;nước&nbsp;ngoài&nbsp;có&nbsp;visa&nbsp;rời&nbsp;nhập&nbsp;cảnh&nbsp;Việt&nbsp;Nam&nbsp;cần&nbsp;mang&nbsp;theo&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trường&nbsp;hợp&nbsp;sử&nbsp;dụng&nbsp;ABTC&nbsp;(APEC),&nbsp;hộ&nbsp;chiếu&nbsp;công&nbsp;vụ,&nbsp;ngoại&nbsp;giao&nbsp;hoặc&nbsp;tự&nbsp;xin&nbsp;visa,&nbsp;vui&nbsp;lòng&nbsp;thông&nbsp;báo&nbsp;trước&nbsp;để&nbsp;được&nbsp;tư&nbsp;vấn&nbsp;phù&nbsp;hợp.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 60, 113);">Điều&nbsp;kiện&nbsp;tham&nbsp;gia&nbsp;tour</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Độ&nbsp;tuổi&nbsp;và&nbsp;sức&nbsp;khỏe:</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Tour&nbsp;áp&nbsp;dụng&nbsp;cho&nbsp;khách&nbsp;dưới&nbsp;70&nbsp;tuổi.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Quý&nbsp;khách&nbsp;từ&nbsp;70&nbsp;tuổi&nbsp;trở&nbsp;lên&nbsp;cần&nbsp;đóng&nbsp;thêm&nbsp;phí&nbsp;bảo&nbsp;hiểm&nbsp;cao&nbsp;cấp&nbsp;theo&nbsp;quy&nbsp;định.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Từ&nbsp;75&nbsp;tuổi&nbsp;trở&nbsp;lên&nbsp;cần&nbsp;cung&nbsp;cấp&nbsp;giấy&nbsp;xác&nbsp;nhận&nbsp;đủ&nbsp;sức&nbsp;khỏe&nbsp;do&nbsp;cơ&nbsp;sở&nbsp;y&nbsp;tế&nbsp;có&nbsp;thẩm&nbsp;quyền&nbsp;cấp&nbsp;và&nbsp;có&nbsp;người&nbsp;thân&nbsp;dưới&nbsp;60&nbsp;tuổi&nbsp;đi&nbsp;cùng.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Khách&nbsp;mang&nbsp;thai&nbsp;vui&nbsp;lòng&nbsp;thông&nbsp;báo&nbsp;khi&nbsp;đăng&nbsp;ký;&nbsp;cần&nbsp;có&nbsp;ý&nbsp;kiến&nbsp;bác&nbsp;sĩ&nbsp;trước&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Không&nbsp;nhận&nbsp;khách&nbsp;mang&nbsp;thai&nbsp;từ&nbsp;5&nbsp;tháng&nbsp;trở&nbsp;lên&nbsp;vì&nbsp;lý&nbsp;do&nbsp;an&nbsp;toàn.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Quý&nbsp;khách&nbsp;cần&nbsp;đảm&nbsp;bảo&nbsp;sức&nbsp;khỏe&nbsp;phù&nbsp;hợp&nbsp;để&nbsp;tham&nbsp;gia&nbsp;các&nbsp;hoạt&nbsp;động&nbsp;trong&nbsp;tour.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Nếu&nbsp;có&nbsp;điều&nbsp;kiện&nbsp;sức&nbsp;khỏe&nbsp;đặc&nbsp;biệt,&nbsp;vui&nbsp;lòng&nbsp;thông&nbsp;báo&nbsp;cho&nbsp;nhân&nbsp;viên&nbsp;tư&nbsp;vấn&nbsp;trước&nbsp;khi&nbsp;đặt&nbsp;tour.&nbsp;Quý&nbsp;khách&nbsp;có&nbsp;thể&nbsp;được&nbsp;yêu&nbsp;cầu&nbsp;cung&nbsp;cấp&nbsp;chứng&nbsp;nhận&nbsp;sức&nbsp;khỏe&nbsp;hoặc&nbsp;ký&nbsp;cam&nbsp;kết&nbsp;trong&nbsp;một&nbsp;số&nbsp;trường&nbsp;hợp&nbsp;cần&nbsp;thiết.</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Quy&nbsp;định&nbsp;theo&nbsp;đoàn:&nbsp;</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Chương&nbsp;trình&nbsp;có&nbsp;thể&nbsp;điều&nbsp;chỉnh&nbsp;thứ&nbsp;tự&nbsp;tham&nbsp;quan&nbsp;theo&nbsp;tình&nbsp;hình&nbsp;thực&nbsp;tế&nbsp;nhưng&nbsp;vẫn&nbsp;đảm&nbsp;bảo&nbsp;đầy&nbsp;đủ&nbsp;điểm.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Tour&nbsp;khởi&nbsp;hành&nbsp;khi&nbsp;đủ&nbsp;15&nbsp;khách&nbsp;người&nbsp;lớn,&nbsp;nếu&nbsp;chưa&nbsp;đủ&nbsp;số&nbsp;lượng&nbsp;công&nbsp;ty&nbsp;sẽ&nbsp;thông&nbsp;báo&nbsp;và&nbsp;thỏa&nbsp;thuận&nbsp;lại&nbsp;ngày&nbsp;khởi&nbsp;hành&nbsp;hoặc&nbsp;hoàn&nbsp;tiền.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Do&nbsp;tính&nbsp;chất&nbsp;tour&nbsp;ghép,&nbsp;Quý&nbsp;khách&nbsp;cần&nbsp;đi&nbsp;theo&nbsp;đoàn&nbsp;suốt&nbsp;hành&nbsp;trình&nbsp;và&nbsp;về&nbsp;đúng&nbsp;ngày&nbsp;kết&nbsp;thúc&nbsp;tour.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Các&nbsp;dịch&nbsp;vụ&nbsp;trong&nbsp;chương&nbsp;trình&nbsp;đã&nbsp;được&nbsp;sắp&nbsp;xếp&nbsp;trước&nbsp;theo&nbsp;đoàn;&nbsp;trường&nbsp;hợp&nbsp;không&nbsp;sử&nbsp;dụng&nbsp;vì&nbsp;lý&nbsp;do&nbsp;cá&nbsp;nhân&nbsp;sẽ&nbsp;không&nbsp;được&nbsp;hoàn&nbsp;lại&nbsp;tiền.</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Xuất&nbsp;nhập&nbsp;cảnh:</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Quý&nbsp;khách&nbsp;cần&nbsp;đảm&nbsp;bảo&nbsp;giấy&nbsp;tờ&nbsp;cá&nbsp;nhân&nbsp;hợp&nbsp;lệ&nbsp;theo&nbsp;quy&nbsp;định&nbsp;xuất/nhập&nbsp;cảnh,&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour.&nbsp;Trường&nbsp;hợp&nbsp;không&nbsp;được&nbsp;xuất/nhập&nbsp;cảnh,&nbsp;không&nbsp;thực&nbsp;hiện&nbsp;được&nbsp;chuyến&nbsp;đi&nbsp;do&nbsp;cơ&nbsp;quan&nbsp;chức&nbsp;năng&nbsp;không&nbsp;chấp&nbsp;thuận&nbsp;(vì&nbsp;bất&nbsp;kỳ&nbsp;lý&nbsp;do&nbsp;gì),&nbsp;chi&nbsp;phí&nbsp;tour&nbsp;sẽ&nbsp;không&nbsp;được&nbsp;hoàn&nbsp;trả.&nbsp;Công&nbsp;ty&nbsp;sẽ&nbsp;hỗ&nbsp;trợ&nbsp;hướng&nbsp;dẫn&nbsp;trong&nbsp;phạm&nbsp;vi&nbsp;có&nbsp;thể&nbsp;để&nbsp;giải&nbsp;quyết&nbsp;cho&nbsp;Quý&nbsp;khách.&nbsp;Mọi&nbsp;chi&nbsp;phí&nbsp;phát&nbsp;sinh&nbsp;Quý&nbsp;khách&nbsp;tự&nbsp;chủ&nbsp;động&nbsp;sắp&nbsp;xếp.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Đối&nbsp;với&nbsp;quý&nbsp;khách&nbsp;có&nbsp;thay&nbsp;đổi&nbsp;đáng&nbsp;kể&nbsp;về&nbsp;đặc&nbsp;điểm&nbsp;nhận&nbsp;dạng&nbsp;trên&nbsp;khuôn&nbsp;mặt,&nbsp;ví&nbsp;dụ:&nbsp;phẫu&nbsp;thuật&nbsp;thẩm&nbsp;mỹ,&nbsp;vui&nbsp;lòng&nbsp;làm&nbsp;lại&nbsp;hộ&nbsp;chiếu&nbsp;theo&nbsp;quy&nbsp;định&nbsp;trước&nbsp;khi&nbsp;khởi&nbsp;hành.&nbsp;Trường&nbsp;hợp&nbsp;sử&nbsp;dụng&nbsp;hộ&nbsp;chiếu&nbsp;không&nbsp;còn&nbsp;phù&nbsp;hợp&nbsp;với&nbsp;diện&nbsp;mạo&nbsp;hiện&nbsp;tại&nbsp;và&nbsp;phát&nbsp;sinh&nbsp;vấn&nbsp;đề&nbsp;khi&nbsp;xuất&nbsp;nhập&nbsp;cảnh,&nbsp;Quý&nbsp;khách&nbsp;vui&nbsp;long&nbsp;tự&nbsp;chịu&nbsp;trách&nbsp;nhiệm.&nbsp;Các&nbsp;chi&nbsp;phí&nbsp;hủy&nbsp;đổi&nbsp;dịch&nbsp;vụ&nbsp;(nếu&nbsp;có)&nbsp;sẽ&nbsp;được&nbsp;áp&nbsp;dụng&nbsp;theo&nbsp;quy&nbsp;định.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Đối&nbsp;với&nbsp;khách&nbsp;đã&nbsp;chuyển&nbsp;giới,&nbsp;thông&nbsp;tin&nbsp;trên&nbsp;Hộ&nbsp;chiếu&nbsp;và&nbsp;CCCD&nbsp;phải&nbsp;thống&nbsp;nhất&nbsp;và&nbsp;trùng&nbsp;khớp.&nbsp;Hình&nbsp;ảnh&nbsp;trên&nbsp;hộ&nbsp;chiếu&nbsp;cần&nbsp;là&nbsp;hình&nbsp;chụp&nbsp;sau&nbsp;khi&nbsp;chuyển&nbsp;giới/phẫu&nbsp;thuật&nbsp;thẩm&nbsp;mỹ,&nbsp;đảm&nbsp;bảo&nbsp;nhận&nbsp;diện&nbsp;rõ&nbsp;ràng&nbsp;theo&nbsp;hiện&nbsp;trạng&nbsp;thực&nbsp;tế,&nbsp;giống&nbsp;với&nbsp;hộ&nbsp;chiếu&nbsp;hiện&nbsp;đang&nbsp;sử&nbsp;dụng.</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Bất&nbsp;khả&nbsp;kháng:</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Giờ&nbsp;bay&nbsp;có&nbsp;thể&nbsp;thay&nbsp;đổi&nbsp;theo&nbsp;hãng&nbsp;hàng&nbsp;không.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trong&nbsp;các&nbsp;tình&nbsp;huống&nbsp;ngoài&nbsp;khả&nbsp;năng&nbsp;kiểm&nbsp;soát&nbsp;như&nbsp;thời&nbsp;tiết,&nbsp;thiên&nbsp;tai,&nbsp;dịch&nbsp;bệnh,&nbsp;sự&nbsp;cố&nbsp;an&nbsp;ninh,&nbsp;chiến&nbsp;tranh,&nbsp;sân&nbsp;bay&nbsp;đóng&nbsp;cửa&nbsp;hoặc&nbsp;thay&nbsp;đổi&nbsp;từ&nbsp;đơn&nbsp;vị&nbsp;vận&nbsp;chuyển,&nbsp;…&nbsp;lịch&nbsp;trình&nbsp;có&nbsp;thể&nbsp;được&nbsp;điều&nbsp;chỉnh&nbsp;để&nbsp;đảm&nbsp;bảo&nbsp;an&nbsp;toàn&nbsp;và&nbsp;quyền&nbsp;lợi&nbsp;cho&nbsp;Quý&nbsp;khách.&nbsp;Công&nbsp;ty&nbsp;sẽ&nbsp;nỗ&nbsp;lực&nbsp;tối&nbsp;đa&nbsp;để&nbsp;hỗ&nbsp;trợ&nbsp;và&nbsp;phối&nbsp;hợp&nbsp;cùng&nbsp;Quý&nbsp;khách&nbsp;xử&nbsp;lý&nbsp;phát&nbsp;sinh.&nbsp;Tuy&nbsp;nhiên,&nbsp;các&nbsp;chi&nbsp;phí&nbsp;liên&nbsp;quan&nbsp;như&nbsp;ăn&nbsp;uống,&nbsp;đi&nbsp;lại,&nbsp;lưu&nbsp;trú,&nbsp;đổi/đặt&nbsp;lại&nbsp;vé&nbsp;…&nbsp;(nếu&nbsp;có)&nbsp;Quý&nbsp;khách&nbsp;vui&nbsp;lòng&nbsp;thanh&nbsp;toán&nbsp;theo&nbsp;thực&nbsp;tế.&nbsp;Công&nbsp;ty&nbsp;sẽ&nbsp;đồng&nbsp;hành&nbsp;và&nbsp;hỗ&nbsp;trợ&nbsp;để&nbsp;Quý&nbsp;khách&nbsp;có&nbsp;phương&nbsp;án&nbsp;phù&nbsp;hợp&nbsp;và&nbsp;thuận&nbsp;tiện&nbsp;nhất.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 60, 113);">Hướng&nbsp;dẫn&nbsp;viên</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Hướng&nbsp;Dẫn&nbsp;Viên&nbsp;(HDV)&nbsp;sẽ&nbsp;liên&nbsp;lạc&nbsp;với&nbsp;Quý&nbsp;Khách&nbsp;khoảng&nbsp;2&nbsp;ngày&nbsp;trước&nbsp;khi&nbsp;khởi&nbsp;hành&nbsp;để&nbsp;sắp&nbsp;xếp&nbsp;giờ&nbsp;đón&nbsp;và&nbsp;cung&nbsp;cấp&nbsp;các&nbsp;thông&nbsp;tin&nbsp;cần&nbsp;thiết&nbsp;cho&nbsp;chuyển&nbsp;đi.</span></p>', '<p>Không&nbsp;có</p>'),
	(13, 15, 'vi', 'Tour Đài Loan 5N4Đ: HCM - Cao Hùng - Đài Trung - Đài Bắc - Thủy Cung X-park', 'tour-dai-loan-5n4d-hcm-cao-hung-dai-trung-dai-bac-thuy-cung-x-park', 'Tour Đài Loan 5N4Đ: HCM - Cao Hùng - Đài Trung - Đài Bắc - Thủy Cung X-park', 'Check-in Tháp Taipei 101: Biểu tượng Đài Loan, tự do mua sắm.\r\nDu thuyền tại thiên đường hạ giới ngoài đời thực – Hồ Nhật Nguyệt\r\nTặng “đèn Thiên Đăng” tại điểm phố cổ Thập Phần.\r\nTặng vé tham quan Bảo tàng Kỳ Mỹ (Chimei Museum) - Nơi hội tụ của nghệ thuật và lịch sử Đài Loan.\r\nChiêm bái “Phật Quang Sơn Tự” – Kinh đô Phật Giáo của Đài Loan.', '<p>Vận&nbsp;Chuyển:</p><p></p><p>-&nbsp;Vé&nbsp;máy&nbsp;bay&nbsp;khứ&nbsp;hồi&nbsp;theo&nbsp;hãng&nbsp;Eva&nbsp;Air&nbsp;(23kg&nbsp;hành&nbsp;lý&nbsp;ký&nbsp;gửi&nbsp;+&nbsp;xách&nbsp;tay&nbsp;7kg)&nbsp;</p><p></p><p>-&nbsp;Xe&nbsp;máy&nbsp;lạnh&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;tuyến.</p><p></p><p>-&nbsp;Phí&nbsp;an&nbsp;ninh&nbsp;sân&nbsp;bay,&nbsp;bảo&nbsp;hiểm&nbsp;hàng&nbsp;không,&nbsp;thuế&nbsp;phi&nbsp;trường&nbsp;2&nbsp;nước&nbsp;(theo&nbsp;quy&nbsp;định&nbsp;tại&nbsp;thời&nbsp;điểm&nbsp;xuất&nbsp;vé)</p><p></p><p>Lưu&nbsp;Trú:</p><p></p><p>-&nbsp;Khách&nbsp;sạn&nbsp;tiêu&nbsp;chuẩn&nbsp;3*&nbsp;địa&nbsp;phương&nbsp;(2&nbsp;khách/phòng;&nbsp;khách&nbsp;lẻ&nbsp;nam/nữ&nbsp;có&nbsp;thể&nbsp;bố&nbsp;trí&nbsp;ghép&nbsp;phòng)</p><p></p><p>Khác:&nbsp;</p><p></p><p>-&nbsp;Visa&nbsp;nhập&nbsp;cảnh&nbsp;Đài&nbsp;Loan&nbsp;theo&nbsp;chương&nbsp;trình.</p><p></p><p>-&nbsp;Vé&nbsp;tham&nbsp;quan&nbsp;theo&nbsp;chương&nbsp;trình:&nbsp;Tặng&nbsp;thả&nbsp;đèn&nbsp;Thiên&nbsp;Đăng&nbsp;+&nbsp;lớp&nbsp;học&nbsp;làm&nbsp;bánh&nbsp;dứa&nbsp;Virgo&nbsp;Kobo&nbsp;Pineapple&nbsp;Cake&nbsp;DIY.</p><p></p><p>-&nbsp;Các&nbsp;bữa&nbsp;ăn&nbsp;theo&nbsp;chương&nbsp;trình:&nbsp;Tặng&nbsp;bữa&nbsp;Buffet&nbsp;lẩu,&nbsp;tặng&nbsp;bữa&nbsp;Mì-Bò&nbsp;Bít&nbsp;Tết,&nbsp;tặng&nbsp;bữa&nbsp;hấp&nbsp;thủy&nbsp;nhiệt&nbsp;Hongkong,&nbsp;tặng&nbsp;ly&nbsp;trà&nbsp;sữa&nbsp;truyền&nbsp;thống.&nbsp;(đảm&nbsp;bảo&nbsp;số&nbsp;lượng&nbsp;&amp;&nbsp;chất&nbsp;lượng&nbsp;tương&nbsp;đương&nbsp;nếu&nbsp;có&nbsp;điều&nbsp;chỉnh)</p><p></p><p>-&nbsp;Nước&nbsp;suối&nbsp;01&nbsp;chai/người/ngày.</p><p></p><p>-&nbsp;Bảo&nbsp;hiểm&nbsp;du&nbsp;lịch&nbsp;quốc&nbsp;tế&nbsp;suốt&nbsp;tuyến.&nbsp;</p><p></p><p>-&nbsp;Trưởng&nbsp;đoàn&nbsp;và&nbsp;HDV&nbsp;địa&nbsp;phương&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;hành&nbsp;trình.</p><p></p><p>-&nbsp;Thuế&nbsp;VAT.&nbsp;</p>', '<p>Vận&nbsp;Chuyển:</p><p></p><p>-&nbsp;Vé&nbsp;máy&nbsp;bay&nbsp;khứ&nbsp;hồi&nbsp;theo&nbsp;hãng&nbsp;Eva&nbsp;Air&nbsp;(23kg&nbsp;hành&nbsp;lý&nbsp;ký&nbsp;gửi&nbsp;+&nbsp;xách&nbsp;tay&nbsp;7kg)&nbsp;</p><p></p><p>-&nbsp;Xe&nbsp;máy&nbsp;lạnh&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;tuyến.</p><p></p><p>-&nbsp;Phí&nbsp;an&nbsp;ninh&nbsp;sân&nbsp;bay,&nbsp;bảo&nbsp;hiểm&nbsp;hàng&nbsp;không,&nbsp;thuế&nbsp;phi&nbsp;trường&nbsp;2&nbsp;nước&nbsp;(theo&nbsp;quy&nbsp;định&nbsp;tại&nbsp;thời&nbsp;điểm&nbsp;xuất&nbsp;vé)</p><p></p><p>Lưu&nbsp;Trú:</p><p></p><p>-&nbsp;Khách&nbsp;sạn&nbsp;tiêu&nbsp;chuẩn&nbsp;3*&nbsp;địa&nbsp;phương&nbsp;(2&nbsp;khách/phòng;&nbsp;khách&nbsp;lẻ&nbsp;nam/nữ&nbsp;có&nbsp;thể&nbsp;bố&nbsp;trí&nbsp;ghép&nbsp;phòng)</p><p></p><p>Khác:&nbsp;</p><p></p><p>-&nbsp;Visa&nbsp;nhập&nbsp;cảnh&nbsp;Đài&nbsp;Loan&nbsp;theo&nbsp;chương&nbsp;trình.</p><p></p><p>-&nbsp;Vé&nbsp;tham&nbsp;quan&nbsp;theo&nbsp;chương&nbsp;trình:&nbsp;Tặng&nbsp;thả&nbsp;đèn&nbsp;Thiên&nbsp;Đăng&nbsp;+&nbsp;lớp&nbsp;học&nbsp;làm&nbsp;bánh&nbsp;dứa&nbsp;Virgo&nbsp;Kobo&nbsp;Pineapple&nbsp;Cake&nbsp;DIY.</p><p></p><p>-&nbsp;Các&nbsp;bữa&nbsp;ăn&nbsp;theo&nbsp;chương&nbsp;trình:&nbsp;Tặng&nbsp;bữa&nbsp;Buffet&nbsp;lẩu,&nbsp;tặng&nbsp;bữa&nbsp;Mì-Bò&nbsp;Bít&nbsp;Tết,&nbsp;tặng&nbsp;bữa&nbsp;hấp&nbsp;thủy&nbsp;nhiệt&nbsp;Hongkong,&nbsp;tặng&nbsp;ly&nbsp;trà&nbsp;sữa&nbsp;truyền&nbsp;thống.&nbsp;(đảm&nbsp;bảo&nbsp;số&nbsp;lượng&nbsp;&amp;&nbsp;chất&nbsp;lượng&nbsp;tương&nbsp;đương&nbsp;nếu&nbsp;có&nbsp;điều&nbsp;chỉnh)</p><p></p><p>-&nbsp;Nước&nbsp;suối&nbsp;01&nbsp;chai/người/ngày.</p><p></p><p>-&nbsp;Bảo&nbsp;hiểm&nbsp;du&nbsp;lịch&nbsp;quốc&nbsp;tế&nbsp;suốt&nbsp;tuyến.&nbsp;</p><p></p><p>-&nbsp;Trưởng&nbsp;đoàn&nbsp;và&nbsp;HDV&nbsp;địa&nbsp;phương&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;hành&nbsp;trình.</p><p></p><p>-&nbsp;Thuế&nbsp;VAT.&nbsp;</p>', '<p>Chính&nbsp;sách&nbsp;trẻ&nbsp;em</p><p><strong>1.&nbsp;Quy&nbsp;định&nbsp;chung:</strong></p><p>-&nbsp;Mỗi&nbsp;02&nbsp;người&nbsp;lớn&nbsp;được&nbsp;kèm&nbsp;01&nbsp;trẻ&nbsp;em.</p><p>-&nbsp;Từ&nbsp;trẻ&nbsp;thứ&nbsp;02&nbsp;trở&nbsp;đi,&nbsp;áp&nbsp;dụng&nbsp;mức&nbsp;giá&nbsp;theo&nbsp;quy&nbsp;định&nbsp;của&nbsp;từng&nbsp;nhóm&nbsp;tuổi&nbsp;(nêu&nbsp;bên&nbsp;dưới).</p><p>-&nbsp;Trẻ&nbsp;em&nbsp;ngủ&nbsp;chung&nbsp;giường&nbsp;với&nbsp;bố&nbsp;mẹ.&nbsp;Nếu&nbsp;cần&nbsp;giường&nbsp;riêng:&nbsp;Tính&nbsp;như&nbsp;người&nbsp;lớn</p><p>-&nbsp;Chi&nbsp;phí&nbsp;ngoài&nbsp;chương&nbsp;trình&nbsp;(nếu&nbsp;có)&nbsp;gia&nbsp;đình&nbsp;tự&nbsp;chi&nbsp;trả.</p><p><strong>2.&nbsp;Quy&nbsp;định&nbsp;theo&nbsp;độ&nbsp;tuổi:</strong></p><p>-&nbsp;Trẻ&nbsp;dưới&nbsp;2&nbsp;tuổi:&nbsp;Giá&nbsp;như&nbsp;trên&nbsp;website,&nbsp;đã&nbsp;bao&nbsp;gồm&nbsp;vé&nbsp;máy&nbsp;bay,&nbsp;không&nbsp;có&nbsp;ghế&nbsp;riêng,&nbsp;ngủ&nbsp;chung&nbsp;với&nbsp;bố&nbsp;mẹ.</p><p>-&nbsp;Trẻ&nbsp;từ&nbsp;2&nbsp;-&nbsp;11&nbsp;tuổi:&nbsp;Giá&nbsp;như&nbsp;trên&nbsp;website,&nbsp;bao&nbsp;gồm&nbsp;đầy&nbsp;đủ&nbsp;dịch&nbsp;vụ&nbsp;trong&nbsp;chương&nbsp;trình.&nbsp;Ngủ&nbsp;chung&nbsp;với&nbsp;bố&nbsp;mẹ.&nbsp;Từ&nbsp;trẻ&nbsp;thứ&nbsp;02&nbsp;trở&nbsp;đi:&nbsp;tính&nbsp;100%&nbsp;giá&nbsp;người&nbsp;lớn.</p><p>-&nbsp;Trẻ&nbsp;từ&nbsp;12&nbsp;tuổi&nbsp;trở&nbsp;lên:&nbsp;tính&nbsp;giá&nbsp;như&nbsp;người&nbsp;lớn.</p><p>-&nbsp;Trong&nbsp;trường&nbsp;hợp&nbsp;chỉ&nbsp;có&nbsp;1&nbsp;khách&nbsp;(người&nbsp;lớn)&nbsp;đi&nbsp;với&nbsp;1&nbsp;bé&nbsp;(dưới&nbsp;12&nbsp;tuổi),&nbsp;bé&nbsp;được&nbsp;tính&nbsp;giá&nbsp;vé&nbsp;người&nbsp;lớn&nbsp;để&nbsp;đảm&nbsp;bảo&nbsp;dịch&nbsp;vụ&nbsp;theo&nbsp;quy&nbsp;định.</p><p><strong>Giấy&nbsp;tờ&nbsp;tùy&nbsp;thân&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour</strong></p><p>-&nbsp;Hộ&nbsp;chiếu&nbsp;bản&nbsp;chính&nbsp;và&nbsp;các&nbsp;giấy&nbsp;tờ&nbsp;cần&nbsp;thiết</p><p>-&nbsp;Trẻ&nbsp;em&nbsp;cần&nbsp;có&nbsp;bố&nbsp;mẹ&nbsp;hoặc&nbsp;người&nbsp;thân&nbsp;trên&nbsp;18&nbsp;tuổi&nbsp;đi&nbsp;cùng;&nbsp;trường&nbsp;hợp&nbsp;đi&nbsp;cùng&nbsp;người&nbsp;thân&nbsp;cần&nbsp;có&nbsp;giấy&nbsp;ủy&nbsp;quyền&nbsp;hợp&nbsp;lệ.</p>', '<p>Chính&nbsp;sách&nbsp;hủy&nbsp;&amp;&nbsp;thay&nbsp;đổi</p><p>-&nbsp;Huỷ&nbsp;từ&nbsp;thời&nbsp;điểm&nbsp;đăng&nbsp;ký&nbsp;đến&nbsp;trước&nbsp;22&nbsp;ngày:&nbsp;Phí&nbsp;hủy&nbsp;là&nbsp;2.000.000&nbsp;VNĐ</p><p>-&nbsp;Hủy&nbsp;trước&nbsp;15&nbsp;-21&nbsp;ngày&nbsp;khởi&nbsp;hành:&nbsp;phí&nbsp;hủy&nbsp;là&nbsp;50%&nbsp;trên&nbsp;giá&nbsp;tour.</p><p>-&nbsp;Hủy&nbsp;trước&nbsp;7-14&nbsp;ngày&nbsp;khởi&nbsp;hành:&nbsp;phí&nbsp;hủy&nbsp;là&nbsp;70%&nbsp;trên&nbsp;giá&nbsp;tour.</p><p>-&nbsp;Sau&nbsp;thời&nbsp;gian&nbsp;trên:&nbsp;100%&nbsp;tổng&nbsp;giá&nbsp;tour.</p><p>-&nbsp;Trường&nbsp;hợp&nbsp;Quý&nbsp;khách&nbsp;bị&nbsp;từ&nbsp;chối&nbsp;cấp&nbsp;visa,&nbsp;sẽ&nbsp;được&nbsp;hoàn&nbsp;cọc&nbsp;100%&nbsp;(trừ&nbsp;một&nbsp;số&nbsp;trường&nbsp;hợp&nbsp;cố&nbsp;ý&nbsp;hoặc&nbsp;không&nbsp;hợp&nbsp;tác&nbsp;dẫn&nbsp;tới&nbsp;bị&nbsp;từ&nbsp;chối&nbsp;visa,&nbsp;áp&nbsp;dụng&nbsp;phí&nbsp;hủy:&nbsp;2.000.000&nbsp;VNĐ/khách).</p><p>-&nbsp;Thời&nbsp;gian&nbsp;hủy/thay&nbsp;đổi&nbsp;tour&nbsp;được&nbsp;ghi&nbsp;nhận&nbsp;trong&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;và&nbsp;tính&nbsp;theo&nbsp;ngày&nbsp;làm&nbsp;việc&nbsp;(không&nbsp;bao&nbsp;gồm&nbsp;Thứ&nbsp;Bảy,&nbsp;Chủ&nbsp;Nhật&nbsp;và&nbsp;Lễ/Tết).&nbsp;Các&nbsp;yêu&nbsp;cầu&nbsp;gửi&nbsp;ngoài&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;sẽ&nbsp;được&nbsp;tính&nbsp;từ&nbsp;đầu&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;của&nbsp;ngày&nbsp;kế&nbsp;tiếp.</p><p>-&nbsp;Quý&nbsp;khách&nbsp;vui&nbsp;lòng&nbsp;gửi&nbsp;yêu&nbsp;cầu&nbsp;hủy&nbsp;qua&nbsp;email&nbsp;hoặc&nbsp;kênh&nbsp;liên&nbsp;hệ&nbsp;chính&nbsp;thức&nbsp;của&nbsp;công&nbsp;ty&nbsp;để&nbsp;được&nbsp;ghi&nbsp;nhận.&nbsp;Thông&nbsp;báo&nbsp;qua&nbsp;điện&nbsp;thoại&nbsp;sẽ&nbsp;chưa&nbsp;được&nbsp;xem&nbsp;là&nbsp;căn&nbsp;cứ&nbsp;áp&nbsp;dụng&nbsp;chính&nbsp;sách&nbsp;hủy.</p><p>-&nbsp;Nếu&nbsp;Quý&nbsp;khách&nbsp;hủy&nbsp;tour&nbsp;sau&nbsp;khi&nbsp;visa&nbsp;đã&nbsp;được&nbsp;cấp,&nbsp;công&nbsp;ty&nbsp;sẽ&nbsp;thực&nbsp;hiện&nbsp;thủ&nbsp;tục&nbsp;hủy&nbsp;visa&nbsp;theo&nbsp;quy&nbsp;định.</p><p>Thông&nbsp;tin&nbsp;Visa</p><p><strong>VISA&nbsp;ĐÀI&nbsp;LOAN&nbsp;QUAN&nbsp;HỒNG</strong>&nbsp;(HỒ&nbsp;SƠ&nbsp;SCAN&nbsp;RÕ&nbsp;HOẶC&nbsp;CHỤP&nbsp;HÌNH)</p><p>Để&nbsp;chuẩn&nbsp;bị&nbsp;tốt&nbsp;nhất&nbsp;cho&nbsp;việc&nbsp;xin&nbsp;visa&nbsp;Quan&nbsp;Hồng&nbsp;nhập&nbsp;cảnh&nbsp;vào&nbsp;Đài&nbsp;Loan,&nbsp;công&nbsp;ty&nbsp;xin&nbsp;gửi&nbsp;Quý&nbsp;Khách&nbsp;những&nbsp;thông&nbsp;tin&nbsp;hồ&nbsp;sơ&nbsp;cơ&nbsp;bản&nbsp;để&nbsp;chuẩn&nbsp;bị&nbsp;như&nbsp;sau:&nbsp;Ngoài&nbsp;ra,&nbsp;công&nbsp;ty&nbsp;sẽ&nbsp;cập&nbsp;nhật&nbsp;các&nbsp;thủ&nbsp;tục&nbsp;cần&nbsp;thiết&nbsp;cho&nbsp;quý&nbsp;khách&nbsp;nếu&nbsp;có&nbsp;bất&nbsp;cứ&nbsp;thay&nbsp;đổi&nbsp;nào&nbsp;từ&nbsp;phía&nbsp;lãnh&nbsp;sự&nbsp;quán.</p><p><strong>Hồ&nbsp;sơ&nbsp;xin&nbsp;visa:</strong></p><p>-&nbsp;Hộ&nbsp;chiếu&nbsp;còn&nbsp;hạn&nbsp;trên&nbsp;6&nbsp;tháng&nbsp;tính&nbsp;từ&nbsp;ngày&nbsp;kết&nbsp;thúc&nbsp;tour.&nbsp;Scan/Chụp&nbsp;rõ&nbsp;không&nbsp;bóng,&nbsp;không&nbsp;chói,&nbsp;thấy&nbsp;đầy&nbsp;đủ&nbsp;thông&nbsp;tin.</p><p>-&nbsp;Nếu&nbsp;hộ&nbsp;chiếu&nbsp;không&nbsp;có&nbsp;mục&nbsp;nơi&nbsp;sinh&nbsp;thì&nbsp;Scan/Chụp&nbsp;thêm&nbsp;bị&nbsp;chú&nbsp;nơi&nbsp;sinh&nbsp;hoặc&nbsp;căn&nbsp;cước&nbsp;công&nbsp;dân&nbsp;gốc&nbsp;2&nbsp;mặt</p><p>-&nbsp;Hình&nbsp;thẻ&nbsp;nền&nbsp;trắng&nbsp;chụp&nbsp;mới&nbsp;nhất&nbsp;gửi&nbsp;File&nbsp;mềm&nbsp;(thấy&nbsp;rõ&nbsp;ngũ&nbsp;quan&nbsp;trán,&nbsp;tai,&nbsp;chân&nbsp;mày,&nbsp;không&nbsp;đeo&nbsp;kính,&nbsp;không&nbsp;đeo&nbsp;bông&nbsp;tai,&nbsp;không&nbsp;cười&nbsp;nhe&nbsp;răng,&nbsp;không&nbsp;trùng&nbsp;hình&nbsp;hộ&nbsp;chiếu)</p><p>-&nbsp;Thông&nbsp;tin&nbsp;khai&nbsp;form&nbsp;xin&nbsp;visa&nbsp;Đài&nbsp;Loan&nbsp;theo&nbsp;mẫu</p>');

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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.tours: ~13 rows (approximately)
DELETE FROM `tours`;
INSERT INTO `tours` (`id`, `category_id`, `title`, `slug`, `summary`, `highlights`, `price_includes`, `price_excludes`, `terms_and_notes`, `cancellation_policy`, `duration_days`, `duration_nights`, `thumbnail_url`, `tour_badge`, `status`) VALUES
	(1, 2, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 3', 'tour-kham-pha-sapa-chinh-phuc-fansipan', 'Hành trình đến với thị trấn trong sương, khám phá bản Cát Cát và chinh phục nóc nhà Đông Dương.', NULL, NULL, NULL, NULL, NULL, 3, 2, '/uploads/tours/tour-1777299641824-589815401.jpg', 'featured', 'active'),
	(2, 1, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 1', 'nghi-duong-phu-quoc-hon-thom', 'Tận hưởng nắng vàng biển xanh tại đảo ngọc Phú Quốc, đi cáp treo vượt biển dài nhất thế giới.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/tours/tour-1777299641824-589815401.jpg', 'featured', 'active'),
	(3, 1, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 1', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/tours/tour-1777299641824-589815401.jpg', 'featured', 'active'),
	(4, 2, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 2', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na1', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/tours/tour-1777299641824-589815401.jpg', 'featured', 'active'),
	(5, 1, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 3', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na2', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/tours/tour-1777299641824-589815401.jpg', 'featured', 'active'),
	(6, 1, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 4', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na3', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/tours/tour-1777299641824-589815401.jpg', 'featured', 'active'),
	(7, 2, 'Hành trình di sản: Đà Nẵng - Hội An - Bà Nà Hills 5', 'hanh-trinh-di-san-da-nang-hoi-an-ba-na4', 'Tham quan các điểm đến nổi tiếng nhất miền Trung: Cầu Vàng, phố cổ Hội An, biển Mỹ Khê.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/tours/tour-1777299641824-589815401.jpg', 'featured', 'active'),
	(8, 2, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 1', 'tour-kham-pha-sapa-chinh-phuc-fansipan1', 'Hành trình đến với thị trấn trong sương, khám phá bản Cát Cát và chinh phục nóc nhà Đông Dương.', NULL, NULL, NULL, NULL, NULL, 3, 2, '/uploads/tours/tour-1777299641824-589815401.jpg', 'featured', 'active'),
	(9, 1, 'Tour Khám Phá Sapa - Chinh Phục Đỉnh Fansipan 2', 'tour-kham-pha-sapa-chinh-phuc-fansipan2', 'Hành trình đến với thị trấn trong sương, khám phá bản Cát Cát và chinh phục nóc nhà Đông Dương.', NULL, NULL, NULL, NULL, NULL, 3, 2, '/uploads/tours/tour-1777299641824-589815401.jpg', 'featured', 'active'),
	(10, 1, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 2', 'nghi-duong-phu-quoc-hon-thom1', 'Tận hưởng nắng vàng biển xanh tại đảo ngọc Phú Quốc, đi cáp treo vượt biển dài nhất thế giới.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/tours/tour-1777299641824-589815401.jpg', 'featured', 'active'),
	(11, 1, 'Nghỉ dưỡng Phú Quốc - Khám phá Hòn Thơm Nature Park 3', 'nghi-duong-phu-quoc-hon-thom2', 'Tận hưởng nắng vàng biển xanh tại đảo ngọc Phú Quốc, đi cáp treo vượt biển dài nhất thế giới.', NULL, NULL, NULL, NULL, NULL, 4, 3, '/uploads/tours/tour-1777299641824-589815401.jpg', 'featured', 'active'),
	(13, 2, 'Tour Malaysia - Singapore 5N4Đ: Khám Phá Văn Hóa Đông Nam Á', 'tour-malaysia-singapore-5n4d-kham-pha-van-hoa-dong-nam-a', 'Khám phá Gardens by the Bay: Vườn sinh thái biểu tượng Singapore.', '<p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">Khám&nbsp;phá&nbsp;Gardens&nbsp;by&nbsp;the&nbsp;Bay:&nbsp;Vườn&nbsp;sinh&nbsp;thái&nbsp;biểu&nbsp;tượng&nbsp;Singapore.</span></p><p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">Ghé&nbsp;thăm&nbsp;Marina&nbsp;Bay&nbsp;Sands&nbsp;và&nbsp;Merlion&nbsp;Park:&nbsp;Biểu&nbsp;tượng&nbsp;quốc&nbsp;đảo&nbsp;sư&nbsp;tử.</span></p><p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">Tham&nbsp;quan&nbsp;Động&nbsp;Batu&nbsp;huyền&nbsp;bí&nbsp;&amp;&nbsp;chinh&nbsp;phục&nbsp;272&nbsp;bậc&nbsp;thang&nbsp;sắc&nbsp;màu.</span></p><p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">Trải&nbsp;nghiệm&nbsp;cao&nbsp;nguyên&nbsp;Genting:&nbsp;Thành&nbsp;phố&nbsp;giải&nbsp;trí&nbsp;giữa&nbsp;mây&nbsp;trời.</span></p><p><span style="color: rgb(63, 59, 59); background-color: rgb(255, 255, 255);">Check-in&nbsp;Nhà&nbsp;thờ&nbsp;Hồi&nbsp;giáo&nbsp;Putra&nbsp;&amp;&nbsp;Quảng&nbsp;trường&nbsp;Độc&nbsp;Lập&nbsp;Kuala&nbsp;Lumpur.</span></p>', '<p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Vận&nbsp;chuyển</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Vé&nbsp;máy&nbsp;bay&nbsp;khứ&nbsp;hồi&nbsp;theo&nbsp;hãng&nbsp;Vietnam&nbsp;Airline&nbsp;(23kg&nbsp;hành&nbsp;lý&nbsp;ký&nbsp;gửi&nbsp;+&nbsp;xách&nbsp;tay&nbsp;10kg).</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Xe&nbsp;máy&nbsp;lạnh&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;tuyến.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Phí&nbsp;an&nbsp;ninh&nbsp;sân&nbsp;bay,&nbsp;bảo&nbsp;hiểm&nbsp;hàng&nbsp;không,&nbsp;thuế&nbsp;phi&nbsp;trường&nbsp;2&nbsp;nước&nbsp;(theo&nbsp;quy&nbsp;định&nbsp;tại&nbsp;thời&nbsp;điểm&nbsp;xuất&nbsp;vé).</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Lưu&nbsp;trú</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Khách&nbsp;sạn&nbsp;tiêu&nbsp;chuẩn&nbsp;3-4*&nbsp;địa&nbsp;phương&nbsp;(2&nbsp;khách/phòng;&nbsp;khách&nbsp;lẻ&nbsp;nam/nữ&nbsp;có&nbsp;thể&nbsp;bố&nbsp;trí&nbsp;phòng&nbsp;phù&nbsp;hợp).</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Dịch&nbsp;vụ&nbsp;khác</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Vé&nbsp;tham&nbsp;quan&nbsp;trong&nbsp;chương&nbsp;trình.&nbsp;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Các&nbsp;bữa&nbsp;ăn&nbsp;theo&nbsp;chương&nbsp;trình.&nbsp;(đảm&nbsp;bảo&nbsp;số&nbsp;lượng&nbsp;&amp;&nbsp;chất&nbsp;lượng&nbsp;tương&nbsp;đương&nbsp;nếu&nbsp;có&nbsp;điều&nbsp;chỉnh).</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Nước&nbsp;suối&nbsp;01&nbsp;chai/khách/ngày.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Bảo&nbsp;hiểm&nbsp;du&nbsp;lịch&nbsp;quốc&nbsp;tế.&nbsp;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trưởng&nbsp;đoàn&nbsp;và&nbsp;HDV&nbsp;địa&nbsp;phương&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;hành&nbsp;trình.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Tặng&nbsp;nón&nbsp;du&nbsp;lịch.&nbsp;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Thuế&nbsp;VAT.</span></p>', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Phụ&nbsp;thu&nbsp;phòng&nbsp;đơn&nbsp;(nếu&nbsp;có):&nbsp;4.300.000đ/khách/tour&nbsp;-&nbsp;4.800.000đ/khách/tour.&nbsp;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Tips&nbsp;cho&nbsp;tài&nbsp;xế&nbsp;và&nbsp;hướng&nbsp;dẫn&nbsp;viên:&nbsp;25&nbsp;USD/khách/tour.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Phụ&nbsp;thu&nbsp;đối&nbsp;với&nbsp;khách&nbsp;mang&nbsp;quốc&nbsp;tịch&nbsp;nước&nbsp;ngoài:&nbsp;660.000đ/khách.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Visa&nbsp;tái&nbsp;nhập&nbsp;Việt&nbsp;Nam&nbsp;cho&nbsp;khách&nbsp;quốc&nbsp;tịch&nbsp;nước&nbsp;ngoài&nbsp;theo&nbsp;quy&nbsp;định&nbsp;hiện&nbsp;hành&nbsp;(nếu&nbsp;có).</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Chi&nbsp;phí&nbsp;cá&nbsp;nhân:&nbsp;hành&nbsp;lý&nbsp;quá&nbsp;cước,&nbsp;điện&nbsp;thoại,&nbsp;giặt&nbsp;ủi,&nbsp;tham&nbsp;quan,&nbsp;chi&nbsp;tiêu&nbsp;ngoài&nbsp;chương&nbsp;trình.</span></p>', '<p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 60, 113);">Chính&nbsp;sách&nbsp;trẻ&nbsp;em</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">1.&nbsp;Quy&nbsp;định&nbsp;chung:</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Mỗi&nbsp;02&nbsp;người&nbsp;lớn&nbsp;được&nbsp;kèm&nbsp;01&nbsp;trẻ&nbsp;em.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Từ&nbsp;trẻ&nbsp;thứ&nbsp;02&nbsp;trở&nbsp;đi,&nbsp;áp&nbsp;dụng&nbsp;mức&nbsp;giá&nbsp;theo&nbsp;quy&nbsp;định&nbsp;của&nbsp;từng&nbsp;nhóm&nbsp;tuổi&nbsp;(nêu&nbsp;bên&nbsp;dưới).</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trẻ&nbsp;em&nbsp;ngủ&nbsp;chung&nbsp;giường&nbsp;với&nbsp;bố&nbsp;mẹ.&nbsp;→&nbsp;Nếu&nbsp;cần&nbsp;giường&nbsp;riêng:&nbsp;Tính&nbsp;như&nbsp;người&nbsp;lớn.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Chi&nbsp;phí&nbsp;ngoài&nbsp;chương&nbsp;trình&nbsp;(nếu&nbsp;có)&nbsp;gia&nbsp;đình&nbsp;tự&nbsp;chi&nbsp;trả.</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">2.&nbsp;Quy&nbsp;định&nbsp;theo&nbsp;độ&nbsp;tuổi:</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trẻ&nbsp;dưới&nbsp;2&nbsp;tuổi:&nbsp;Giá&nbsp;như&nbsp;trên&nbsp;website,&nbsp;đã&nbsp;bao&nbsp;gồm&nbsp;vé&nbsp;máy&nbsp;bay,&nbsp;không&nbsp;có&nbsp;ghế&nbsp;riêng,&nbsp;ngủ&nbsp;chung&nbsp;với&nbsp;bố&nbsp;mẹ.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trẻ&nbsp;từ&nbsp;2&nbsp;-&nbsp;10&nbsp;tuổi:&nbsp;Giá&nbsp;như&nbsp;trên&nbsp;website,&nbsp;bao&nbsp;gồm&nbsp;đầy&nbsp;đủ&nbsp;dịch&nbsp;vụ&nbsp;trong&nbsp;chương&nbsp;trình.&nbsp;Ngủ&nbsp;chung&nbsp;với&nbsp;bố&nbsp;mẹ.&nbsp;Từ&nbsp;trẻ&nbsp;thứ&nbsp;02&nbsp;trở&nbsp;đi:&nbsp;tính&nbsp;100%&nbsp;giá&nbsp;người&nbsp;lớn.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trẻ&nbsp;từ&nbsp;11&nbsp;tuổi&nbsp;trở&nbsp;lên:&nbsp;tính&nbsp;giá&nbsp;như&nbsp;người&nbsp;lớn.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trong&nbsp;trường&nbsp;hợp&nbsp;chỉ&nbsp;có&nbsp;1&nbsp;khách&nbsp;(người&nbsp;lớn)&nbsp;đi&nbsp;với&nbsp;1&nbsp;bé&nbsp;(dưới&nbsp;12&nbsp;tuổi),&nbsp;bé&nbsp;được&nbsp;tính&nbsp;giá&nbsp;vé&nbsp;người&nbsp;lớn&nbsp;để&nbsp;đảm&nbsp;bảo&nbsp;dịch&nbsp;vụ&nbsp;theo&nbsp;quy&nbsp;định.</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Giấy&nbsp;tờ&nbsp;tùy&nbsp;thân&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Hộ&nbsp;chiếu&nbsp;bản&nbsp;chính&nbsp;và&nbsp;các&nbsp;giấy&nbsp;tờ&nbsp;cần&nbsp;thiết.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trẻ&nbsp;em&nbsp;dưới&nbsp;14&nbsp;tuổi&nbsp;bắt&nbsp;buộc&nbsp;mang&nbsp;theo&nbsp;giấy&nbsp;khai&nbsp;sinh.&nbsp;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trẻ&nbsp;em&nbsp;cần&nbsp;có&nbsp;bố&nbsp;mẹ&nbsp;hoặc&nbsp;người&nbsp;thân&nbsp;trên&nbsp;18&nbsp;tuổi&nbsp;đi&nbsp;cùng;&nbsp;trường&nbsp;hợp&nbsp;đi&nbsp;cùng&nbsp;người&nbsp;thân&nbsp;cần&nbsp;có&nbsp;giấy&nbsp;ủy&nbsp;quyền&nbsp;hợp&nbsp;lệ.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 60, 113);">Chính&nbsp;sách&nbsp;hủy&nbsp;&amp;&nbsp;thay&nbsp;đổi</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Từ&nbsp;thời&nbsp;điểm&nbsp;đăng&nbsp;ký&nbsp;đến&nbsp;trước&nbsp;30&nbsp;ngày&nbsp;khởi&nbsp;hành:&nbsp;Phí&nbsp;hủy&nbsp;50%&nbsp;tiền&nbsp;cọc.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Từ&nbsp;15&nbsp;trước&nbsp;ngày&nbsp;khởi&nbsp;hành:&nbsp;Phí&nbsp;hủy&nbsp;70%&nbsp;tổng&nbsp;giá&nbsp;tour.&nbsp;</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Sau&nbsp;thời&nbsp;gian&nbsp;trên:&nbsp;Phí&nbsp;hủy&nbsp;100%&nbsp;tổng&nbsp;giá&nbsp;tour.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Thời&nbsp;gian&nbsp;hủy/thay&nbsp;đổi&nbsp;tour&nbsp;được&nbsp;ghi&nbsp;nhận&nbsp;trong&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;và&nbsp;tính&nbsp;theo&nbsp;ngày&nbsp;làm&nbsp;việc&nbsp;(không&nbsp;bao&nbsp;gồm&nbsp;Thứ&nbsp;Bảy,&nbsp;Chủ&nbsp;Nhật&nbsp;và&nbsp;Lễ/Tết).&nbsp;Các&nbsp;yêu&nbsp;cầu&nbsp;gửi&nbsp;ngoài&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;sẽ&nbsp;được&nbsp;tính&nbsp;từ&nbsp;đầu&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;của&nbsp;ngày&nbsp;kế&nbsp;tiếp.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Quý&nbsp;khách&nbsp;vui&nbsp;lòng&nbsp;gửi&nbsp;yêu&nbsp;cầu&nbsp;hủy&nbsp;qua&nbsp;email&nbsp;hoặc&nbsp;kênh&nbsp;liên&nbsp;hệ&nbsp;chính&nbsp;thức&nbsp;của&nbsp;công&nbsp;ty&nbsp;để&nbsp;được&nbsp;ghi&nbsp;nhận.&nbsp;Thông&nbsp;báo&nbsp;qua&nbsp;điện&nbsp;thoại&nbsp;sẽ&nbsp;chưa&nbsp;được&nbsp;xem&nbsp;là&nbsp;căn&nbsp;cứ&nbsp;áp&nbsp;dụng&nbsp;chính&nbsp;sách&nbsp;hủy.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 60, 113);">Thông&nbsp;tin&nbsp;Visa</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Miễn&nbsp;visa&nbsp;cho&nbsp;khách&nbsp;mang&nbsp;quốc&nbsp;tịch&nbsp;Việt&nbsp;Nam.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Hộ&nbsp;chiếu&nbsp;nguyên&nbsp;vẹn&nbsp;và&nbsp;còn&nbsp;thời&nbsp;hạn&nbsp;sử&nbsp;dụng&nbsp;6&nbsp;tháng&nbsp;tính&nbsp;từ&nbsp;ngày&nbsp;kết&nbsp;thúc&nbsp;tour.&nbsp;</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Lưu&nbsp;ý&nbsp;về&nbsp;tình&nbsp;trạng&nbsp;cư&nbsp;trú</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Quý&nbsp;khách&nbsp;mang&nbsp;2&nbsp;quốc&nbsp;tịch,&nbsp;Travel&nbsp;Document&nbsp;hoặc&nbsp;tình&nbsp;trạng&nbsp;cư&nbsp;trú&nbsp;đặc&nbsp;biệt&nbsp;vui&nbsp;lòng&nbsp;thông&nbsp;báo&nbsp;khi&nbsp;đăng&nbsp;ký&nbsp;và&nbsp;cung&nbsp;cấp&nbsp;đầy&nbsp;đủ&nbsp;giấy&nbsp;tờ&nbsp;liên&nbsp;quan.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Khách&nbsp;chỉ&nbsp;có&nbsp;thẻ&nbsp;xanh&nbsp;nhưng&nbsp;không&nbsp;còn&nbsp;hộ&nbsp;chiếu&nbsp;Việt&nbsp;Nam&nbsp;còn&nbsp;hiệu&nbsp;lực&nbsp;sẽ&nbsp;không&nbsp;đủ&nbsp;điều&nbsp;kiện&nbsp;đăng&nbsp;ký&nbsp;tour&nbsp;sang&nbsp;nước&nbsp;thứ&nbsp;ba.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Khách&nbsp;là&nbsp;Việt&nbsp;Kiều&nbsp;hoặc&nbsp;quốc&nbsp;tịch&nbsp;nước&nbsp;ngoài&nbsp;có&nbsp;visa&nbsp;rời&nbsp;nhập&nbsp;cảnh&nbsp;Việt&nbsp;Nam&nbsp;cần&nbsp;mang&nbsp;theo&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trường&nbsp;hợp&nbsp;sử&nbsp;dụng&nbsp;ABTC&nbsp;(APEC),&nbsp;hộ&nbsp;chiếu&nbsp;công&nbsp;vụ,&nbsp;ngoại&nbsp;giao&nbsp;hoặc&nbsp;tự&nbsp;xin&nbsp;visa,&nbsp;vui&nbsp;lòng&nbsp;thông&nbsp;báo&nbsp;trước&nbsp;để&nbsp;được&nbsp;tư&nbsp;vấn&nbsp;phù&nbsp;hợp.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 60, 113);">Điều&nbsp;kiện&nbsp;tham&nbsp;gia&nbsp;tour</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Độ&nbsp;tuổi&nbsp;và&nbsp;sức&nbsp;khỏe:</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Tour&nbsp;áp&nbsp;dụng&nbsp;cho&nbsp;khách&nbsp;dưới&nbsp;70&nbsp;tuổi.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Quý&nbsp;khách&nbsp;từ&nbsp;70&nbsp;tuổi&nbsp;trở&nbsp;lên&nbsp;cần&nbsp;đóng&nbsp;thêm&nbsp;phí&nbsp;bảo&nbsp;hiểm&nbsp;cao&nbsp;cấp&nbsp;theo&nbsp;quy&nbsp;định.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Từ&nbsp;75&nbsp;tuổi&nbsp;trở&nbsp;lên&nbsp;cần&nbsp;cung&nbsp;cấp&nbsp;giấy&nbsp;xác&nbsp;nhận&nbsp;đủ&nbsp;sức&nbsp;khỏe&nbsp;do&nbsp;cơ&nbsp;sở&nbsp;y&nbsp;tế&nbsp;có&nbsp;thẩm&nbsp;quyền&nbsp;cấp&nbsp;và&nbsp;có&nbsp;người&nbsp;thân&nbsp;dưới&nbsp;60&nbsp;tuổi&nbsp;đi&nbsp;cùng.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Khách&nbsp;mang&nbsp;thai&nbsp;vui&nbsp;lòng&nbsp;thông&nbsp;báo&nbsp;khi&nbsp;đăng&nbsp;ký;&nbsp;cần&nbsp;có&nbsp;ý&nbsp;kiến&nbsp;bác&nbsp;sĩ&nbsp;trước&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Không&nbsp;nhận&nbsp;khách&nbsp;mang&nbsp;thai&nbsp;từ&nbsp;5&nbsp;tháng&nbsp;trở&nbsp;lên&nbsp;vì&nbsp;lý&nbsp;do&nbsp;an&nbsp;toàn.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Quý&nbsp;khách&nbsp;cần&nbsp;đảm&nbsp;bảo&nbsp;sức&nbsp;khỏe&nbsp;phù&nbsp;hợp&nbsp;để&nbsp;tham&nbsp;gia&nbsp;các&nbsp;hoạt&nbsp;động&nbsp;trong&nbsp;tour.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Nếu&nbsp;có&nbsp;điều&nbsp;kiện&nbsp;sức&nbsp;khỏe&nbsp;đặc&nbsp;biệt,&nbsp;vui&nbsp;lòng&nbsp;thông&nbsp;báo&nbsp;cho&nbsp;nhân&nbsp;viên&nbsp;tư&nbsp;vấn&nbsp;trước&nbsp;khi&nbsp;đặt&nbsp;tour.&nbsp;Quý&nbsp;khách&nbsp;có&nbsp;thể&nbsp;được&nbsp;yêu&nbsp;cầu&nbsp;cung&nbsp;cấp&nbsp;chứng&nbsp;nhận&nbsp;sức&nbsp;khỏe&nbsp;hoặc&nbsp;ký&nbsp;cam&nbsp;kết&nbsp;trong&nbsp;một&nbsp;số&nbsp;trường&nbsp;hợp&nbsp;cần&nbsp;thiết.</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Quy&nbsp;định&nbsp;theo&nbsp;đoàn:&nbsp;</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Chương&nbsp;trình&nbsp;có&nbsp;thể&nbsp;điều&nbsp;chỉnh&nbsp;thứ&nbsp;tự&nbsp;tham&nbsp;quan&nbsp;theo&nbsp;tình&nbsp;hình&nbsp;thực&nbsp;tế&nbsp;nhưng&nbsp;vẫn&nbsp;đảm&nbsp;bảo&nbsp;đầy&nbsp;đủ&nbsp;điểm.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Tour&nbsp;khởi&nbsp;hành&nbsp;khi&nbsp;đủ&nbsp;15&nbsp;khách&nbsp;người&nbsp;lớn,&nbsp;nếu&nbsp;chưa&nbsp;đủ&nbsp;số&nbsp;lượng&nbsp;công&nbsp;ty&nbsp;sẽ&nbsp;thông&nbsp;báo&nbsp;và&nbsp;thỏa&nbsp;thuận&nbsp;lại&nbsp;ngày&nbsp;khởi&nbsp;hành&nbsp;hoặc&nbsp;hoàn&nbsp;tiền.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Do&nbsp;tính&nbsp;chất&nbsp;tour&nbsp;ghép,&nbsp;Quý&nbsp;khách&nbsp;cần&nbsp;đi&nbsp;theo&nbsp;đoàn&nbsp;suốt&nbsp;hành&nbsp;trình&nbsp;và&nbsp;về&nbsp;đúng&nbsp;ngày&nbsp;kết&nbsp;thúc&nbsp;tour.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Các&nbsp;dịch&nbsp;vụ&nbsp;trong&nbsp;chương&nbsp;trình&nbsp;đã&nbsp;được&nbsp;sắp&nbsp;xếp&nbsp;trước&nbsp;theo&nbsp;đoàn;&nbsp;trường&nbsp;hợp&nbsp;không&nbsp;sử&nbsp;dụng&nbsp;vì&nbsp;lý&nbsp;do&nbsp;cá&nbsp;nhân&nbsp;sẽ&nbsp;không&nbsp;được&nbsp;hoàn&nbsp;lại&nbsp;tiền.</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Xuất&nbsp;nhập&nbsp;cảnh:</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Quý&nbsp;khách&nbsp;cần&nbsp;đảm&nbsp;bảo&nbsp;giấy&nbsp;tờ&nbsp;cá&nbsp;nhân&nbsp;hợp&nbsp;lệ&nbsp;theo&nbsp;quy&nbsp;định&nbsp;xuất/nhập&nbsp;cảnh,&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour.&nbsp;Trường&nbsp;hợp&nbsp;không&nbsp;được&nbsp;xuất/nhập&nbsp;cảnh,&nbsp;không&nbsp;thực&nbsp;hiện&nbsp;được&nbsp;chuyến&nbsp;đi&nbsp;do&nbsp;cơ&nbsp;quan&nbsp;chức&nbsp;năng&nbsp;không&nbsp;chấp&nbsp;thuận&nbsp;(vì&nbsp;bất&nbsp;kỳ&nbsp;lý&nbsp;do&nbsp;gì),&nbsp;chi&nbsp;phí&nbsp;tour&nbsp;sẽ&nbsp;không&nbsp;được&nbsp;hoàn&nbsp;trả.&nbsp;Công&nbsp;ty&nbsp;sẽ&nbsp;hỗ&nbsp;trợ&nbsp;hướng&nbsp;dẫn&nbsp;trong&nbsp;phạm&nbsp;vi&nbsp;có&nbsp;thể&nbsp;để&nbsp;giải&nbsp;quyết&nbsp;cho&nbsp;Quý&nbsp;khách.&nbsp;Mọi&nbsp;chi&nbsp;phí&nbsp;phát&nbsp;sinh&nbsp;Quý&nbsp;khách&nbsp;tự&nbsp;chủ&nbsp;động&nbsp;sắp&nbsp;xếp.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Đối&nbsp;với&nbsp;quý&nbsp;khách&nbsp;có&nbsp;thay&nbsp;đổi&nbsp;đáng&nbsp;kể&nbsp;về&nbsp;đặc&nbsp;điểm&nbsp;nhận&nbsp;dạng&nbsp;trên&nbsp;khuôn&nbsp;mặt,&nbsp;ví&nbsp;dụ:&nbsp;phẫu&nbsp;thuật&nbsp;thẩm&nbsp;mỹ,&nbsp;vui&nbsp;lòng&nbsp;làm&nbsp;lại&nbsp;hộ&nbsp;chiếu&nbsp;theo&nbsp;quy&nbsp;định&nbsp;trước&nbsp;khi&nbsp;khởi&nbsp;hành.&nbsp;Trường&nbsp;hợp&nbsp;sử&nbsp;dụng&nbsp;hộ&nbsp;chiếu&nbsp;không&nbsp;còn&nbsp;phù&nbsp;hợp&nbsp;với&nbsp;diện&nbsp;mạo&nbsp;hiện&nbsp;tại&nbsp;và&nbsp;phát&nbsp;sinh&nbsp;vấn&nbsp;đề&nbsp;khi&nbsp;xuất&nbsp;nhập&nbsp;cảnh,&nbsp;Quý&nbsp;khách&nbsp;vui&nbsp;long&nbsp;tự&nbsp;chịu&nbsp;trách&nbsp;nhiệm.&nbsp;Các&nbsp;chi&nbsp;phí&nbsp;hủy&nbsp;đổi&nbsp;dịch&nbsp;vụ&nbsp;(nếu&nbsp;có)&nbsp;sẽ&nbsp;được&nbsp;áp&nbsp;dụng&nbsp;theo&nbsp;quy&nbsp;định.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Đối&nbsp;với&nbsp;khách&nbsp;đã&nbsp;chuyển&nbsp;giới,&nbsp;thông&nbsp;tin&nbsp;trên&nbsp;Hộ&nbsp;chiếu&nbsp;và&nbsp;CCCD&nbsp;phải&nbsp;thống&nbsp;nhất&nbsp;và&nbsp;trùng&nbsp;khớp.&nbsp;Hình&nbsp;ảnh&nbsp;trên&nbsp;hộ&nbsp;chiếu&nbsp;cần&nbsp;là&nbsp;hình&nbsp;chụp&nbsp;sau&nbsp;khi&nbsp;chuyển&nbsp;giới/phẫu&nbsp;thuật&nbsp;thẩm&nbsp;mỹ,&nbsp;đảm&nbsp;bảo&nbsp;nhận&nbsp;diện&nbsp;rõ&nbsp;ràng&nbsp;theo&nbsp;hiện&nbsp;trạng&nbsp;thực&nbsp;tế,&nbsp;giống&nbsp;với&nbsp;hộ&nbsp;chiếu&nbsp;hiện&nbsp;đang&nbsp;sử&nbsp;dụng.</span></p><p><strong style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">Bất&nbsp;khả&nbsp;kháng:</strong></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Giờ&nbsp;bay&nbsp;có&nbsp;thể&nbsp;thay&nbsp;đổi&nbsp;theo&nbsp;hãng&nbsp;hàng&nbsp;không.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Trong&nbsp;các&nbsp;tình&nbsp;huống&nbsp;ngoài&nbsp;khả&nbsp;năng&nbsp;kiểm&nbsp;soát&nbsp;như&nbsp;thời&nbsp;tiết,&nbsp;thiên&nbsp;tai,&nbsp;dịch&nbsp;bệnh,&nbsp;sự&nbsp;cố&nbsp;an&nbsp;ninh,&nbsp;chiến&nbsp;tranh,&nbsp;sân&nbsp;bay&nbsp;đóng&nbsp;cửa&nbsp;hoặc&nbsp;thay&nbsp;đổi&nbsp;từ&nbsp;đơn&nbsp;vị&nbsp;vận&nbsp;chuyển,&nbsp;…&nbsp;lịch&nbsp;trình&nbsp;có&nbsp;thể&nbsp;được&nbsp;điều&nbsp;chỉnh&nbsp;để&nbsp;đảm&nbsp;bảo&nbsp;an&nbsp;toàn&nbsp;và&nbsp;quyền&nbsp;lợi&nbsp;cho&nbsp;Quý&nbsp;khách.&nbsp;Công&nbsp;ty&nbsp;sẽ&nbsp;nỗ&nbsp;lực&nbsp;tối&nbsp;đa&nbsp;để&nbsp;hỗ&nbsp;trợ&nbsp;và&nbsp;phối&nbsp;hợp&nbsp;cùng&nbsp;Quý&nbsp;khách&nbsp;xử&nbsp;lý&nbsp;phát&nbsp;sinh.&nbsp;Tuy&nbsp;nhiên,&nbsp;các&nbsp;chi&nbsp;phí&nbsp;liên&nbsp;quan&nbsp;như&nbsp;ăn&nbsp;uống,&nbsp;đi&nbsp;lại,&nbsp;lưu&nbsp;trú,&nbsp;đổi/đặt&nbsp;lại&nbsp;vé&nbsp;…&nbsp;(nếu&nbsp;có)&nbsp;Quý&nbsp;khách&nbsp;vui&nbsp;lòng&nbsp;thanh&nbsp;toán&nbsp;theo&nbsp;thực&nbsp;tế.&nbsp;Công&nbsp;ty&nbsp;sẽ&nbsp;đồng&nbsp;hành&nbsp;và&nbsp;hỗ&nbsp;trợ&nbsp;để&nbsp;Quý&nbsp;khách&nbsp;có&nbsp;phương&nbsp;án&nbsp;phù&nbsp;hợp&nbsp;và&nbsp;thuận&nbsp;tiện&nbsp;nhất.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(0, 60, 113);">Hướng&nbsp;dẫn&nbsp;viên</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(63, 59, 59);">-&nbsp;Hướng&nbsp;Dẫn&nbsp;Viên&nbsp;(HDV)&nbsp;sẽ&nbsp;liên&nbsp;lạc&nbsp;với&nbsp;Quý&nbsp;Khách&nbsp;khoảng&nbsp;2&nbsp;ngày&nbsp;trước&nbsp;khi&nbsp;khởi&nbsp;hành&nbsp;để&nbsp;sắp&nbsp;xếp&nbsp;giờ&nbsp;đón&nbsp;và&nbsp;cung&nbsp;cấp&nbsp;các&nbsp;thông&nbsp;tin&nbsp;cần&nbsp;thiết&nbsp;cho&nbsp;chuyển&nbsp;đi.</span></p>', '<p>Không&nbsp;có</p>', 3, 2, '/uploads/tours/tour-1777299641824-589815401.jpg', 'featured', 'active'),
	(15, 2, 'Tour Đài Loan 5N4Đ: HCM - Cao Hùng - Đài Trung - Đài Bắc - Thủy Cung X-park', 'tour-dai-loan-5n4d-hcm-cao-hung-dai-trung-dai-bac-thuy-cung-x-park', 'Tour Đài Loan 5N4Đ: HCM - Cao Hùng - Đài Trung - Đài Bắc - Thủy Cung X-park', 'Check-in Tháp Taipei 101: Biểu tượng Đài Loan, tự do mua sắm.\r\nDu thuyền tại thiên đường hạ giới ngoài đời thực – Hồ Nhật Nguyệt\r\nTặng “đèn Thiên Đăng” tại điểm phố cổ Thập Phần.\r\nTặng vé tham quan Bảo tàng Kỳ Mỹ (Chimei Museum) - Nơi hội tụ của nghệ thuật và lịch sử Đài Loan.\r\nChiêm bái “Phật Quang Sơn Tự” – Kinh đô Phật Giáo của Đài Loan.', '<p>Vận&nbsp;Chuyển:</p><p></p><p>-&nbsp;Vé&nbsp;máy&nbsp;bay&nbsp;khứ&nbsp;hồi&nbsp;theo&nbsp;hãng&nbsp;Eva&nbsp;Air&nbsp;(23kg&nbsp;hành&nbsp;lý&nbsp;ký&nbsp;gửi&nbsp;+&nbsp;xách&nbsp;tay&nbsp;7kg)&nbsp;</p><p></p><p>-&nbsp;Xe&nbsp;máy&nbsp;lạnh&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;tuyến.</p><p></p><p>-&nbsp;Phí&nbsp;an&nbsp;ninh&nbsp;sân&nbsp;bay,&nbsp;bảo&nbsp;hiểm&nbsp;hàng&nbsp;không,&nbsp;thuế&nbsp;phi&nbsp;trường&nbsp;2&nbsp;nước&nbsp;(theo&nbsp;quy&nbsp;định&nbsp;tại&nbsp;thời&nbsp;điểm&nbsp;xuất&nbsp;vé)</p><p></p><p>Lưu&nbsp;Trú:</p><p></p><p>-&nbsp;Khách&nbsp;sạn&nbsp;tiêu&nbsp;chuẩn&nbsp;3*&nbsp;địa&nbsp;phương&nbsp;(2&nbsp;khách/phòng;&nbsp;khách&nbsp;lẻ&nbsp;nam/nữ&nbsp;có&nbsp;thể&nbsp;bố&nbsp;trí&nbsp;ghép&nbsp;phòng)</p><p></p><p>Khác:&nbsp;</p><p></p><p>-&nbsp;Visa&nbsp;nhập&nbsp;cảnh&nbsp;Đài&nbsp;Loan&nbsp;theo&nbsp;chương&nbsp;trình.</p><p></p><p>-&nbsp;Vé&nbsp;tham&nbsp;quan&nbsp;theo&nbsp;chương&nbsp;trình:&nbsp;Tặng&nbsp;thả&nbsp;đèn&nbsp;Thiên&nbsp;Đăng&nbsp;+&nbsp;lớp&nbsp;học&nbsp;làm&nbsp;bánh&nbsp;dứa&nbsp;Virgo&nbsp;Kobo&nbsp;Pineapple&nbsp;Cake&nbsp;DIY.</p><p></p><p>-&nbsp;Các&nbsp;bữa&nbsp;ăn&nbsp;theo&nbsp;chương&nbsp;trình:&nbsp;Tặng&nbsp;bữa&nbsp;Buffet&nbsp;lẩu,&nbsp;tặng&nbsp;bữa&nbsp;Mì-Bò&nbsp;Bít&nbsp;Tết,&nbsp;tặng&nbsp;bữa&nbsp;hấp&nbsp;thủy&nbsp;nhiệt&nbsp;Hongkong,&nbsp;tặng&nbsp;ly&nbsp;trà&nbsp;sữa&nbsp;truyền&nbsp;thống.&nbsp;(đảm&nbsp;bảo&nbsp;số&nbsp;lượng&nbsp;&amp;&nbsp;chất&nbsp;lượng&nbsp;tương&nbsp;đương&nbsp;nếu&nbsp;có&nbsp;điều&nbsp;chỉnh)</p><p></p><p>-&nbsp;Nước&nbsp;suối&nbsp;01&nbsp;chai/người/ngày.</p><p></p><p>-&nbsp;Bảo&nbsp;hiểm&nbsp;du&nbsp;lịch&nbsp;quốc&nbsp;tế&nbsp;suốt&nbsp;tuyến.&nbsp;</p><p></p><p>-&nbsp;Trưởng&nbsp;đoàn&nbsp;và&nbsp;HDV&nbsp;địa&nbsp;phương&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;hành&nbsp;trình.</p><p></p><p>-&nbsp;Thuế&nbsp;VAT.&nbsp;</p>', '<p>Vận&nbsp;Chuyển:</p><p></p><p>-&nbsp;Vé&nbsp;máy&nbsp;bay&nbsp;khứ&nbsp;hồi&nbsp;theo&nbsp;hãng&nbsp;Eva&nbsp;Air&nbsp;(23kg&nbsp;hành&nbsp;lý&nbsp;ký&nbsp;gửi&nbsp;+&nbsp;xách&nbsp;tay&nbsp;7kg)&nbsp;</p><p></p><p>-&nbsp;Xe&nbsp;máy&nbsp;lạnh&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;tuyến.</p><p></p><p>-&nbsp;Phí&nbsp;an&nbsp;ninh&nbsp;sân&nbsp;bay,&nbsp;bảo&nbsp;hiểm&nbsp;hàng&nbsp;không,&nbsp;thuế&nbsp;phi&nbsp;trường&nbsp;2&nbsp;nước&nbsp;(theo&nbsp;quy&nbsp;định&nbsp;tại&nbsp;thời&nbsp;điểm&nbsp;xuất&nbsp;vé)</p><p></p><p>Lưu&nbsp;Trú:</p><p></p><p>-&nbsp;Khách&nbsp;sạn&nbsp;tiêu&nbsp;chuẩn&nbsp;3*&nbsp;địa&nbsp;phương&nbsp;(2&nbsp;khách/phòng;&nbsp;khách&nbsp;lẻ&nbsp;nam/nữ&nbsp;có&nbsp;thể&nbsp;bố&nbsp;trí&nbsp;ghép&nbsp;phòng)</p><p></p><p>Khác:&nbsp;</p><p></p><p>-&nbsp;Visa&nbsp;nhập&nbsp;cảnh&nbsp;Đài&nbsp;Loan&nbsp;theo&nbsp;chương&nbsp;trình.</p><p></p><p>-&nbsp;Vé&nbsp;tham&nbsp;quan&nbsp;theo&nbsp;chương&nbsp;trình:&nbsp;Tặng&nbsp;thả&nbsp;đèn&nbsp;Thiên&nbsp;Đăng&nbsp;+&nbsp;lớp&nbsp;học&nbsp;làm&nbsp;bánh&nbsp;dứa&nbsp;Virgo&nbsp;Kobo&nbsp;Pineapple&nbsp;Cake&nbsp;DIY.</p><p></p><p>-&nbsp;Các&nbsp;bữa&nbsp;ăn&nbsp;theo&nbsp;chương&nbsp;trình:&nbsp;Tặng&nbsp;bữa&nbsp;Buffet&nbsp;lẩu,&nbsp;tặng&nbsp;bữa&nbsp;Mì-Bò&nbsp;Bít&nbsp;Tết,&nbsp;tặng&nbsp;bữa&nbsp;hấp&nbsp;thủy&nbsp;nhiệt&nbsp;Hongkong,&nbsp;tặng&nbsp;ly&nbsp;trà&nbsp;sữa&nbsp;truyền&nbsp;thống.&nbsp;(đảm&nbsp;bảo&nbsp;số&nbsp;lượng&nbsp;&amp;&nbsp;chất&nbsp;lượng&nbsp;tương&nbsp;đương&nbsp;nếu&nbsp;có&nbsp;điều&nbsp;chỉnh)</p><p></p><p>-&nbsp;Nước&nbsp;suối&nbsp;01&nbsp;chai/người/ngày.</p><p></p><p>-&nbsp;Bảo&nbsp;hiểm&nbsp;du&nbsp;lịch&nbsp;quốc&nbsp;tế&nbsp;suốt&nbsp;tuyến.&nbsp;</p><p></p><p>-&nbsp;Trưởng&nbsp;đoàn&nbsp;và&nbsp;HDV&nbsp;địa&nbsp;phương&nbsp;phục&nbsp;vụ&nbsp;suốt&nbsp;hành&nbsp;trình.</p><p></p><p>-&nbsp;Thuế&nbsp;VAT.&nbsp;</p>', '<p>Chính&nbsp;sách&nbsp;trẻ&nbsp;em</p><p><strong>1.&nbsp;Quy&nbsp;định&nbsp;chung:</strong></p><p>-&nbsp;Mỗi&nbsp;02&nbsp;người&nbsp;lớn&nbsp;được&nbsp;kèm&nbsp;01&nbsp;trẻ&nbsp;em.</p><p>-&nbsp;Từ&nbsp;trẻ&nbsp;thứ&nbsp;02&nbsp;trở&nbsp;đi,&nbsp;áp&nbsp;dụng&nbsp;mức&nbsp;giá&nbsp;theo&nbsp;quy&nbsp;định&nbsp;của&nbsp;từng&nbsp;nhóm&nbsp;tuổi&nbsp;(nêu&nbsp;bên&nbsp;dưới).</p><p>-&nbsp;Trẻ&nbsp;em&nbsp;ngủ&nbsp;chung&nbsp;giường&nbsp;với&nbsp;bố&nbsp;mẹ.&nbsp;Nếu&nbsp;cần&nbsp;giường&nbsp;riêng:&nbsp;Tính&nbsp;như&nbsp;người&nbsp;lớn</p><p>-&nbsp;Chi&nbsp;phí&nbsp;ngoài&nbsp;chương&nbsp;trình&nbsp;(nếu&nbsp;có)&nbsp;gia&nbsp;đình&nbsp;tự&nbsp;chi&nbsp;trả.</p><p><strong>2.&nbsp;Quy&nbsp;định&nbsp;theo&nbsp;độ&nbsp;tuổi:</strong></p><p>-&nbsp;Trẻ&nbsp;dưới&nbsp;2&nbsp;tuổi:&nbsp;Giá&nbsp;như&nbsp;trên&nbsp;website,&nbsp;đã&nbsp;bao&nbsp;gồm&nbsp;vé&nbsp;máy&nbsp;bay,&nbsp;không&nbsp;có&nbsp;ghế&nbsp;riêng,&nbsp;ngủ&nbsp;chung&nbsp;với&nbsp;bố&nbsp;mẹ.</p><p>-&nbsp;Trẻ&nbsp;từ&nbsp;2&nbsp;-&nbsp;11&nbsp;tuổi:&nbsp;Giá&nbsp;như&nbsp;trên&nbsp;website,&nbsp;bao&nbsp;gồm&nbsp;đầy&nbsp;đủ&nbsp;dịch&nbsp;vụ&nbsp;trong&nbsp;chương&nbsp;trình.&nbsp;Ngủ&nbsp;chung&nbsp;với&nbsp;bố&nbsp;mẹ.&nbsp;Từ&nbsp;trẻ&nbsp;thứ&nbsp;02&nbsp;trở&nbsp;đi:&nbsp;tính&nbsp;100%&nbsp;giá&nbsp;người&nbsp;lớn.</p><p>-&nbsp;Trẻ&nbsp;từ&nbsp;12&nbsp;tuổi&nbsp;trở&nbsp;lên:&nbsp;tính&nbsp;giá&nbsp;như&nbsp;người&nbsp;lớn.</p><p>-&nbsp;Trong&nbsp;trường&nbsp;hợp&nbsp;chỉ&nbsp;có&nbsp;1&nbsp;khách&nbsp;(người&nbsp;lớn)&nbsp;đi&nbsp;với&nbsp;1&nbsp;bé&nbsp;(dưới&nbsp;12&nbsp;tuổi),&nbsp;bé&nbsp;được&nbsp;tính&nbsp;giá&nbsp;vé&nbsp;người&nbsp;lớn&nbsp;để&nbsp;đảm&nbsp;bảo&nbsp;dịch&nbsp;vụ&nbsp;theo&nbsp;quy&nbsp;định.</p><p><strong>Giấy&nbsp;tờ&nbsp;tùy&nbsp;thân&nbsp;khi&nbsp;tham&nbsp;gia&nbsp;tour</strong></p><p>-&nbsp;Hộ&nbsp;chiếu&nbsp;bản&nbsp;chính&nbsp;và&nbsp;các&nbsp;giấy&nbsp;tờ&nbsp;cần&nbsp;thiết</p><p>-&nbsp;Trẻ&nbsp;em&nbsp;cần&nbsp;có&nbsp;bố&nbsp;mẹ&nbsp;hoặc&nbsp;người&nbsp;thân&nbsp;trên&nbsp;18&nbsp;tuổi&nbsp;đi&nbsp;cùng;&nbsp;trường&nbsp;hợp&nbsp;đi&nbsp;cùng&nbsp;người&nbsp;thân&nbsp;cần&nbsp;có&nbsp;giấy&nbsp;ủy&nbsp;quyền&nbsp;hợp&nbsp;lệ.</p>', '<p>Chính&nbsp;sách&nbsp;hủy&nbsp;&amp;&nbsp;thay&nbsp;đổi</p><p>-&nbsp;Huỷ&nbsp;từ&nbsp;thời&nbsp;điểm&nbsp;đăng&nbsp;ký&nbsp;đến&nbsp;trước&nbsp;22&nbsp;ngày:&nbsp;Phí&nbsp;hủy&nbsp;là&nbsp;2.000.000&nbsp;VNĐ</p><p>-&nbsp;Hủy&nbsp;trước&nbsp;15&nbsp;-21&nbsp;ngày&nbsp;khởi&nbsp;hành:&nbsp;phí&nbsp;hủy&nbsp;là&nbsp;50%&nbsp;trên&nbsp;giá&nbsp;tour.</p><p>-&nbsp;Hủy&nbsp;trước&nbsp;7-14&nbsp;ngày&nbsp;khởi&nbsp;hành:&nbsp;phí&nbsp;hủy&nbsp;là&nbsp;70%&nbsp;trên&nbsp;giá&nbsp;tour.</p><p>-&nbsp;Sau&nbsp;thời&nbsp;gian&nbsp;trên:&nbsp;100%&nbsp;tổng&nbsp;giá&nbsp;tour.</p><p>-&nbsp;Trường&nbsp;hợp&nbsp;Quý&nbsp;khách&nbsp;bị&nbsp;từ&nbsp;chối&nbsp;cấp&nbsp;visa,&nbsp;sẽ&nbsp;được&nbsp;hoàn&nbsp;cọc&nbsp;100%&nbsp;(trừ&nbsp;một&nbsp;số&nbsp;trường&nbsp;hợp&nbsp;cố&nbsp;ý&nbsp;hoặc&nbsp;không&nbsp;hợp&nbsp;tác&nbsp;dẫn&nbsp;tới&nbsp;bị&nbsp;từ&nbsp;chối&nbsp;visa,&nbsp;áp&nbsp;dụng&nbsp;phí&nbsp;hủy:&nbsp;2.000.000&nbsp;VNĐ/khách).</p><p>-&nbsp;Thời&nbsp;gian&nbsp;hủy/thay&nbsp;đổi&nbsp;tour&nbsp;được&nbsp;ghi&nbsp;nhận&nbsp;trong&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;và&nbsp;tính&nbsp;theo&nbsp;ngày&nbsp;làm&nbsp;việc&nbsp;(không&nbsp;bao&nbsp;gồm&nbsp;Thứ&nbsp;Bảy,&nbsp;Chủ&nbsp;Nhật&nbsp;và&nbsp;Lễ/Tết).&nbsp;Các&nbsp;yêu&nbsp;cầu&nbsp;gửi&nbsp;ngoài&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;sẽ&nbsp;được&nbsp;tính&nbsp;từ&nbsp;đầu&nbsp;giờ&nbsp;làm&nbsp;việc&nbsp;của&nbsp;ngày&nbsp;kế&nbsp;tiếp.</p><p>-&nbsp;Quý&nbsp;khách&nbsp;vui&nbsp;lòng&nbsp;gửi&nbsp;yêu&nbsp;cầu&nbsp;hủy&nbsp;qua&nbsp;email&nbsp;hoặc&nbsp;kênh&nbsp;liên&nbsp;hệ&nbsp;chính&nbsp;thức&nbsp;của&nbsp;công&nbsp;ty&nbsp;để&nbsp;được&nbsp;ghi&nbsp;nhận.&nbsp;Thông&nbsp;báo&nbsp;qua&nbsp;điện&nbsp;thoại&nbsp;sẽ&nbsp;chưa&nbsp;được&nbsp;xem&nbsp;là&nbsp;căn&nbsp;cứ&nbsp;áp&nbsp;dụng&nbsp;chính&nbsp;sách&nbsp;hủy.</p><p>-&nbsp;Nếu&nbsp;Quý&nbsp;khách&nbsp;hủy&nbsp;tour&nbsp;sau&nbsp;khi&nbsp;visa&nbsp;đã&nbsp;được&nbsp;cấp,&nbsp;công&nbsp;ty&nbsp;sẽ&nbsp;thực&nbsp;hiện&nbsp;thủ&nbsp;tục&nbsp;hủy&nbsp;visa&nbsp;theo&nbsp;quy&nbsp;định.</p><p>Thông&nbsp;tin&nbsp;Visa</p><p><strong>VISA&nbsp;ĐÀI&nbsp;LOAN&nbsp;QUAN&nbsp;HỒNG</strong>&nbsp;(HỒ&nbsp;SƠ&nbsp;SCAN&nbsp;RÕ&nbsp;HOẶC&nbsp;CHỤP&nbsp;HÌNH)</p><p>Để&nbsp;chuẩn&nbsp;bị&nbsp;tốt&nbsp;nhất&nbsp;cho&nbsp;việc&nbsp;xin&nbsp;visa&nbsp;Quan&nbsp;Hồng&nbsp;nhập&nbsp;cảnh&nbsp;vào&nbsp;Đài&nbsp;Loan,&nbsp;công&nbsp;ty&nbsp;xin&nbsp;gửi&nbsp;Quý&nbsp;Khách&nbsp;những&nbsp;thông&nbsp;tin&nbsp;hồ&nbsp;sơ&nbsp;cơ&nbsp;bản&nbsp;để&nbsp;chuẩn&nbsp;bị&nbsp;như&nbsp;sau:&nbsp;Ngoài&nbsp;ra,&nbsp;công&nbsp;ty&nbsp;sẽ&nbsp;cập&nbsp;nhật&nbsp;các&nbsp;thủ&nbsp;tục&nbsp;cần&nbsp;thiết&nbsp;cho&nbsp;quý&nbsp;khách&nbsp;nếu&nbsp;có&nbsp;bất&nbsp;cứ&nbsp;thay&nbsp;đổi&nbsp;nào&nbsp;từ&nbsp;phía&nbsp;lãnh&nbsp;sự&nbsp;quán.</p><p><strong>Hồ&nbsp;sơ&nbsp;xin&nbsp;visa:</strong></p><p>-&nbsp;Hộ&nbsp;chiếu&nbsp;còn&nbsp;hạn&nbsp;trên&nbsp;6&nbsp;tháng&nbsp;tính&nbsp;từ&nbsp;ngày&nbsp;kết&nbsp;thúc&nbsp;tour.&nbsp;Scan/Chụp&nbsp;rõ&nbsp;không&nbsp;bóng,&nbsp;không&nbsp;chói,&nbsp;thấy&nbsp;đầy&nbsp;đủ&nbsp;thông&nbsp;tin.</p><p>-&nbsp;Nếu&nbsp;hộ&nbsp;chiếu&nbsp;không&nbsp;có&nbsp;mục&nbsp;nơi&nbsp;sinh&nbsp;thì&nbsp;Scan/Chụp&nbsp;thêm&nbsp;bị&nbsp;chú&nbsp;nơi&nbsp;sinh&nbsp;hoặc&nbsp;căn&nbsp;cước&nbsp;công&nbsp;dân&nbsp;gốc&nbsp;2&nbsp;mặt</p><p>-&nbsp;Hình&nbsp;thẻ&nbsp;nền&nbsp;trắng&nbsp;chụp&nbsp;mới&nbsp;nhất&nbsp;gửi&nbsp;File&nbsp;mềm&nbsp;(thấy&nbsp;rõ&nbsp;ngũ&nbsp;quan&nbsp;trán,&nbsp;tai,&nbsp;chân&nbsp;mày,&nbsp;không&nbsp;đeo&nbsp;kính,&nbsp;không&nbsp;đeo&nbsp;bông&nbsp;tai,&nbsp;không&nbsp;cười&nbsp;nhe&nbsp;răng,&nbsp;không&nbsp;trùng&nbsp;hình&nbsp;hộ&nbsp;chiếu)</p><p>-&nbsp;Thông&nbsp;tin&nbsp;khai&nbsp;form&nbsp;xin&nbsp;visa&nbsp;Đài&nbsp;Loan&nbsp;theo&nbsp;mẫu</p>', 2, 1, '/uploads/tours/tour-1777472919828-688992166.webp', 'promotion', 'active');

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.users: ~5 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `role_id`, `full_name`, `email`, `password`, `phone_number`, `avatar_url`, `is_active`, `last_login`, `created_at`, `updated_at`, `language`) VALUES
	(1, 1, 'Quản Trị Viên', '1@gmail.com', '$2a$12$9PTNubZ9YiqLA0fE4dKvROIcct3pSzRG0JZx7UVL8y9lhVQBJeDw.', '0901234567', '/uploads/avatars/avatar-1-1774261565350-737873517.jpg', 1, '2026-06-13 09:28:13', '2026-03-02 09:21:46', '2026-04-01 16:10:10', 'vi'),
	(2, 2, 'Nguyễn Văn A', 'nguyenvana@gmail.com', '$2y$10$abcdefghijklmnopqrstuv', '0912345678', 'https://ui-avatars.com/api/?name=Nguyễn+A', 1, NULL, '2026-03-02 09:21:46', '2026-03-02 09:21:46', 'vi'),
	(3, 2, 'Trần Thị B', 'tranthib@gmail.com', '$2y$10$abcdefghijklmnopqrstuv', '0987654321', 'https://ui-avatars.com/api/?name=Trần+B', 1, NULL, '2026-03-02 09:21:46', '2026-03-02 09:21:46', 'vi'),
	(7, 1, 'minhtuyen', 'minhtuyenk201@gmail.com', '$2a$12$Y09FDK6TQQMzRhXtZRoMd.aST02Uc5/9TRbyptOph2AJe7YjBSwme', NULL, '/uploads/avatars/avatar-7-1777293312005-679122399.jpg', 1, '2026-06-28 21:55:26', '2026-03-11 22:11:21', '2026-04-27 19:35:12', 'vi'),
	(8, 2, 'Cường Trần', 'tranhungcuong31720@gmail.com', '$2a$12$u5JXlW3BOI.sFCzSM0FfqO9L7fyeSpN1VV9PBfDIsqRlPsksd3ktq', '0978818244', '/uploads/avatars/avatar-8-1777682732546-561570321.jpg', 1, '2026-06-13 10:35:24', '2026-03-20 09:27:41', '2026-05-02 07:45:32', 'vi');

-- Dumping structure for table db_marketing_tour.vote_likes
DROP TABLE IF EXISTS `vote_likes`;
CREATE TABLE IF NOT EXISTS `vote_likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vote_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`vote_id`,`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table db_marketing_tour.vote_likes: ~2 rows (approximately)
DELETE FROM `vote_likes`;
INSERT INTO `vote_likes` (`id`, `vote_id`, `user_id`, `created_at`) VALUES
	(2, 8, 8, '2026-06-13 09:27:34'),
	(3, 19, 8, '2026-06-13 09:27:36');

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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
