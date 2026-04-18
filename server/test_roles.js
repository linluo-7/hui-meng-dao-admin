const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // 登录
  const loginRes = await request({
    hostname: 'localhost', port: 4001, path: '/api/auth/login',
    method: 'POST', headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'admin123' });

  const token = loginRes.data?.token;
  console.log('登录成功, token:', token ? '有' : '无');

  if (!token) {
    console.log('登录失败:', loginRes);
    return;
  }

  // 测试人设卡列表
  const rolesRes = await request({
    hostname: 'localhost', port: 4001, path: '/api/roles',
    method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('\n人设卡列表:', JSON.stringify(rolesRes, null, 2));
}

main().catch(console.error);
