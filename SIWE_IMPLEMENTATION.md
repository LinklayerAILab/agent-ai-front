# SIWE (Sign-In with Ethereum) 实现指南

## 概述

本项目已集成 Reown AppKit 的 SIWE (Sign-In with Ethereum) 功能，允许用户使用他们的以太坊钱包进行一键登录。

## 前端实现

### 已完成的配置

1. **安装的包**
   - `@reown/appkit-siwe`: Reown 的 SIWE 集成包
   - `siwe`: SIWE 标准库

2. **配置文件**
   - `app/config/siwe.ts`: SIWE 配置
   - `app/api/siwe.ts`: SIWE API 封装
   - `app/components/WagmiProvider.tsx`: 已集成 SIWE 配置

### 工作流程

1. 用户点击登录按钮
2. Reown AppKit 打开钱包连接模态框
3. 用户连接钱包后，自动触发 SIWE 签名请求
4. 用户在钱包中签名消息
5. 前端将签名发送到后端验证
6. 验证成功后，后端返回 access_token
7. 前端保存 token 并更新登录状态

## 后端实现要求

你需要在后端实现以下 API 端点：

### 1. 获取 Nonce

**端点**: `GET /api/siwe/nonce`

**响应**:
```json
{
  "nonce": "random_string_here"
}
```

**实现示例** (Node.js/Express):
```javascript
const { generateNonce } = require('siwe');

app.get('/api/siwe/nonce', (req, res) => {
  const nonce = generateNonce();
  // 将 nonce 存储在 session 或 Redis 中
  req.session.nonce = nonce;
  res.json({ nonce });
});
```

### 2. 验证签名并登录

**端点**: `POST /api/siwe/verify`

**请求体**:
```json
{
  "message": "localhost:3000 wants you to sign in with your Ethereum account:\n0x1234...\n\nSign in with Ethereum to LinkLayer AI Agent\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 1\nNonce: random_nonce\nIssued At: 2025-01-15T12:00:00.000Z",
  "signature": "0xabcd..."
}
```

**响应** (成功):
```json
{
  "access_token": "jwt_token_here",
  "address": "0x1234567890abcdef",
  "chainId": 1
}
```

**实现示例** (Node.js/Express):
```javascript
const { SiweMessage } = require('siwe');

app.post('/api/siwe/verify', async (req, res) => {
  try {
    const { message, signature } = req.body;

    // 解析消息
    const siweMessage = new SiweMessage(message);

    // 验证签名
    const fields = await siweMessage.verify({ signature });

    // 验证 nonce（防止重放攻击）
    if (fields.data.nonce !== req.session.nonce) {
      return res.status(400).json({ error: 'Invalid nonce' });
    }

    // 清除已使用的 nonce
    req.session.nonce = null;

    // 获取用户地址和链 ID
    const address = fields.data.address;
    const chainId = fields.data.chainId;

    // 创建或更新用户
    let user = await User.findOne({ address });
    if (!user) {
      user = await User.create({
        address,
        chainId,
        user_name: addressDots(address, 6, 4),
        first_name: "User",
      });
    }

    // 生成 JWT token
    const access_token = jwt.sign(
      { userId: user.id, address },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      access_token,
      address,
      chainId,
    });
  } catch (error) {
    console.error('SIWE verification error:', error);
    res.status(400).json({ error: 'Invalid signature' });
  }
});
```

### 3. 获取会话信息

**端点**: `GET /api/siwe/session`

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应**:
```json
{
  "address": "0x1234567890abcdef",
  "chainId": 1
}
```

**实现示例** (Node.js/Express):
```javascript
app.get('/api/siwe/session', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      address: user.address,
      chainId: user.chainId,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 4. 登出

**端点**: `POST /api/siwe/logout`

**请求头**:
```
Authorization: Bearer <access_token>
```

**响应**:
```json
{
  "success": true
}
```

**实现示例** (Node.js/Express):
```javascript
app.post('/api/siwe/logout', authenticateToken, (req, res) => {
  // 如果使用 JWT，前端会自动删除 token
  // 如果需要黑名单机制，可以将 token 加入黑名单
  res.json({ success: true });
});
```

## 安全考虑

1. **Nonce 管理**
   - 每个 nonce 只能使用一次
   - Nonce 应该有过期时间（建议 5-10 分钟）
   - 使用 Redis 或数据库存储 nonce

2. **签名验证**
   - 验证消息的 domain 和 uri 是否匹配
   - 验证 chainId 是否在允许列表中
   - 验证消息的时间戳（issuedAt, expirationTime）

3. **Token 管理**
   - 使用 HTTPS
   - JWT token 应该有合理的过期时间
   - 考虑实现 refresh token 机制

## 测试

启动开发服务器：
```bash
npm run dev
```

访问应用，点击登录按钮，应该会看到：
1. Reown AppKit 模态框打开
2. 连接钱包
3. 钱包弹出签名请求（SIWE 消息）
4. 签名后自动登录

## 调试

查看浏览器控制台的日志：
- SIWE nonce 获取
- SIWE 签名验证
- Token 保存

## Python/FastAPI 实现示例

```python
from fastapi import FastAPI, Depends, HTTPException
from siwe import SiweMessage
import secrets

app = FastAPI()
nonce_store = {}  # 生产环境应使用 Redis

@app.get("/api/siwe/nonce")
async def get_nonce():
    nonce = secrets.token_hex(16)
    nonce_store[nonce] = True
    return {"nonce": nonce}

@app.post("/api/siwe/verify")
async def verify_siwe(message: str, signature: str):
    try:
        siwe_message = SiweMessage(message=message)
        siwe_message.verify(signature=signature)

        # 验证 nonce
        if siwe_message.nonce not in nonce_store:
            raise HTTPException(status_code=400, detail="Invalid nonce")

        # 删除已使用的 nonce
        del nonce_store[siwe_message.nonce]

        # 创建用户和生成 token
        address = siwe_message.address
        # ... 生成 JWT token

        return {
            "access_token": "your_jwt_token",
            "address": address,
            "chainId": siwe_message.chain_id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

## 常见问题

### Q: SIWE 和社交登录可以同时使用吗？
A: 可以。Reown AppKit 同时支持 SIWE 和社交登录（Google、X、Discord 等）。用户可以选择任意一种方式登录。

### Q: 如何区分 SIWE 登录和社交登录的用户？
A:
- SIWE 登录：用户信息存储在 `localStorage.getItem('siweUser')`
- 社交登录：用户通过 Reown 的 social auth 流程，地址会自动连接

### Q: SIWE 签名消息的格式是什么？
A: SIWE 遵循 EIP-4361 标准，消息格式如下：
```
localhost:3000 wants you to sign in with your Ethereum account:
0x1234567890abcdef

Sign in with Ethereum to LinkLayer AI Agent

URI: http://localhost:3000
Version: 1
Chain ID: 1
Nonce: random_nonce_here
Issued At: 2025-01-15T12:00:00.000Z
```

### Q: 如何自定义签名消息？
A: 修改 `app/config/siwe.ts` 中的 `getMessageParams` 函数：
```typescript
getMessageParams: async () => ({
  domain: window.location.host,
  uri: window.location.origin,
  chains: [getChain().id],
  statement: '你的自定义消息', // 修改这里
}),
```

## 相关资源

- [EIP-4361: Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361)
- [Reown AppKit SIWE 文档](https://docs.reown.com/appkit/next/core/siwe)
- [SIWE 库文档](https://docs.login.xyz/)
