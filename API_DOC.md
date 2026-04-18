# 绘梦岛管理端 API 接口文档

> 版本: v1.0.0  
> 日期: 2026-04-17  
> 基础路径: `http://localhost:3001/api/admin`

---

## 目录

1. [概述](#1-概述)
2. [认证相关](#2-认证相关)
3. [Dashboard](#3-dashboard)
4. [用户管理](#4-用户管理)
5. [帖子管理](#5-帖子管理)
6. [企划/专辑管理](#6-企划专辑管理)
7. [标签管理](#7-标签管理)
8. [评论管理](#8-评论管理)
9. [举报管理](#9-举报管理)
10. [操作日志](#10-操作日志)
11. [附录](#11-附录)

---

## 1. 概述

### 1.1 认证方式

所有接口（除登录外）需要在请求头中携带 JWT Token：

```
Authorization: Bearer <token>
```

### 1.2 通用请求格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 1.3 通用错误码

| code | 说明 |
|------|------|
| 200 | 成功 |
| 401 | 未登录或 Token 过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 1.4 分页参数

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| page | int | 当前页码 | 1 |
| pageSize | int | 每页条数 | 10 |
| keyword | string | 搜索关键词 | - |

---

## 2. 认证相关

### 2.1 管理员登录

**POST** `/auth/login`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 管理员账号 |
| password | string | 是 | 密码 |

**请求示例：**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "admin": {
      "id": 1,
      "username": "admin",
      "nickname": "超级管理员",
      "avatar": "https://example.com/avatar.png",
      "role": "super"
    }
  }
}
```

---

### 2.2 获取当前管理员信息

**GET** `/auth/info`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "超级管理员",
    "avatar": "https://example.com/avatar.png",
    "role": "super",
    "permissions": ["*"]
  }
}
```

---

### 2.3 退出登录

**POST** `/auth/logout`

**响应示例：**

```json
{
  "code": 200,
  "message": "退出成功"
}
```

---

## 3. Dashboard

### 3.1 获取统计数据

**GET** `/dashboard/stats`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userCount": 1024,
    "userTodayCount": 12,
    "noteCount": 5847,
    "noteTodayCount": 45,
    "albumCount": 128,
    "albumTodayCount": 3,
    "commentCount": 23456,
    "commentTodayCount": 156,
    "reportPendingCount": 8
  }
}
```

---

### 3.2 获取近7日趋势数据

**GET** `/dashboard/trend`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "dates": ["04-11", "04-12", "04-13", "04-14", "04-15", "04-16", "04-17"],
    "users": [8, 12, 15, 10, 18, 14, 12],
    "notes": [32, 45, 38, 52, 41, 48, 45],
    "comments": [120, 145, 132, 168, 155, 172, 156]
  }
}
```

---

### 3.3 获取热门内容排行

**GET** `/dashboard/hot-content`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "topNotes": [
      {
        "id": 1,
        "title": "标题",
        "cover": "https://example.com/cover.jpg",
        "likeCount": 1234,
        "collectCount": 456,
        "commentCount": 89
      }
    ],
    "topUsers": [
      {
        "id": 1,
        "username": "用户名",
        "avatar": "https://example.com/avatar.jpg",
        "noteCount": 45,
        "fanCount": 1234
      }
    ]
  }
}
```

---

## 4. 用户管理

### 4.1 获取用户列表

**GET** `/users`

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| keyword | string | 否 | 搜索关键词（用户名/手机号） |
| status | int | 否 | 用户状态（0正常 1封禁） |
| startDate | string | 否 | 注册开始日期 |
| endDate | string | 否 | 注册结束日期 |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 29,
        "hsId": 9330895819,
        "username": "头像",
        "avatar": "https://image.mayongjian.cn/2024/10/14/0de4d36ccefc45d78d32c91b93237827.jpeg",
        "gender": 0,
        "phone": "17611776902",
        "email": "",
        "status": 0,
        "trendCount": 35,
        "followerCount": 6,
        "fanCount": 6,
        "lastLoginIp": "192.168.1.4",
        "lastLoginDate": "2025-01-19 19:52:49",
        "createTime": "2024-07-31 17:20:11"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 32,
      "totalPages": 4
    }
  }
}
```

---

### 4.2 获取用户详情

**GET** `/users/:id`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 29,
    "hsId": 9330895819,
    "username": "头像",
    "avatar": "https://image.mayongjian.cn/2024/10/14/0de4d36ccefc45d78d32c91b93237827.jpeg",
    "gender": 0,
    "phone": "17611776902",
    "email": "",
    "tags": ["金牛座", "土象"],
    "description": "一只野生程序员",
    "status": 0,
    "userCover": "https://image.mayongjian.cn/2024/06/28/14afeb0718154faf9256b631ce15a6b1.jpg",
    "birthday": null,
    "address": "内网IP",
    "trendCount": 35,
    "followerCount": 6,
    "fanCount": 6,
    "lastLoginIp": "192.168.1.4",
    "lastLoginDate": "2025-01-19 19:52:49",
    "createTime": "2024-07-31 17:20:11"
  }
}
```

---

### 4.3 更新用户状态

**PUT** `/users/:id/status`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | int | 是 | 状态（0正常 1封禁） |
| reason | string | 否 | 封禁原因 |

**请求示例：**

```json
{
  "status": 1,
  "reason": "发布违规内容"
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "用户状态已更新"
}
```

---

### 4.4 解封用户

**PUT** `/users/:id/unban`

**响应示例：**

```json
{
  "code": 200,
  "message": "用户已解封"
}
```

---

### 4.5 获取用户帖子列表

**GET** `/users/:id/notes`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "帖子标题",
        "cover": "https://example.com/cover.jpg",
        "likeCount": 123,
        "collectCount": 45,
        "commentCount": 12,
        "status": 0,
        "createTime": "2024-08-01 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 35
    }
  }
}
```

---

## 5. 帖子管理

### 5.1 获取帖子列表

**GET** `/notes`

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| keyword | string | 否 | 搜索关键词 |
| status | int | 否 | 状态（0待审核 1已发布 2已下架） |
| albumId | int | 否 | 所属企划ID |
| startDate | string | 否 | 创建开始日期 |
| endDate | string | 否 | 创建结束日期 |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "uid": 29,
        "username": "头像",
        "avatar": "https://example.com/avatar.jpg",
        "title": "帖子标题",
        "cover": "https://example.com/cover.jpg",
        "type": 1,
        "status": 1,
        "likeCount": 123,
        "collectCount": 45,
        "commentCount": 12,
        "viewCount": 456,
        "albumId": 1,
        "albumName": "企划名称",
        "tags": ["标签1", "标签2"],
        "createTime": "2024-08-01 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 5847
    }
  }
}
```

---

### 5.2 获取帖子详情

**GET** `/notes/:id`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "uid": 29,
    "username": "头像",
    "avatar": "https://example.com/avatar.jpg",
    "title": "帖子标题",
    "content": "帖子正文内容",
    "pictures": [
      "https://example.com/pic1.jpg",
      "https://example.com/pic2.jpg"
    ],
    "type": 1,
    "status": 1,
    "likeCount": 123,
    "collectCount": 45,
    "commentCount": 12,
    "viewCount": 456,
    "albumId": 1,
    "albumName": "企划名称",
    "tags": ["标签1", "标签2"],
    "createTime": "2024-08-01 10:00:00"
  }
}
```

---

### 5.3 审核帖子

**PUT** `/notes/:id/audit`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | int | 是 | 审核状态（1通过 2拒绝） |
| reason | string | 否 | 拒绝原因 |

**请求示例：**

```json
{
  "status": 1
}
```

或

```json
{
  "status": 2,
  "reason": "内容不符合社区规范"
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "审核完成"
}
```

---

### 5.4 上架/下架帖子

**PUT** `/notes/:id/publish`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | int | 是 | 状态（1上架 2下架） |
| reason | string | 否 | 下架原因 |

**响应示例：**

```json
{
  "code": 200,
  "message": "操作成功"
}
```

---

### 5.5 删除帖子

**DELETE** `/notes/:id`

**响应示例：**

```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

### 5.6 获取帖子评论列表

**GET** `/notes/:id/comments`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 17,
        "nid": 43,
        "uid": 38,
        "username": "美女",
        "avatar": "https://example.com/avatar.jpg",
        "content": "作品好棒",
        "likeCount": 2,
        "status": 0,
        "createTime": "2024-07-01 00:25:36",
        "replies": [
          {
            "id": 28,
            "uid": 30,
            "username": "壁纸",
            "content": "谢谢",
            "likeCount": 0,
            "createTime": "2024-07-24 01:24:38"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 2
    }
  }
}
```

---

## 6. 企划/专辑管理

### 6.1 获取企划列表

**GET** `/albums`

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| keyword | string | 否 | 搜索关键词 |
| status | int | 否 | 状态（0草稿 1进行中 2已结束） |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "企划名称",
        "cover": "https://example.com/cover.jpg",
        "description": "企划描述",
        "status": 1,
        "userCount": 128,
        "noteCount": 456,
        "createTime": "2024-08-01 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 128
    }
  }
}
```

---

### 6.2 获取企划详情

**GET** `/albums/:id`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "企划名称",
    "cover": "https://example.com/cover.jpg",
    "description": "企划描述",
    "status": 1,
    "userCount": 128,
    "noteCount": 456,
    "coverList": [
      {
        "id": 1,
        "picture": "https://example.com/pic1.jpg",
        "uid": 29,
        "username": "头像"
      }
    ],
    "createTime": "2024-08-01 10:00:00"
  }
}
```

---

### 6.3 更新企划状态

**PUT** `/albums/:id/status`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | int | 是 | 状态（0草稿 1进行中 2已结束） |

**响应示例：**

```json
{
  "code": 200,
  "message": "状态已更新"
}
```

---

## 7. 标签管理

### 7.1 获取标签列表

**GET** `/tags`

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| keyword | string | 否 | 搜索关键词 |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "标签名称",
        "noteCount": 128,
        "createTime": "2024-08-01 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 50
    }
  }
}
```

---

### 7.2 创建标签

**POST** `/tags`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 标签名称 |

**响应示例：**

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1,
    "name": "新标签"
  }
}
```

---

### 7.3 删除标签

**DELETE** `/tags/:id`

**响应示例：**

```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 8. 人设卡管理

### 8.1 获取人设卡列表

**GET** `/roles`

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| keyword | string | 否 | 搜索关键词（人设卡名称/创建者） |
| status | string | 否 | 状态筛选（public-公开, hidden-隐藏/私密） |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "fad9561d-aaa2-4ca5-aec9-358f65b790db",
        "name": "林洛洛洛",
        "avatarUrl": null,
        "imageUrls": [
          "http://10.146.158.17:4000/uploads/roles/xxx.jpg"
        ],
        "description": "改bug好命苦",
        "ownerUserId": "0000001",
        "ownerNickname": "林洛",
        "ownerAvatarUrl": "http://10.146.158.17:4000/uploads/avatars/xxx.jpg",
        "isPublic": true,
        "isHidden": false,
        "likesCount": 1,
        "followersCount": 0,
        "createdAt": "2026-04-17T10:15:52.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 8.2 获取人设卡详情

**GET** `/roles/:id`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "fad9561d-aaa2-4ca5-aec9-358f65b790db",
    "name": "林洛洛洛",
    "avatarUrl": null,
    "imageUrls": [
      "http://10.146.158.17:4000/uploads/roles/xxx.jpg"
    ],
    "description": "改bug好命苦",
    "relationship": null,
    "timeline": [],
    "ownerUserId": "0000001",
    "ownerNickname": "林洛",
    "ownerAvatarUrl": "http://10.146.158.17:4000/uploads/avatars/xxx.jpg",
    "isPublic": true,
    "isHidden": false,
    "likesCount": 1,
    "followersCount": 0,
    "createdAt": "2026-04-17T10:15:52.000Z"
  }
}
```

---

### 8.3 隐藏/显示人设卡

**PATCH** `/roles/:id/visibility`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isHidden | boolean | 是 | 是否隐藏（true-隐藏, false-显示） |

**请求示例：**

```json
{
  "isHidden": true
}
```

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "ok": true
  }
}
```

---

### 8.4 设置公开/私密

**PATCH** `/roles/:id/public`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isPublic | boolean | 是 | 是否公开（true-公开, false-私密） |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "ok": true
  }
}
```

---

### 8.5 删除人设卡

**DELETE** `/roles/:id`

**说明：** 删除时会同时删除关联的点赞、收藏和评论数据。

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "ok": true
  }
}
```

---

### 8.6 获取人设卡评论列表

**GET** `/roles/:id/comments`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "comment-uuid",
        "postId": "fad9561d-aaa2-4ca5-aec9-358f65b790db",
        "authorUserId": "user-id",
        "authorNickname": "评论者",
        "authorAvatarUrl": "avatar-url",
        "content": "评论内容",
        "imageUrl": null,
        "likesCount": 0,
        "createdAt": "2026-04-17T12:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## 9. 评论管理

### 8.1 获取评论列表

**GET** `/comments`

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| keyword | string | 否 | 搜索关键词 |
| status | int | 否 | 状态（0正常 1删除） |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 17,
        "nid": 43,
        "noteTitle": "帖子标题",
        "uid": 38,
        "username": "美女",
        "avatar": "https://example.com/avatar.jpg",
        "content": "作品好棒",
        "likeCount": 2,
        "status": 0,
        "createTime": "2024-07-01 00:25:36"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100
    }
  }
}
```

---

### 8.2 删除评论

**DELETE** `/comments/:id`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reason | string | 否 | 删除原因 |

**响应示例：**

```json
{
  "code": 200,
  "message": "评论已删除"
}
```

---

## 9. 举报管理

> 说明：举报管理需要先确认数据库是否有 `report` 或 `web_report` 表，如果暂无可以先跳过此模块。

### 9.1 获取举报列表

**GET** `/reports`

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "reporterId": 29,
        "reporterName": "用户A",
        "reportedType": "note",
        "reportedId": 123,
        "reportedContent": "被举报内容",
        "reason": "违规内容",
        "status": 0,
        "createTime": "2024-08-01 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 8
    }
  }
}
```

---

### 9.2 处理举报

**PUT** `/reports/:id/handle`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | int | 是 | 处理状态（1已处理 2忽略） |
| result | string | 否 | 处理结果说明 |

**响应示例：**

```json
{
  "code": 200,
  "message": "处理完成"
}
```

---

## 10. 操作日志

### 10.1 获取操作日志列表

**GET** `/logs`

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| keyword | string | 否 | 搜索关键词 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "adminId": 1,
        "adminName": "admin",
        "action": "封禁用户",
        "target": "用户:29",
        "detail": "status: 0 -> 1, reason: 发布违规内容",
        "ip": "127.0.0.1",
        "createTime": "2024-08-01 10:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 500
    }
  }
}
```

---

## 11. 附录

### 11.1 数据库表结构参考

| 表名 | 说明 |
|------|------|
| web_user | 用户表 |
| web_note | 帖子表 |
| web_album | 企划/专辑表 |
| web_tag | 标签表 |
| web_comment | 评论表 |
| web_like_or_collect | 点赞收藏表 |
| web_follow | 关注表 |
| web_visit | 访问记录表 |
| web_login_log | 登录日志表 |
| web_oper_log | 操作日志表 |
| admins | 管理员表 |
| roles | 人设卡表 |
| role_likes | 人设卡点赞表 |

### 11.2 状态值说明

**用户状态 (web_user.status)：**
- 0: 正常
- 1: 封禁

**帖子状态 (web_note.status)：**
- 0: 待审核
- 1: 已发布
- 2: 已下架

**企划状态 (web_album.status)：**
- 0: 草稿
- 1: 进行中
- 2: 已结束

**帖子类型 (web_note.type)：**
- 1: 图文
- 2: 视频

---

> 文档版本: v1.0.0  
> 最后更新: 2026-04-17
