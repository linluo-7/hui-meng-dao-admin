import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { adminAuth } from '../middleware/auth';

const router = Router();

// 获取操作日志列表
router.get('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const action = req.query.action as string;

    let where = '1=1';
    const params: any[] = [];

    if (action) {
      where += ' AND l.action = ?';
      params.push(action);
    }

    const offset = (page - 1) * pageSize;

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM admin_logs l WHERE ${where}`,
      params
    ) as [any[], any];

    const [rows] = await pool.query(
      `SELECT l.*, a.username as admin_name
       FROM admin_logs l
       LEFT JOIN admins a ON l.admin_id = a.id
       WHERE ${where}
       ORDER BY l.id DESC
       LIMIT ? OFFSET ?`,
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
    console.error('获取操作日志失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

export default router;
