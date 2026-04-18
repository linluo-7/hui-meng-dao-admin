import { Router, Request, Response } from 'express';
import pool from '../db/connection';
import { adminAuth } from '../middleware/auth';

const router = Router();

// 获取统计数据
router.get('/stats', adminAuth, async (req: Request, res: Response) => {
  try {
    // 用户总数
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users') as [any[], any];
    // 帖子总数
    const [noteRows] = await pool.query('SELECT COUNT(*) as count FROM posts') as [any[], any];
    // 企划总数
    const [albumRows] = await pool.query('SELECT COUNT(*) as count FROM works') as [any[], any];
    // 今日新增用户
    const [todayUserRows] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()"
    ) as [any[], any];
    // 今日新增帖子
    const [todayNoteRows] = await pool.query(
      "SELECT COUNT(*) as count FROM posts WHERE DATE(created_at) = CURDATE()"
    ) as [any[], any];
    // 活跃用户数（根据实际需要调整）
    const [activeUserRows] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    ) as [any[], any];

    res.json({
      code: 200,
      data: {
        totalUsers: userRows[0].count,
        totalNotes: noteRows[0].count,
        totalAlbums: albumRows[0].count,
        todayUsers: todayUserRows[0].count,
        todayNotes: todayNoteRows[0].count,
        activeUsers: activeUserRows[0].count,
      },
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取趋势数据
router.get('/trend', adminAuth, async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    
    // 近N天用户注册趋势
    const [userTrend] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM users 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [days]) as [any[], any];

    // 近N天帖子发布趋势
    const [noteTrend] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM posts 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [days]) as [any[], any];

    res.json({
      code: 200,
      data: {
        userTrend,
        noteTrend,
      },
    });
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取热门内容
router.get('/hot', adminAuth, async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string || 'notes';
    
    let rows: any[] = [];
    if (type === 'notes') {
      [rows] = await pool.query(`
        SELECT p.id, p.title, p.likes, p.comments_count, u.nickname as author
        FROM posts p
        LEFT JOIN users u ON p.author_user_id = u.id
        ORDER BY p.likes DESC
        LIMIT 10
      `) as [any[], any];
    } else if (type === 'albums') {
      [rows] = await pool.query(`
        SELECT w.id, w.title, w.likes, w.comments_count, u.nickname as author
        FROM works w
        LEFT JOIN users u ON w.author_user_id = u.id
        ORDER BY w.likes DESC
        LIMIT 10
      `) as [any[], any];
    }

    res.json({
      code: 200,
      data: rows,
    });
  } catch (error) {
    console.error('获取热门内容失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

export default router;
