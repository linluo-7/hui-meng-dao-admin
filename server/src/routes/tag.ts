import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { adminAuth } from '../middleware/auth';

const router = Router();

// 获取标签列表
router.get('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, 
        (SELECT COUNT(*) FROM web_note WHERE JSON_CONTAINS(tags, CAST(t.id AS CHAR))) as usage_count
       FROM web_tag t
       ORDER BY t.id DESC`
    ) as [any[], any];

    res.json({
      code: 200,
      data: rows,
    });
  } catch (error) {
    console.error('获取标签列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 创建标签
router.post('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      res.status(400).json({ code: 400, message: '标签名称不能为空' });
      return;
    }

    const [result] = await pool.query(
      'INSERT INTO web_tag (name, color, create_time) VALUES (?, ?, NOW())',
      [name, color || '#409EFF']
    ) as [any, any];

    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, detail) VALUES (?, ?, ?, ?, ?)',
      [req.admin!.id, 'create_tag', 'tag', result.insertId, `创建标签: ${name}`]
    );

    res.json({ code: 200, message: '标签创建成功', data: { id: result.insertId } });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ code: 400, message: '标签名称已存在' });
      return;
    }
    console.error('创建标签失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除标签
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM web_tag WHERE id = ?', [id]);

    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, detail) VALUES (?, ?, ?, ?, ?)',
      [req.admin!.id, 'delete_tag', 'tag', id, '删除标签']
    );

    res.json({ code: 200, message: '标签已删除' });
  } catch (error) {
    console.error('删除标签失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

export default router;
