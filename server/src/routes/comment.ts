import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { adminAuth } from '../middleware/auth';

const router = Router();

// 获取评论列表
router.get('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const keyword = req.query.keyword as string;

    let where = '1=1';
    const params: any[] = [];

    if (keyword) {
      where += ' AND c.content LIKE ?';
      params.push(`%${keyword}%`);
    }

    const offset = (page - 1) * pageSize;

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM comments c WHERE ${where}`,
      params
    ) as [any[], any];

    const [rows] = await pool.query(
      `SELECT c.*, u.nickname as author_name, p.title as post_title
       FROM comments c
       LEFT JOIN users u ON c.author_user_id = u.id
       LEFT JOIN posts p ON c.post_id = p.id
       WHERE ${where}
       ORDER BY c.created_at DESC
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
    console.error('获取评论列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除评论
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM comments WHERE id = ?', [id]);

    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, detail) VALUES (?, ?, ?, ?, ?)',
      [req.admin!.id, 'delete_comment', 'comment', id, '删除评论']
    );

    res.json({ code: 200, message: '评论已删除' });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

export default router;
