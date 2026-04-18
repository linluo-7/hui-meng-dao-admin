import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { testConnection } from './db/connection';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import userRoutes from './routes/user';
import noteRoutes from './routes/note';
import albumRoutes from './routes/album';
import tagRoutes from './routes/tag';
import commentRoutes from './routes/comment';
import logRoutes from './routes/log';
import { rolesRouter as rolesRoutes } from './routes/roles';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/roles', rolesRoutes);

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

// 启动服务器
async function start() {
  // 测试数据库连接
  const connected = await testConnection();
  if (!connected) {
    console.error('无法连接到数据库，请检查配置');
    process.exit(1);
  }

  app.listen(env.port, env.host, () => {
    console.log(`🚀 绘梦岛管理端服务已启动: http://${env.host}:${env.port}`);
  });
}

start();
