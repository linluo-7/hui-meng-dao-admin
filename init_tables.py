#!/usr/bin/env python3
"""初始化管理端数据库表"""
import pymysql
import bcrypt

# 数据库配置
DB_CONFIG = {
    'host': '146.56.251.112',
    'port': 3306,
    'user': 'remote_user',
    'password': 'Hjx200554',
    'database': 'HuiMeng',
    'charset': 'utf8mb4'
}

def init_tables():
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # 创建 admins 表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admins (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'admin',
      avatar VARCHAR(255) DEFAULT NULL,
      status TINYINT DEFAULT 1,
      last_login DATETIME DEFAULT NULL,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ''')
    print('[OK] admins 表创建成功')

    # 创建 admin_logs 表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      admin_id INT NOT NULL,
      action VARCHAR(50) NOT NULL,
      target_type VARCHAR(20) NOT NULL,
      target_id INT NOT NULL,
      detail TEXT,
      ip VARCHAR(50) DEFAULT NULL,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_admin_id (admin_id),
      INDEX idx_action (action),
      INDEX idx_create_time (create_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ''')
    print('[OK] admin_logs 表创建成功')

    # 检查是否已有管理员
    cursor.execute('SELECT * FROM admins WHERE username = %s', ('admin',))
    if cursor.fetchone() is None:
        # 生成密码哈希
        password_hash = bcrypt.hashpw('admin123'.encode(), bcrypt.gensalt()).decode()
        cursor.execute(
            'INSERT INTO admins (username, password, role) VALUES (%s, %s, %s)',
            ('admin', password_hash, 'super_admin')
        )
        print('[OK] 初始管理员账号创建成功 (admin/admin123)')
    else:
        print('[INFO] 管理员账号已存在')

    conn.commit()

    # 显示当前管理员
    cursor.execute('SELECT id, username, role FROM admins')
    admins = cursor.fetchall()
    print('\n当前管理员列表:')
    for admin in admins:
        print(f'  ID: {admin[0]}, 用户名: {admin[1]}, 角色: {admin[2]}')

    conn.close()
    print('[OK] 数据库初始化完成!')

if __name__ == '__main__':
    init_tables()
