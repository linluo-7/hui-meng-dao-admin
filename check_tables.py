import pymysql

DB_CONFIG = {
    'host': '146.56.251.112',
    'port': 3306,
    'user': 'remote_user',
    'password': 'Hjx200554',
    'database': 'HuiMeng',
    'charset': 'utf8mb4'
}

conn = pymysql.connect(**DB_CONFIG)
cursor = conn.cursor()

# 查看所有表
cursor.execute("SHOW TABLES")
tables = cursor.fetchall()

print("HuiMeng 数据库中的表:")
for t in tables:
    print(f"  - {t[0]}")

conn.close()
