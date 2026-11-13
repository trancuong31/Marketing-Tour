CREATE TABLE `contact_settings` (
    `id` INT NOT NULL PRIMARY KEY,
    `configuration` JSON NOT NULL,
    `updated_by` INT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- --------------------------------------------------------
-- Table structure for table `footer_links`
-- --------------------------------------------------------

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `footer_links` (`id`, `title`, `url`, `link_type`, `column_position`, `sort_order`, `is_active`) VALUES
(1, 'Về Chúng Tôi', '/guides/ve-chung-toi', 'internal', 1, 1, 1),
(2, 'Blog Du Lịch', '/guides/blog-du-lich', 'internal', 1, 2, 1),
(3, 'Câu Hỏi Thường Gặp', '/guides/cau-hoi-thuong-gap', 'internal', 2, 1, 1),
(4, 'Hướng Dẫn Thanh Toán', '/guides/huong-dan-thanh-toan', 'internal', 2, 2, 1),
(5, 'Điều Khoản Sử Dụng', '/guides/dieu-khoan-su-dung', 'internal', 3, 1, 1),
(6, 'Chính Sách Bảo Mật', '/guides/chinh-sach-bao-mat', 'internal', 3, 2, 1)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);
