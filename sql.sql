-- ==========================================
-- 动物收养系统 - 简化版数据库初始化脚本
-- ==========================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `stray_pet_adopt` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `stray_pet_adopt`;

-- ==========================================
-- 1. 用户表 (users)
-- 管理员、志愿者、普通用户统一存储
-- ==========================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `real_name` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('admin', 'volunteer', 'user') NOT NULL DEFAULT 'user',
  `status` TINYINT(1) DEFAULT 1,
  `gender` VARCHAR(10) DEFAULT NULL,
  `address` VARCHAR(200) DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `delete_time` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ==========================================
-- 2. 志愿者信息扩展表 (volunteers)
-- ==========================================
CREATE TABLE IF NOT EXISTS `volunteers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `level` ENUM('junior', 'middle', 'senior') DEFAULT 'junior',
  `service_hours` INT(11) DEFAULT 0,
  `activity_count` INT(11) DEFAULT 0,
  `join_date` DATE DEFAULT NULL,
  `skills` TEXT,
  `available_time` TEXT,
  `certification` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='志愿者信息表';

-- ==========================================
-- 3. 志愿者申请表 (volunteer_applications)
-- ==========================================
CREATE TABLE IF NOT EXISTS `volunteer_applications` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `age` INT(3) DEFAULT NULL,
  `gender` VARCHAR(10) DEFAULT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `address` VARCHAR(200) DEFAULT NULL,
  `occupation` VARCHAR(50) DEFAULT NULL,
  `education` VARCHAR(50) DEFAULT NULL,
  `roles` TEXT,
  `available_time` TEXT,
  `experience` TEXT,
  `reason` TEXT,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `reviewer_id` INT(11) DEFAULT NULL,
  `review_time` DATETIME DEFAULT NULL,
  `review_comment` TEXT,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='志愿者申请表';

-- ==========================================
-- 4. 宠物分类表 (pet_categories)
-- ==========================================
CREATE TABLE IF NOT EXISTS `pet_categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `icon` INT(11) DEFAULT 1,
  `sort_order` INT(11) DEFAULT 0,
  `status` TINYINT(1) DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='宠物分类表';

-- ==========================================
-- 5. 宠物信息表 (pet_core_info)
-- ==========================================
CREATE TABLE IF NOT EXISTS `pet_core_info` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `pet_name` VARCHAR(50) NOT NULL,
  `category_id` INT(11) DEFAULT NULL,
  `pet_type` ENUM('dog', 'cat', 'other') NOT NULL,
  `breed` VARCHAR(50) DEFAULT NULL,
  `age` INT(3) DEFAULT NULL,
  `gender` ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
  `color` VARCHAR(50) DEFAULT NULL,
  `size` ENUM('small', 'medium', 'large') DEFAULT NULL,
  `weight` DECIMAL(5,2) DEFAULT NULL,
  `health_status` VARCHAR(100) DEFAULT NULL,
  `vaccination` TINYINT(1) DEFAULT 0,
  `sterilization` TINYINT(1) DEFAULT 0,
  `description` TEXT,
  `character` TEXT,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `images` TEXT,
  `status` ENUM('available', 'adopted', 'reserved', 'unavailable') DEFAULT 'available',
  `rescue_date` DATE DEFAULT NULL,
  `rescue_location` VARCHAR(200) DEFAULT NULL,
  `rescue_story` TEXT,
  `views` INT(11) DEFAULT 0,
  `likes` INT(11) DEFAULT 0,
  `create_user_id` INT(11) DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `delete_time` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='宠物信息表';

-- ==========================================
-- 6. 领养申请表 (adoption_applications)
-- ==========================================
CREATE TABLE IF NOT EXISTS `adoption_applications` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `pet_id` INT(11) NOT NULL,
  `user_id` INT(11) DEFAULT NULL,
  `applicant_name` VARCHAR(50) NOT NULL,
  `applicant_phone` VARCHAR(20) NOT NULL,
  `applicant_email` VARCHAR(100) DEFAULT NULL,
  `applicant_address` VARCHAR(200) DEFAULT NULL,
  `id_card` VARCHAR(18) DEFAULT NULL,
  `occupation` VARCHAR(50) DEFAULT NULL,
  `income_range` VARCHAR(50) DEFAULT NULL,
  `housing_type` VARCHAR(50) DEFAULT NULL,
  `has_experience` TINYINT(1) DEFAULT 0,
  `has_other_pets` TINYINT(1) DEFAULT 0,
  `family_agree` TINYINT(1) DEFAULT 0,
  `reason` TEXT,
  `commitment` TEXT,
  `status` ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  `reviewer_id` INT(11) DEFAULT NULL,
  `review_time` DATETIME DEFAULT NULL,
  `review_comment` TEXT,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='领养申请表';

-- ==========================================
-- 7. 领养故事表 (adoption_stories)
-- ==========================================
CREATE TABLE IF NOT EXISTS `adoption_stories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `pet_id` INT(11) DEFAULT NULL,
  `author` VARCHAR(50) NOT NULL,
  `author_contact` VARCHAR(100) DEFAULT NULL,
  `content` TEXT NOT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `images` TEXT,
  `tags` VARCHAR(200) DEFAULT NULL,
  `views` INT(11) DEFAULT 0,
  `likes` INT(11) DEFAULT 0,
  `status` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `publish_date` DATE DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='领养故事表';

-- ==========================================
-- 8. 故事评论表 (story_comments)
-- ==========================================
CREATE TABLE IF NOT EXISTS `story_comments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `story_id` INT(11) NOT NULL,
  `user_name` VARCHAR(50) NOT NULL,
  `content` TEXT NOT NULL,
  `likes` INT(11) DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='故事评论表';

-- ==========================================
-- 9. 商品分类表 (product_categories)
-- ==========================================
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `icon` INT(11) DEFAULT 1,
  `sort_order` INT(11) DEFAULT 0,
  `status` TINYINT(1) DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- ==========================================
-- 10. 商品表 (products)
-- ==========================================
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `category_id` INT(11) DEFAULT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2) DEFAULT NULL,
  `stock` INT(11) DEFAULT 0,
  `sales_count` INT(11) DEFAULT 0,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `images` TEXT,
  `specifications` TEXT,
  `rating` DECIMAL(3,2) DEFAULT 5.00,
  `review_count` INT(11) DEFAULT 0,
  `is_hot` TINYINT(1) DEFAULT 0,
  `is_new` TINYINT(1) DEFAULT 0,
  `status` TINYINT(1) DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- ==========================================
-- 11. 商品评论表 (product_comments)
-- ==========================================
CREATE TABLE IF NOT EXISTS `product_comments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `product_id` INT(11) NOT NULL,
  `user_id` INT(11) DEFAULT NULL,
  `user_name` VARCHAR(50) NOT NULL,
  `rating` INT(1) DEFAULT 5,
  `content` TEXT NOT NULL,
  `images` TEXT,
  `likes` INT(11) DEFAULT 0,
  `status` TINYINT(1) DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品评论表';

-- ==========================================
-- 12. 订单表 (orders)
-- ==========================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(50) NOT NULL,
  `user_id` INT(11) DEFAULT NULL,
  `user_name` VARCHAR(50) NOT NULL,
  `user_phone` VARCHAR(20) NOT NULL,
  `user_address` VARCHAR(200) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `shipping_fee` DECIMAL(10,2) DEFAULT 0.00,
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `payment_time` DATETIME DEFAULT NULL,
  `status` ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
  `remark` TEXT,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ==========================================
-- 13. 订单详情表 (order_items)
-- ==========================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_id` INT(11) NOT NULL,
  `product_id` INT(11) NOT NULL,
  `product_name` VARCHAR(100) NOT NULL,
  `product_image` VARCHAR(255) DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT(11) NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单详情表';

-- ==========================================
-- 14. 购物车表 (shopping_cart)
-- ==========================================
CREATE TABLE IF NOT EXISTS `shopping_cart` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `product_id` INT(11) NOT NULL,
  `quantity` INT(11) DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- ==========================================
-- 15. 捐赠记录表 (donations)
-- ==========================================
CREATE TABLE IF NOT EXISTS `donations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `donation_no` VARCHAR(50) NOT NULL,
  `user_id` INT(11) DEFAULT NULL,
  `donor_name` VARCHAR(50) DEFAULT NULL,
  `donor_phone` VARCHAR(20) DEFAULT NULL,
  `donor_email` VARCHAR(100) DEFAULT NULL,
  `donation_type` ENUM('monetary', 'goods', 'recurring') NOT NULL,
  `amount` DECIMAL(10,2) DEFAULT NULL,
  `goods_name` VARCHAR(100) DEFAULT NULL,
  `goods_quantity` INT(11) DEFAULT NULL,
  `goods_description` TEXT,
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `is_anonymous` TINYINT(1) DEFAULT 0,
  `is_recurring` TINYINT(1) DEFAULT 0,
  `recurring_cycle` VARCHAR(20) DEFAULT NULL,
  `message` TEXT,
  `certificate_url` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='捐赠记录表';

-- ==========================================
-- 16. 常见问题表 (faqs)
-- ==========================================
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `category` VARCHAR(50) DEFAULT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `sort_order` INT(11) DEFAULT 0,
  `views` INT(11) DEFAULT 0,
  `is_hot` TINYINT(1) DEFAULT 0,
  `status` TINYINT(1) DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='常见问题表';

-- ==========================================
-- 17. 系统日志表 (system_logs)
-- ==========================================
-- CREATE TABLE IF NOT EXISTS `system_logs` (
--   `id` INT(11) NOT NULL AUTO_INCREMENT,
--   `user_id` INT(11) DEFAULT NULL,
--   `user_name` VARCHAR(50) DEFAULT NULL,
--   `action` VARCHAR(100) NOT NULL,
--   `module` VARCHAR(50) DEFAULT NULL,
--   `description` TEXT,
--   `ip_address` VARCHAR(50) DEFAULT NULL,
--   `user_agent` VARCHAR(255) DEFAULT NULL,
--   `request_method` VARCHAR(10) DEFAULT NULL,
--   `request_url` VARCHAR(255) DEFAULT NULL,
--   `status` VARCHAR(20) DEFAULT NULL,
--   `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (`id`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志表';

-- ==========================================
-- 18. 系统设置表 (system_settings)
-- ==========================================
-- CREATE TABLE IF NOT EXISTS `system_settings` (
--   `id` INT(11) NOT NULL AUTO_INCREMENT,
--   `setting_key` VARCHAR(100) NOT NULL,
--   `setting_value` TEXT,
--   `setting_type` VARCHAR(50) DEFAULT NULL,
--   `description` VARCHAR(255) DEFAULT NULL,
--   `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
--   `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   PRIMARY KEY (`id`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统设置表';

CREATE TABLE IF NOT EXISTS `reports` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `type` ENUM('monthly', 'quarterly', 'annual', 'custom') NOT NULL DEFAULT 'monthly',
  `description` TEXT,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `sections` TEXT COMMENT '包含的数据模块，JSON格式',
  `report_data` LONGTEXT COMMENT '报告数据，JSON格式',
  `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  `created_by` INT(11) DEFAULT NULL,
  `created_by_name` VARCHAR(50) DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报告表';

-- ==========================================
-- 用户行为表 (user_behaviors)
-- 用于记录用户对宠物的各种行为，支持协同过滤推荐算法
-- ==========================================
CREATE TABLE IF NOT EXISTS `user_behaviors` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL COMMENT '用户ID',
  `pet_id` INT(11) NOT NULL COMMENT '宠物ID',
  `behavior_type` ENUM('view', 'apply', 'like', 'favorite') NOT NULL DEFAULT 'view' COMMENT '行为类型：浏览、申请领养、点赞、收藏',
  `behavior_value` DECIMAL(3,2) DEFAULT 1.0 COMMENT '行为权重值（用于计算相似度）',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '行为发生时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_pet_id` (`pet_id`),
  KEY `idx_user_pet` (`user_id`, `pet_id`),
  KEY `idx_behavior_type` (`behavior_type`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户行为表';

-- ==========================================
-- 插入测试数据
-- ==========================================

-- ==========================================
-- 1. 插入用户数据
-- ==========================================
INSERT INTO `users` (`username`, `password`, `real_name`, `email`, `phone`, `avatar`, `role`, `status`, `gender`, `address`) VALUES
('admin', '$2b$10$1xXzeYLlsw5DF/t/3tF6GeXasLuYDvFxNC/dbbhwT4FWFjwmYoOzq', '系统管理员', 'admin@example.com', '13800138000', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', 'admin', 1, 'male', '北京市朝阳区'),
('volunteer01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '张志愿者', 'volunteer01@example.com', '13800138001', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop', 'volunteer', 1, 'female', '上海市浦东新区'),
('user01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '李用户', 'user01@example.com', '13800138002', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', 'user', 1, 'male', '广州市天河区'),
('user02', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '王用户', 'user02@example.com', '13800138003', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', 'user', 1, 'female', '深圳市南山区'),
('user03', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '刘用户', 'user03@example.com', '13800138004', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', 'user', 1, 'male', '杭州市西湖区');

-- ==========================================
-- 2. 插入志愿者信息数据
-- ==========================================
INSERT INTO `volunteers` (`user_id`, `level`, `service_hours`, `activity_count`, `join_date`, `skills`, `available_time`, `status`) VALUES
(2, 'senior', 450, 35, '2022-01-15', '宠物护理,医疗协助,活动组织', '周末全天,工作日晚上', 'active');

-- ==========================================
-- 3. 插入志愿者申请数据
-- ==========================================
INSERT INTO `volunteer_applications` (`name`, `age`, `gender`, `phone`, `email`, `address`, `occupation`, `education`, `roles`, `available_time`, `experience`, `reason`, `status`) VALUES
('陈申请', 28, 'female', '13800138005', 'chen@example.com', '成都市锦江区', '教师', '本科', '宠物护理,领养咨询', '周末', '曾经养过2只猫咪', '希望能够帮助更多流浪动物找到温暖的家', 'pending'),
('周申请', 35, 'male', '13800138006', 'zhou@example.com', '武汉市江汉区', '医生', '硕士', '医疗协助', '工作日晚上,周末', '有兽医经验', '用专业知识帮助动物', 'approved');

-- ==========================================
-- 4. 插入宠物分类数据
-- ==========================================
INSERT INTO `pet_categories` (`name`, `description`, `icon`, `sort_order`, `status`) VALUES
('狗狗', '各种品种的狗狗等待领养', 1, 1, 1),
('猫咪', '可爱的猫咪寻找温暖的家', 2, 2, 1),
('其他', '兔子、仓鼠等小动物', 3, 3, 1);

-- ==========================================
-- 5. 插入宠物信息数据
-- ==========================================
INSERT INTO `pet_core_info` (`pet_name`, `category_id`, `pet_type`, `breed`, `age`, `gender`, `color`, `size`, `weight`, `health_status`, `vaccination`, `sterilization`, `description`, `character`, `image_url`, `images`, `status`, `rescue_date`, `rescue_location`, `rescue_story`, `views`, `likes`, `create_user_id`) VALUES
('小金', 1, 'dog', '金毛', 2, 'male', '金色', 'large', 25.50, '健康', 1, 1, '温顺友善的金毛犬，喜欢和人互动', '温顺,活泼,聪明', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop"]', 'available', '2023-06-15', '北京市朝阳区某小区', '在小区附近发现，当时很瘦弱，经过治疗和护理后恢复健康', 156, 32, 2),
('小白', 2, 'cat', '英短', 1, 'female', '白色', 'small', 3.20, '健康', 1, 1, '可爱的白色英短，性格温顺', '温顺,安静,粘人', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800&h=600&fit=crop"]', 'available', '2023-08-20', '上海市浦东新区', '在路边纸箱中发现，当时只有2个月大', 289, 67, 2),
('小黑', 1, 'dog', '拉布拉多', 3, 'male', '黑色', 'large', 28.00, '健康', 1, 1, '活泼好动的拉布拉多，喜欢运动', '活泼,友好,忠诚', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1534361960057-19889db6d9c6?w=800&h=600&fit=crop"]', 'available', '2023-05-10', '广州市天河区', '在公园附近发现，对人非常友好', 203, 45, 2),
('小花', 2, 'cat', '橘猫', 2, 'female', '橘白相间', 'medium', 4.50, '健康', 1, 1, '活泼可爱的橘猫，喜欢玩耍', '活泼,好奇,友善', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=800&h=600&fit=crop"]', 'adopted', '2023-04-05', '深圳市南山区', '在小区垃圾箱旁发现，非常亲人', 456, 98, 2),
('小灰', 1, 'dog', '哈士奇', 1, 'male', '灰白色', 'large', 20.00, '健康', 1, 0, '精力充沛的哈士奇，需要大量运动', '活泼,聪明,独立', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800&h=600&fit=crop"]', 'reserved', '2023-09-12', '杭州市西湖区', '在湖边发现，正在寻找合适的家庭', 178, 52, 2),
('小橘', 2, 'cat', '橘猫', 3, 'male', '橘色', 'medium', 5.20, '健康', 1, 1, '温顺的大橘，喜欢被抚摸', '温顺,安静,慵懒', 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1570018144714-431510b5b8a1?w=800&h=600&fit=crop"]', 'available', '2023-07-22', '成都市锦江区', '在菜市场附近发现，对人很友好', 234, 61, 2);

-- ==========================================
-- 6. 插入领养申请数据
-- ==========================================
INSERT INTO `adoption_applications` (`pet_id`, `user_id`, `applicant_name`, `applicant_phone`, `applicant_email`, `applicant_address`, `id_card`, `occupation`, `income_range`, `housing_type`, `has_experience`, `has_other_pets`, `family_agree`, `reason`, `commitment`, `status`, `reviewer_id`, `review_time`) VALUES
(4, 3, '李用户', '13800138002', 'user01@example.com', '广州市天河区', '440100199001011234', '软件工程师', '10000-20000', '自有住房', 1, 0, 1, '从小就喜欢猫咪，希望能够给小花一个温暖的家', '会定期带它体检，按时打疫苗，不离不弃', 'approved', 1, '2023-09-01 10:30:00'),
(5, 4, '王用户', '13800138003', 'user02@example.com', '深圳市南山区', '440300199205056789', '设计师', '8000-15000', '租房', 1, 1, 1, '家里已经有一只猫，想给它找个伴', '会好好照顾，科学喂养', 'pending', NULL, NULL);

-- ==========================================
-- 7. 插入领养故事数据
-- ==========================================
INSERT INTO `adoption_stories` (`title`, `pet_id`, `author`, `author_contact`, `content`, `image_url`, `images`, `tags`, `views`, `likes`, `status`, `is_featured`, `publish_date`) VALUES
('小花的幸福生活', 4, '李用户', 'user01@example.com', '小花来我家已经三个月了，从最初的警惕到现在已经完全融入家庭。它最喜欢在我工作的时候趴在我腿上，晚上也会和我一起睡觉。每天看着它健康快乐的样子，我就觉得当初的决定是对的。希望更多流浪动物能找到属于自己的家。', 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop"]', '领养,幸福,猫咪', 1245, 189, 1, 1, '2023-09-15'),
('我们的第一个月', NULL, '张志愿者', 'volunteer01@example.com', '作为一名志愿者，我见证了太多动物找到家的感人瞬间。每一只被领养的动物都会有一个新的开始，而每一个领养者也会收获一份真挚的陪伴。这是相互的给予，也是相互的治愈。', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop"]', '志愿者,感悟', 856, 112, 1, 0, '2023-09-10');

-- ==========================================
-- 8. 插入故事评论数据
-- ==========================================
INSERT INTO `story_comments` (`story_id`, `user_name`, `content`, `likes`) VALUES
(1, '王用户', '看了很感动，希望小花一直幸福下去！', 12),
(1, '刘用户', '我也想领养一只，正在考虑中', 8),
(2, '李用户', '向所有志愿者致敬！你们是最棒的', 15);

-- ==========================================
-- 9. 插入商品分类数据
-- ==========================================
INSERT INTO `product_categories` (`name`, `description`, `icon`, `sort_order`, `status`) VALUES
('宠物食品', '各种宠物主粮、零食等', 1, 1, 1),
('宠物用品', '玩具、窝、牵引绳等用品', 2, 2, 1),
('医疗保健', '药品、保健品、医疗用品', 3, 3, 1),
('清洁护理', '洗浴用品、清洁工具等', 4, 4, 1);

-- ==========================================
-- 10. 插入商品数据
-- ==========================================
INSERT INTO `products` (`category_id`, `name`, `description`, `price`, `original_price`, `stock`, `sales_count`, `image_url`, `images`, `specifications`, `rating`, `review_count`, `is_hot`, `is_new`, `status`) VALUES
(1, '优质狗粮 10kg', '天然无谷配方，富含蛋白质和维生素，适合成年犬', 298.00, 358.00, 100, 156, 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&h=600&fit=crop","https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&h=600&fit=crop"]', '{"净重":"10kg","保质期":"18个月","适用对象":"成年犬"}', 4.80, 45, 1, 0, 1),
(1, '进口猫粮 5kg', '进口优质原料，营养均衡，适口性好', 198.00, 258.00, 80, 203, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"]', '{"净重":"5kg","保质期":"24个月","适用对象":"全猫龄"}', 4.90, 67, 1, 1, 1),
(2, '宠物玩具套装', '包含球、咬胶、逗猫棒等多种玩具', 58.00, 88.00, 150, 89, 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&h=600&fit=crop"]', '{"材质":"安全塑料+棉绳","适用对象":"猫狗通用"}', 4.60, 23, 0, 1, 1),
(2, '舒适宠物窝', '加厚保暖，可拆洗，四季可用', 128.00, 168.00, 60, 45, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop"]', '{"尺寸":"L号","材质":"纯棉+PP棉"}', 4.70, 18, 0, 0, 1),
(3, '宠物驱虫药', '内外驱虫，安全有效，使用方便', 35.00, NULL, 200, 312, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"]', '{"规格":"1片/盒","适用体重":"5-10kg"}', 4.85, 156, 1, 0, 1),
(4, '宠物沐浴露 500ml', '温和配方，不刺激，清洁效果好', 48.00, 68.00, 120, 78, 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&h=600&fit=crop', '["https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&h=600&fit=crop"]', '{"容量":"500ml","适用对象":"猫狗通用"}', 4.50, 34, 0, 0, 1);

-- ==========================================
-- 11. 插入商品评论数据
-- ==========================================
INSERT INTO `product_comments` (`product_id`, `user_id`, `user_name`, `rating`, `content`, `images`, `likes`, `status`) VALUES
(1, 3, '李用户', 5, '狗狗很爱吃，毛色也变好了，值得推荐！', NULL, 12, 1),
(1, 4, '王用户', 4, '质量不错，价格也合理，会回购', NULL, 8, 1),
(2, 3, '李用户', 5, '猫咪超级喜欢，已经第二次购买了', NULL, 15, 1),
(3, 5, '刘用户', 4, '玩具质量很好，宠物玩得很开心', NULL, 5, 1);

-- ==========================================
-- 12. 插入订单数据
-- ==========================================
INSERT INTO `orders` (`order_no`, `user_id`, `user_name`, `user_phone`, `user_address`, `total_amount`, `shipping_fee`, `payment_method`, `payment_time`, `status`, `remark`) VALUES
('ORD20230901001', 3, '李用户', '13800138002', '广州市天河区XX街道XX号', 298.00, 10.00, '微信支付', '2023-09-01 14:30:00', 'completed', NULL),
('ORD20230902001', 4, '王用户', '13800138003', '深圳市南山区XX路XX号', 256.00, 10.00, '支付宝', '2023-09-02 10:15:00', 'shipped', '请尽快发货'),
('ORD20230903001', 3, '李用户', '13800138002', '广州市天河区XX街道XX号', 186.00, 10.00, '微信支付', NULL, 'pending', NULL);

-- ==========================================
-- 13. 插入订单详情数据
-- ==========================================
INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `product_image`, `price`, `quantity`, `subtotal`) VALUES
(1, 1, '优质狗粮 10kg', 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&h=600&fit=crop', 298.00, 1, 298.00),
(2, 2, '进口猫粮 5kg', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop', 198.00, 1, 198.00),
(2, 3, '宠物玩具套装', 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&h=600&fit=crop', 58.00, 1, 58.00),
(3, 2, '进口猫粮 5kg', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop', 198.00, 1, 198.00);

-- ==========================================
-- 14. 插入购物车数据
-- ==========================================
INSERT INTO `shopping_cart` (`user_id`, `product_id`, `quantity`) VALUES
(3, 3, 2),
(4, 4, 1),
(5, 5, 3),
(5, 6, 1);

-- ==========================================
-- 15. 插入捐赠记录数据
-- ==========================================
INSERT INTO `donations` (`donation_no`, `user_id`, `donor_name`, `donor_phone`, `donor_email`, `donation_type`, `amount`, `goods_name`, `goods_quantity`, `goods_description`, `payment_method`, `is_anonymous`, `message`, `status`) VALUES
('DON20230901001', 3, '李用户', '13800138002', 'user01@example.com', 'monetary', 500.00, NULL, NULL, NULL, '微信支付', 0, '希望这些钱能帮助更多小动物', 'completed'),
('DON20230902001', NULL, '匿名用户', '13800138007', 'anonymous@example.com', 'monetary', 200.00, NULL, NULL, NULL, '支付宝', 1, '略尽绵薄之力', 'completed'),
('DON20230903001', 4, '王用户', '13800138003', 'user02@example.com', 'goods', NULL, '宠物玩具', 10, '各种宠物玩具，包括球、咬胶等', NULL, 0, '捐赠一些宠物用品', 'pending');

-- ==========================================
-- 16. 插入常见问题数据
-- ==========================================
INSERT INTO `faqs` (`category`, `question`, `answer`, `sort_order`, `views`, `is_hot`, `status`) VALUES
('领养流程', '如何申请领养宠物？', '您可以浏览宠物列表，选择心仪的宠物，然后填写领养申请表。我们会审核您的申请，审核通过后会安排见面和领养事宜。', 1, 1256, 1, 1),
('领养条件', '领养宠物需要什么条件？', '需要年满18周岁，有稳定的住所和收入，能够承担宠物日常开销和医疗费用，家庭成员同意领养，并且有足够的时间和精力照顾宠物。', 2, 987, 1, 1),
('领养费用', '领养需要支付费用吗？', '领养本身不收取费用，但需要支付宠物的疫苗、绝育、健康检查等相关费用，费用根据实际情况而定。', 3, 856, 0, 1),
('志愿者', '如何成为志愿者？', '您可以填写志愿者申请表，我们会在审核后与您联系。志愿者需要有一定的时间和精力，热爱动物，愿意为流浪动物提供帮助。', 4, 634, 0, 1),
('捐赠', '捐赠的资金如何使用的？', '所有捐赠资金都会用于流浪动物的救助、医疗、日常护理、场地维护等方面，我们会定期公布资金使用情况。', 5, 523, 0, 1);

-- ==========================================
-- 17. 插入用户行为数据
-- ==========================================
INSERT INTO `user_behaviors` (`user_id`, `pet_id`, `behavior_type`, `behavior_value`) VALUES
(3, 1, 'view', 1.0),
(3, 1, 'like', 3.0),
(3, 4, 'view', 1.0),
(3, 4, 'apply', 5.0),
(4, 2, 'view', 1.0),
(4, 2, 'favorite', 4.0),
(4, 5, 'view', 1.0),
(4, 5, 'apply', 5.0),
(5, 3, 'view', 1.0),
(5, 3, 'like', 3.0),
(5, 6, 'view', 1.0);

-- ==========================================
-- 18. 插入报告数据
-- ==========================================
INSERT INTO `reports` (`title`, `type`, `description`, `start_date`, `end_date`, `sections`, `report_data`, `status`, `created_by`, `created_by_name`) VALUES
('2023年9月月度报告', 'monthly', '9月份工作汇总报告', '2023-09-01', '2023-09-30', '["领养统计","捐赠统计","活动统计"]', '{"领养数量":15,"捐赠金额":5000,"活动次数":3}', 'published', 1, '系统管理员'),
('2023年第三季度报告', 'quarterly', '第三季度工作总结', '2023-07-01', '2023-09-30', '["季度总结","数据分析","未来计划"]', '{"领养总数":45,"志愿者数量":25,"救助动物数":60}', 'draft', 1, '系统管理员');

-- ==========================================
-- 完成
-- ==========================================
