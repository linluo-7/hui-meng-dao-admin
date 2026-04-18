import mysql from 'mysql2/promise';
import { env } from '../config/env';

console.log('DB Config:', env.db);

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 测试数据库连接
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log('[OK] 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('[ERROR] 数据库连接失败:', error);
    return false;
  }
}

export default pool;
