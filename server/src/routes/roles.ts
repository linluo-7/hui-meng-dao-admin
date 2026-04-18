import { Router } from 'express';

export const rolesRouter = Router();
import pool from '../db/connection';
import { adminAuth } from '../middleware/auth';

// 人设卡列表（管理员视角）
rolesRouter.get('/', adminAuth, async (req, res) => {
  const page = parseInt(String(req.query.page ?? '1'));
  const pageSize = parseInt(String(req.query.pageSize ?? '20'));
  const offset = (page - 1) * pageSize;
  const keyword = String(req.query.keyword ?? '');
  const status = String(req.query.status ?? ''); // all, public, hidden

  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (keyword) {
    where += ' AND (r.name LIKE ? OR u.nickname LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (status === 'public') {
    where += ' AND r.is_public = 1 AND r.is_hidden = 0';
  } else if (status === 'hidden') {
    where += ' AND (r.is_public = 0 OR r.is_hidden = 1)';
  }

  // 查询总数
  const [countRows] = await pool.query<any[]>(
    `SELECT COUNT(*) as total FROM roles r LEFT JOIN users u ON r.owner_user_id = u.id ${where}`,
    params,
  );

  // 查询列表
  const [rows] = await pool.query<any[]>(
    `SELECT r.*, u.nickname as owner_nickname, u.avatar_url as owner_avatar_url
     FROM roles r
     LEFT JOIN users u ON r.owner_user_id = u.id
     ${where}
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset],
  );

  // 解析 attributes
  const items = rows.map((row: any) => {
    const attrs = typeof row.attributes === 'string' ? JSON.parse(row.attributes) : row.attributes;
    return {
      id: row.id,
      name: row.name,
      avatarUrl: row.avatar_url,
      imageUrls: attrs?.imageUrls ?? [],
      description: attrs?.description ?? '',
      ownerUserId: row.owner_user_id,
      ownerNickname: row.owner_nickname ?? '未知用户',
      ownerAvatarUrl: row.owner_avatar_url,
      isPublic: !!row.is_public,
      isHidden: !!row.is_hidden,
      likesCount: row.likes_count ?? 0,
      followersCount: row.followers_count ?? 0,
      createdAt: row.created_at,
    };
  });

  res.json({
    list: items,
    total: countRows[0]?.total ?? 0,
    page,
    pageSize,
  });
});

// 人设卡详情
rolesRouter.get('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;

  const [rows] = await pool.query<any[]>(
    `SELECT r.*, u.nickname as owner_nickname, u.avatar_url as owner_avatar_url
     FROM roles r
     LEFT JOIN users u ON r.owner_user_id = u.id
     WHERE r.id = ?`,
    [id],
  );

  if (!rows.length) {
    res.status(404).json({ message: '人设卡不存在' });
    return;
  }

  const row = rows[0];
  const attrs = typeof row.attributes === 'string' ? JSON.parse(row.attributes) : row.attributes;

  res.json({
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    imageUrls: attrs?.imageUrls ?? [],
    description: attrs?.description ?? '',
    relationship: attrs?.relationship ?? null,
    timeline: attrs?.timeline ?? [],
    ownerUserId: row.owner_user_id,
    ownerNickname: row.owner_nickname ?? '未知用户',
    ownerAvatarUrl: row.owner_avatar_url,
    isPublic: !!row.is_public,
    isHidden: !!row.is_hidden,
    likesCount: row.likes_count ?? 0,
    followersCount: row.followers_count ?? 0,
    createdAt: row.created_at,
  });
});

// 隐藏/显示人设卡
rolesRouter.patch('/:id/visibility', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { isHidden } = req.body;

  await pool.query(
    `UPDATE roles SET is_hidden = ? WHERE id = ?`,
    [isHidden ? 1 : 0, id],
  );

  res.json({ ok: true });
});

// 设置公开/私密
rolesRouter.patch('/:id/public', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { isPublic } = req.body;

  await pool.query(
    `UPDATE roles SET is_public = ? WHERE id = ?`,
    [isPublic ? 1 : 0, id],
  );

  res.json({ ok: true });
});

// 删除人设卡
rolesRouter.delete('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;

  // 先删除关联的点赞和收藏
  await pool.query(`DELETE FROM role_likes WHERE role_id = ?`, [id]);
  await pool.query(`DELETE FROM user_favorites WHERE target_type = 'role' AND target_id = ?`, [id]);
  await pool.query(`DELETE FROM comments WHERE post_id = ?`, [id]);

  // 删除人设卡
  await pool.query(`DELETE FROM roles WHERE id = ?`, [id]);

  res.json({ ok: true });
});

// 获取人设卡的评论列表
rolesRouter.get('/:id/comments', adminAuth, async (req, res) => {
  const { id } = req.params;
  const page = parseInt(String(req.query.page ?? '1'));
  const pageSize = parseInt(String(req.query.pageSize ?? '20'));
  const offset = (page - 1) * pageSize;

  const [countRows] = await pool.query<any[]>(
    `SELECT COUNT(*) as total FROM comments WHERE post_id = ?`,
    [id],
  );

  const [rows] = await pool.query<any[]>(
    `SELECT c.*, u.nickname as author_nickname, u.avatar_url as author_avatar_url
     FROM comments c
     LEFT JOIN users u ON c.author_user_id = u.id
     WHERE c.post_id = ?
     ORDER BY c.created_at DESC
     LIMIT ? OFFSET ?`,
    [id, pageSize, offset],
  );

  res.json({
    list: rows.map((row: any) => ({
      id: row.id,
      postId: id,
      authorUserId: row.author_user_id,
      authorNickname: row.author_nickname ?? '未知用户',
      authorAvatarUrl: row.author_avatar_url,
      content: row.content,
      imageUrl: row.image_url,
      likesCount: row.likes_count ?? 0,
      createdAt: row.created_at,
    })),
    total: countRows[0]?.total ?? 0,
    page,
    pageSize,
  });
});
