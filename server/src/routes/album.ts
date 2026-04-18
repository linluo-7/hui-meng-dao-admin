import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { adminAuth } from '../middleware/auth';

const router = Router();

// 获取企划列表
router.get('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const keyword = req.query.keyword as string;

    let where = '1=1';
    const params: any[] = [];

    if (keyword) {
      where += ' AND (w.title LIKE ? OR w.content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const offset = (page - 1) * pageSize;

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM works w WHERE ${where}`,
      params
    ) as [any[], any];

    const [rows] = await pool.query(
      `SELECT w.*, u.nickname as author_name
       FROM works w
       LEFT JOIN users u ON w.author_user_id = u.id
       WHERE ${where}
       ORDER BY w.created_at DESC
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
    console.error('获取企划列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取企划详情
router.get('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT w.*, u.nickname as author_name,
        (SELECT COUNT(*) FROM posts WHERE project_id = w.project_id) as note_count
       FROM works w
       LEFT JOIN users u ON w.author_user_id = u.id
       WHERE w.id = ?`,
      [id]
    ) as [any[], any];

    if (rows.length === 0) {
      res.status(404).json({ code: 404, message: '企划不存在' });
      return;
    }

    res.json({
      code: 200,
      data: rows[0],
    });
  } catch (error) {
    console.error('获取企划详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除企划
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM works WHERE id = ?', [id]);

    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, detail) VALUES (?, ?, ?, ?, ?)',
      [req.admin!.id, 'delete_works', 'album', id, '删除企划']
    );

    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除企划失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

export default router;
