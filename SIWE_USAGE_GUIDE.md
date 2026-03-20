# Reown AppKit SIWE 一键登录使用指南

## 概述

Reown AppKit 已经集成了 SIWE (Sign-In with Ethereum) 功能。当你配置了 `siweConfig` 后，用户连接钱包时会自动触发 SIWE 签名流程。

## 方法 1: 使用自动 SIWE 流程（推荐）

当用户使用 `open()` 连接钱包时，如果配置了 SIWE，AppKit 会自动：
1. 获取 nonce
2. 创建 SIWE 消息
3. 请求用户签名
4. 验证签名
5. 创建会话

```tsx
import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'

function Connect() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()

  const handleLogin = async () => {
    // 打开 AppKit 模态框
    // SIWE 签名会自动在连接后触发
    await open()
  }

  // 监听连接状态
  useEffect(() => {
    if (isConnected && address) {
      console.log('用户已连接并完成 SIWE 签名:', address)
      // 这里可以获取 access_token
      const token = localStorage.getItem('access_token')
      console.log('Access Token:', token)
    }
  }, [isConnected, address])

  return (
    <button onClick={handleLogin}>
      Connect & Sign
    </button>
  )
}
```

## 方法 2: 使用 AppKit 的 SIWE hooks

Reown AppKit 提供了 SIWE 相关的 hooks 来监听签名状态：

```tsx
import { useAppKit, useAppKitAccount, useAppKitState } from '@reown/appkit/react'

function Connect() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { selectedNetworkId } = useAppKitState()

  const handleLogin = async () => {
    try {
      // 打开模态框，自动触发 SIWE
      await open()

      // 连接成功后，SIWE 签名会自动处理
      console.log('Connected:', address)
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  return (
    <button onClick={handleLogin}>
      Login with SIWE
    </button>
  )
}
```

## 方法 3: 手动触发 SIWE 签名（使用 wagmi 的 signMessage）

如果你需要在连接后手动触发签名流程：

```tsx
import { useAccount, useSignMessage } from 'wagmi'
import { SiweMessage } from 'siwe'
import { getSiweNonce, verifySiweMessage } from '@/app/api/siwe'

function Connect() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const handleSIWELogin = async () => {
    if (!address || !isConnected) {
      console.error('Please connect wallet first')
      return
    }

    try {
      // 1. 获取 nonce
      const nonce = await getSiweNonce()

      // 2. 创建 SIWE 消息
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: 'Sign in with Ethereum to LinkLayer AI Agent',
        uri: window.location.origin,
        version: '1',
        chainId: 1, // 或者使用当前链的 ID
        nonce: nonce,
      })

      // 3. 格式化消息
      const message = siweMessage.prepareMessage()

      // 4. 请求用户签名
      const signature = await signMessageAsync({ message })

      // 5. 验证签名并获取 token
      const result = await verifySiweMessage(message, signature)

      if (result.success && result.accessToken) {
        localStorage.setItem('access_token', result.accessToken)
        console.log('SIWE login successful!')
      }
    } catch (error) {
      console.error('SIWE login failed:', error)
    }
  }

  return (
    <div>
      {isConnected ? (
        <button onClick={handleSIWELogin}>
          Sign In with Ethereum
        </button>
      ) : (
        <button onClick={() => open()}>
          Connect Wallet
        </button>
      )}
    </div>
  )
}
```

## 方法 4: 监听 SIWE 配置的回调

在 `app/config/siwe.ts` 中，你可以在 `verifyMessage` 回调中处理签名后的逻辑：

```typescript
// app/config/siwe.ts
export const siweConfig = createSIWEConfig({
  // ... 其他配置

  // 验证消息并登录
  verifyMessage: async (args: SIWEVerifyMessageArgs): Promise<boolean> => {
    try {
      const result = await verifySiweMessage(args.message, args.signature)

      if (result.success && result.accessToken) {
        // 保存 access token
        localStorage.setItem('access_token', result.accessToken)

        // 保存用户信息
        if (result.user) {
          localStorage.setItem('siweUser', JSON.stringify(result.user))

          // 🔥 在这里可以调用你的后端登录 API
          // 使用钱包地址作为用户标识
          const walletLoginResult = await tgLogin({
            user_id: result.user.address,
            user_name: addressDots(result.user.address, 6, 4),
            first_name: "User",
            last_name: "",
            invite_code: localStorage.getItem('invite_code') || "",
          })

          // 同步 Redux store
          // dispatch(setUserInfo(walletLoginResult.data))
        }

        return true
      }

      return false
    } catch (error) {
      console.error('SIWE verification error:', error)
      return false
    }
  },
})
```

## 方法 5: 使用 AppKit 的社交登录（Telegram/Google/X 等）

对于社交登录，AppKit 会自动处理认证流程：

```tsx
import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'

function SocialLogin() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()

  const handleSocialLogin = async () => {
    // 打开 AppKit 模态框
    // 用户可以选择 Telegram、Google、X 等社交登录方式
    await open({ view: 'Connect' })
  }

  // 监听社交登录成功
  useEffect(() => {
    if (isConnected && address) {
      // 社交登录成功后，address 会是生成的钱包地址
      console.log('Social login successful:', address)

      // 调用你的后端 API 进行用户登录
      tgLogin({
        user_id: address,
        user_name: addressDots(address, 6, 4),
        first_name: "User",
        last_name: "",
        invite_code: localStorage.getItem('invite_code') || "",
      }).then((res) => {
        localStorage.setItem('access_token', res.data.access_token)
        // ... 更新 Redux state
      })
    }
  }, [isConnected, address])

  return (
    <button onClick={handleSocialLogin}>
      Login with Social
    </button>
  )
}
```

## 当前 Connect.tsx 的实现

你当前的 `Connect.tsx` 已经实现了方法 1 和方法 5 的组合：

```tsx
// app/components/Connect.tsx (第 142-153 行)
const handleLogin = async () => {
  try {
    setLoading(true);
    // 使用 Reown AppKit 打开连接模态框进行社交登录
    await open();
  } catch (err) {
    console.error('Social auth error:', err);
    messageApi.error(t("login.authFailed") || "Login failed. Please try again");
  } finally {
    setLoading(false);
  }
}

// 监听钱包连接状态，用于社交登录后的用户信息同步 (第 60-92 行)
useEffect(() => {
  if(isConnected && address) {
    if (!isLogin) {
      // 使用钱包地址作为用户标识进行登录
      const invite_code = localStorage.getItem(INVITE_CODE_KEY) || "";
      tgLogin({
        user_id: address,
        user_name: addressDots(address, 6, 4),
        first_name: "User",
        last_name: "",
        invite_code,
      }).then((res) => {
        localStorage.setItem("access_token", res.data.access_token);
        // ... 更新用户信息
      })
    }
  }
}, [isConnected, address, isLogin])
```

## 工作流程

### 自动 SIWE 流程（当前实现）

1. 用户点击登录按钮
2. `open()` 打开 Reown AppKit 模态框
3. 用户选择连接方式（钱包 / 社交登录）
4. **如果是传统钱包**：
   - AppKit 自动获取 nonce (`/api/siwe/nonce`)
   - 创建 SIWE 消息
   - 请求用户在钱包中签名
   - 验证签名 (`/api/siwe/verify`)
   - 保存 access_token
5. **如果是社交登录**（Telegram/Google/X）：
   - AppKit 通过 OAuth 完成社交认证
   - 生成临时钱包地址
   - 触发 SIWE 签名流程（自动完成）
6. `useAccount` hook 检测到 `isConnected` 和 `address`
7. `useEffect` 调用后端 `tgLogin` API
8. 保存 access_token 并更新 Redux state

## 注意事项

1. **SIWE 配置必须启用**：确保在 `WagmiProvider.tsx` 中传入了 `siweConfig`
2. **后端 API 必须实现**：确保 `/api/siwe/nonce`、`/api/siwe/verify`、`/api/siwe/session`、`/api/siwe/logout` 都已实现
3. **社交登录自动触发 SIWE**：使用社交登录时，AppKit 会自动完成 SIWE 签名流程
4. **监听钱包状态变化**：使用 `useAccount` 监听连接状态和地址变化
5. **Token 存储**：签名验证成功后，access_token 会存储在 localStorage 中

## 调试技巧

在浏览器控制台查看 SIWE 流程：

```javascript
// 查看 SIWE 配置
console.log('SIWE Config:', siweConfig)

// 查看当前连接状态
console.log('Connected:', isConnected)
console.log('Address:', address)

// 查看 access_token
console.log('Access Token:', localStorage.getItem('access_token'))

// 查看 SIWE 用户信息
console.log('SIWE User:', localStorage.getItem('siweUser'))
```

## 相关文件

- `app/components/Connect.tsx` - 登录组件
- `app/config/siwe.ts` - SIWE 配置
- `app/api/siwe.ts` - SIWE API 客户端
- `app/api/siwe/nonce/route.ts` - Nonce API 端点
- `app/api/siwe/verify/route.ts` - 验证 API 端点
- `app/api/siwe/session/route.ts` - 会话 API 端点
- `app/api/siwe/logout/route.ts` - 登出 API 端点
