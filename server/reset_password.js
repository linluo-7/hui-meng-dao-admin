const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function resetPassword() {
  const pool = mysql.createPool({
    host: '146.56.251.112',
    port: 3306,
    database: 'HuiMeng',
    user: 'remote_user',
    password: 'Hjx200554',
  });

  // 用 bcryptjs 生成密码哈希
  const passwordHash = bcrypt.hashSync('admin123', 10);
  console.log('Generated hash:', passwordHash);

  // 更新数据库
  await pool.query('UPDATE admins SET password = ? WHERE username = ?', [passwordHash, 'admin']);
  console.log('Password updated successfully');

  // 验证
  const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', ['admin']);
  if (rows.length > 0) {
    console.log('Stored hash:', rows[0].password);
    const match = bcrypt.compareSync('admin123', rows[0].password);
    console.log('Password verify:', match ? 'SUCCESS' : 'FAILED');
  }

  await pool.end();
}

resetPassword();
