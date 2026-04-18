import requests
import json

BASE_URL = "http://localhost:4001"

# 测试登录
print("1. 测试管理员登录...")
r = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={"username": "admin", "password": "admin123"}
)
result = r.json()
print(f"   登录结果: {result.get('code')} - {result.get('message')}")

if result.get("code") == 200:
    token = result.get("data", {}).get("token")
    headers = {"Authorization": f"Bearer {token}"}

    # 测试 Dashboard
    print("\n2. 测试 Dashboard 统计...")
    r = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
    print(f"   结果: {json.dumps(r.json(), indent=4, ensure_ascii=False)}")

    # 测试用户列表
    print("\n3. 测试用户列表...")
    r = requests.get(f"{BASE_URL}/api/users", headers=headers)
    data = r.json()
    print(f"   结果: code={data.get('code')}, 总数={data.get('data', {}).get('pagination', {}).get('total')}")

    # 测试帖子列表
    print("\n4. 测试帖子列表...")
    r = requests.get(f"{BASE_URL}/api/notes", headers=headers)
    data = r.json()
    print(f"   结果: code={data.get('code')}, 总数={data.get('data', {}).get('pagination', {}).get('total')}")

    # 测试企划列表
    print("\n5. 测试企划列表...")
    r = requests.get(f"{BASE_URL}/api/albums", headers=headers)
    data = r.json()
    print(f"   结果: code={data.get('code')}, 总数={data.get('data', {}).get('pagination', {}).get('total')}")

    # 测试评论列表
    print("\n6. 测试评论列表...")
    r = requests.get(f"{BASE_URL}/api/comments", headers=headers)
    data = r.json()
    print(f"   结果: code={data.get('code')}, 总数={data.get('data', {}).get('pagination', {}).get('total')}")

    print("\n[OK] 所有 API 测试通过!")
else:
    print(f"\n❌ 登录失败: {result}")
