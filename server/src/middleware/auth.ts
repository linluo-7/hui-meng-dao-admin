import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AdminPayload {
  id: number;
  username: string;
  role: string;
}

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ code: 401, message: '未授权访问' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AdminPayload;
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ code: 401, message: 'Token无效或已过期' });
  }
}

// 生成 JWT token
export function generateToken(payload: AdminPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '24h' });
}
