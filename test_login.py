import requests
import json

BASE_URL = "http://localhost:4001"

# 测试健康检查
print("1. 测试健康检查...")
r = requests.get(f"{BASE_URL}/health")
print(f"   结果: {r.json()}")

# 测试登录
print("\n2. 测试管理员登录...")
r = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={"username": "admin", "password": "admin123"}
)
print(f"   结果: {json.dumps(r.json(), indent=2, ensure_ascii=False)}")

if r.json().get("code") == 200:
    token = r.json().get("data", {}).get("token")
    print(f"   Token: {token[:50]}..." if token else "   无Token")

    # 测试获取管理员信息
    print("\n3. 测试获取管理员信息...")
    r = requests.get(
        f"{BASE_URL}/api/auth/info",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"   结果: {json.dumps(r.json(), indent=2, ensure_ascii=False)}")

    # 测试 Dashboard
    print("\n4. 测试 Dashboard 统计...")
    r = requests.get(
        f"{BASE_URL}/api/dashboard/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"   结果: {json.dumps(r.json(), indent=2, ensure_ascii=False)}")
