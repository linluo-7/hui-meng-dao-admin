import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { adminAuth } from '../middleware/auth';

const router = Router();

// 获取用户列表
router.get('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const keyword = req.query.keyword as string;
    const status = req.query.status as string;

    let where = '1=1';
    const params: any[] = [];

    if (keyword) {
      where += ' AND (nickname LIKE ? OR phone LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }

    const offset = (page - 1) * pageSize;

    // 获取总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM users WHERE ${where}`,
      params
    ) as [any[], any];

    // 获取列表
    const [rows] = await pool.query(
      `SELECT id, phone, nickname, avatar_url, status, following_count, followers_count, created_at
       FROM users WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    ) as [any[], any];

    res.json({
      code: 200,
      data: {
        list: rows,
        pagination: {
          page,
          pageSize,
          total: countResult[0].total,
        },
      },
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取用户详情
router.get('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT u.*, 
        (SELECT COUNT(*) FROM posts WHERE author_user_id = u.id) as note_count,
        (SELECT COUNT(*) FROM works WHERE author_user_id = u.id) as works_count
       FROM users u WHERE u.id = ?`,
      [id]
    ) as [any[], any];

    if (rows.length === 0) {
      res.status(404).json({ code: 404, message: '用户不存在' });
      return;
    }

    res.json({
      code: 200,
      data: rows[0],
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 封禁用户
router.post('/:id/ban', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await pool.query(
      'UPDATE users SET status = 0 WHERE id = ?',
      [id]
    );

    // 记录操作日志
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, detail) VALUES (?, ?, ?, ?, ?)',
      [req.admin!.id, 'ban_user', 'user', id, reason || '封禁用户']
    );

    res.json({ code: 200, message: '用户已封禁' });
  } catch (error) {
    console.error('封禁用户失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 解封用户
router.post('/:id/unban', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE users SET status = 1 WHERE id = ?',
      [id]
    );

    // 记录操作日志
    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, detail) VALUES (?, ?, ?, ?, ?)',
      [req.admin!.id, 'unban_user', 'user', id, '解封用户']
    );

    res.json({ code: 200, message: '用户已解封' });
  } catch (error) {
    console.error('解封用户失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取用户帖子列表
router.get('/:id/notes', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM posts WHERE author_user_id = ?',
      [id]
    ) as [any[], any];

    const [rows] = await pool.query(
      `SELECT id, title, content, likes, comments_count, created_at 
       FROM posts WHERE author_user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [id, pageSize, offset]
    ) as [any[], any];

    res.json({
      code: 200,
      data: {
        list: rows,
        pagination: {
          page,
          pageSize,
          total: countResult[0].total,
        },
      },
    });
  } catch (error) {
    console.error('获取用户帖子列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

export default router;
