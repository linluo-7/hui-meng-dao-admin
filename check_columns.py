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

# 查看各表结构
tables = ['users', 'posts', 'works', 'comments', 'roles']

for table in tables:
    cursor.execute(f"DESCRIBE {table}")
    cols = cursor.fetchall()
    print(f"\n{table} 表结构:")
    for col in cols:
        print(f"  {col[0]}: {col[1]}")

conn.close()
