-- 创建 admins 表
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  avatar VARCHAR(255) DEFAULT NULL,
  status TINYINT DEFAULT 1 COMMENT '1:正常 0:禁用',
  last_login DATETIME DEFAULT NULL,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建 admin_logs 表
CREATE TABLE IF NOT EXISTS admin_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL,
  action VARCHAR(50) NOT NULL COMMENT '操作类型',
  target_type VARCHAR(20) NOT NULL COMMENT '目标类型: user/note/album/tag/comment',
  target_id INT NOT NULL COMMENT '目标ID',
  detail TEXT COMMENT '操作详情',
  ip VARCHAR(50) DEFAULT NULL,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action (action),
  INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
