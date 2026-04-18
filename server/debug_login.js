const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4003;

async function init() {
  const pool = mysql.createPool({
    host: '146.56.251.112',
    port: 3306,
    database: 'HuiMeng',
    user: 'remote_user',
    password: 'Hjx200554',
  });

  app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('Login attempt:', username);

      const [rows] = await pool.query(
        'SELECT * FROM admins WHERE username = ? AND status = 1',
        [username]
      );
      console.log('Found admin:', rows.length > 0 ? 'yes' : 'no');

      if (rows.length === 0) {
        return res.json({ code: 401, message: '用户名或密码错误' });
      }

      const admin = rows[0];
      console.log('Admin password hash:', admin.password);
      console.log('Input password:', password);

      const isValid = await bcrypt.compare(password, admin.password);
      console.log('Password valid:', isValid);

      if (!isValid) {
        return res.json({ code: 401, message: '用户名或密码错误' });
      }

      res.json({ code: 200, message: '登录成功' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ code: 500, message: '服务器错误: ' + error.message });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Debug server running on port ${PORT}`);
  });
}

init();
