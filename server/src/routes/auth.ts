import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/connection';
import { generateToken, adminAuth } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

// 管理员登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
      return;
    }

    // 查询管理员
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ? AND status = 1',
      [username]
    ) as [any[], any];

    if (rows.length === 0) {
      res.status(401).json({ code: 401, message: '用户名或密码错误' });
      return;
    }

    const admin = rows[0];

    // 验证密码
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      res.status(401).json({ code: 401, message: '用户名或密码错误' });
      return;
    }

    // 生成 token
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
    });

    // 更新最后登录时间
    await pool.query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        adminInfo: {
          id: admin.id,
          username: admin.username,
          role: admin.role,
          avatar: admin.avatar,
        },
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取当前管理员信息
router.get('/info', adminAuth, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, role, avatar FROM admins WHERE id = ?',
      [req.admin!.id]
    ) as [any[], any];

    if (rows.length === 0) {
      res.status(404).json({ code: 404, message: '管理员不存在' });
      return;
    }

    res.json({
      code: 200,
      data: rows[0],
    });
  } catch (error) {
    console.error('获取管理员信息失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 退出登录
router.post('/logout', (req: Request, res: Response) => {
  res.json({ code: 200, message: '退出成功' });
});

export default router;
