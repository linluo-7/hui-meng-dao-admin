const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4003;

async function test() {
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);

  const pool = mysql.createPool({
    host: process.env.DB_HOST || '146.56.251.112',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'HuiMeng',
    user: process.env.DB_USER || 'remote_user',
    password: process.env.DB_PASSWORD || 'Hjx200554',
  });

  app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('Login attempt:', username);

      const [rows] = await pool.query(
        'SELECT * FROM admins WHERE username = ? AND status = 1',
        [username]
      );
      console.log('Found rows:', rows.length);

      if (rows.length === 0) {
        return res.json({ code: 401, message: '用户名或密码错误' });
      }

      const admin = rows[0];
      console.log('Admin:', admin);

      const isValid = await bcrypt.compare(password, admin.password);
      console.log('Password valid:', isValid);

      res.json({ code: isValid ? 200 : 401, message: isValid ? '登录成功' : '用户名或密码错误' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ code: 500, message: '服务器错误: ' + error.message });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quick test server on port ${PORT}`);
  });
}

test();
