import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { adminAuth } from '../middleware/auth';

const router = Router();

// 获取帖子列表
router.get('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const keyword = req.query.keyword as string;
    const postType = req.query.postType as string;

    let where = '1=1';
    const params: any[] = [];

    if (keyword) {
      where += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (postType) {
      where += ' AND p.post_type = ?';
      params.push(postType);
    }

    const offset = (page - 1) * pageSize;

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM posts p WHERE ${where}`,
      params
    ) as [any[], any];

    const [rows] = await pool.query(
      `SELECT p.*, u.nickname as author_name, u.avatar_url as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.author_user_id = u.id
       WHERE ${where}
       ORDER BY p.created_at DESC
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
    console.error('获取帖子列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取帖子详情
router.get('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT p.*, u.nickname as author_name, u.avatar_url as author_avatar,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
       FROM posts p
       LEFT JOIN users u ON p.author_user_id = u.id
       WHERE p.id = ?`,
      [id]
    ) as [any[], any];

    if (rows.length === 0) {
      res.status(404).json({ code: 404, message: '帖子不存在' });
      return;
    }

    res.json({
      code: 200,
      data: rows[0],
    });
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除帖子
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM posts WHERE id = ?', [id]);

    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, detail) VALUES (?, ?, ?, ?, ?)',
      [req.admin!.id, 'delete_note', 'note', id, '删除帖子']
    );

    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取帖子评论列表
router.get('/:id/comments', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM comments WHERE post_id = ?',
      [id]
    ) as [any[], any];

    const [rows] = await pool.query(
      `SELECT c.*, u.nickname as author_name, u.avatar_url as author_avatar
       FROM comments c
       LEFT JOIN users u ON c.author_user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
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
    console.error('获取评论列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

export default router;
