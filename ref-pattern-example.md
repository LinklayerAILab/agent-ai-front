# useRef 模式 vs 直接调用 - 详细对比

## 问题：依赖循环导致组件重新挂载

### ❌ 方案1：直接在依赖中使用函数

```typescript
function CoinsList() {
  const [searchStr, setSearchStr] = useState("");

  // Step 1: handleGetList 依赖 searchStr
  const handleGetList = useCallback(async () => {
    if (searchStr) {
      console.log('搜索:', searchStr);
    }
    await api.getCoins();
  }, [searchStr]); // 每次 searchStr 变化，函数重新创建

  // Step 2: handleGetRanking 依赖 handleGetList
  const handleGetRanking = useCallback(async () => {
    const data = await api.getRanking();

    // 创建定时器
    timer.current = setInterval(() => {
      handleGetList(); // 直接调用
    }, 8000);
  }, [handleGetList]); // handleGetList 变化时，这个函数也要重新创建

  // Step 3: useEffect 依赖 handleGetRanking
  useEffect(() => {
    console.log('组件挂载，初始化数据');
    handleGetRanking();

    return () => {
      console.log('组件卸载');
    };
  }, [handleGetRanking]); // handleGetRanking 变化时，useEffect 重新执行

  return (
    <input
      value={searchStr}
      onChange={(e) => setSearchStr(e.target.value)}
    />
  );
}
```

**运行日志**：
```
用户输入 "BTC"
→ searchStr: "" → "BTC"
→ handleGetList 重新创建（依赖 searchStr）
→ handleGetRanking 重新创建（依赖 handleGetList）
→ useEffect 重新执行（依赖 handleGetRanking）
→ 打印：组件卸载
→ 打印：组件挂载，初始化数据
→ 又创建新定时器（旧定时器可能没清除）
→ 现在有 2 个定时器在运行！❌

用户继续输入 "BTCUSDT"
→ 又重新挂载一次
→ 现在有 3 个定时器在运行！❌❌

结果：API 调用越来越频繁！
```

---

### ✅ 方案2：使用 ref 打破依赖链

```typescript
function CoinsList() {
  const [searchStr, setSearchStr] = useState("");

  // Step 1: 创建 ref 存储函数引用
  const handleGetListRef = useRef<() => Promise<void>>(async () => {});

  // Step 2: handleGetList 正常依赖 searchStr
  const handleGetList = useCallback(async () => {
    if (searchStr) {
      console.log('搜索:', searchStr);
    }
    await api.getCoins();
  }, [searchStr]); // searchStr 变化时重新创建

  // Step 3: 同步最新函数到 ref
  useEffect(() => {
    handleGetListRef.current = handleGetList;
    console.log('handleGetList 已更新');
  }, [handleGetList]);

  // Step 4: handleGetRanking 不依赖 handleGetList
  const handleGetRanking = useCallback(async () => {
    const data = await api.getRanking();

    // 创建定时器，使用 ref 调用
    timer.current = setInterval(() => {
      handleGetListRef.current(); // ✅ 通过 ref 调用
    }, 8000);
  }, []); // ✅ 空依赖数组，只创建一次

  // Step 5: useEffect 不依赖 handleGetRanking
  useEffect(() => {
    console.log('组件挂载，初始化数据');
    handleGetRanking();

    return () => {
      console.log('组件卸载');
    };
  }, []); // ✅ 空依赖，只在真正挂载/卸载时执行

  return (
    <input
      value={searchStr}
      onChange={(e) => setSearchStr(e.target.value)}
    />
  );
}
```

**运行日志**：
```
首次渲染
→ 打印：组件挂载，初始化数据
→ 创建定时器（只有 1 个）✅

用户输入 "BTC"
→ searchStr: "" → "BTC"
→ handleGetList 重新创建（依赖 searchStr）
→ 打印：handleGetList 已更新
→ handleGetRanking 不重新创建 ✅
→ useEffect 不重新执行 ✅
→ 定时器继续稳定运行 ✅

8 秒后，定时器触发
→ 调用 handleGetListRef.current()
→ 实际执行的是最新的 handleGetList
→ 打印：搜索: BTC ✅
→ 使用最新的 searchStr 值！✅

用户继续输入 "BTCUSDT"
→ searchStr: "BTC" → "BTCUSDT"
→ handleGetList 重新创建
→ 打印：handleGetList 已更新
→ 定时器不重建，继续用同一个 ✅

结果：始终只有 1 个定时器，8秒间隔稳定！✅
```

---

## 核心原理图解

### 直接调用的依赖链：
```
searchStr 变化
    ↓
handleGetList 重新创建 (依赖 searchStr)
    ↓
handleGetRanking 重新创建 (依赖 handleGetList)
    ↓
useEffect 重新执行 (依赖 handleGetRanking)
    ↓
创建新定时器 → 泄漏！❌
```

### ref 模式打破依赖链：
```
searchStr 变化
    ↓
handleGetList 重新创建 (依赖 searchStr)
    ↓
handleGetListRef.current 更新 ← useEffect 同步
    ↓
handleGetRanking 不变 (不依赖 handleGetList) ✅
    ↓
useEffect 不执行 (不依赖 handleGetRanking) ✅
    ↓
定时器继续稳定运行 ✅
    ↓
定时器调用 ref.current() → 获取最新逻辑 ✅
```

---

## 关键点总结

### 1. ref 对象引用永远不变
```typescript
const ref = useRef(initialValue);
// ref 对象本身的引用永远不变
// 但 ref.current 可以随时更新
```

### 2. 依赖 ref 不会触发重新渲染
```typescript
const handleGetRanking = useCallback(() => {
  // 使用 ref，不需要在依赖数组中声明
  handleGetListRef.current();
}, []); // ✅ 空依赖，只创建一次

// vs

const handleGetRanking = useCallback(() => {
  // 直接使用函数，必须在依赖数组中声明
  handleGetList();
}, [handleGetList]); // ❌ handleGetList 变化时重新创建
```

### 3. 定时器/事件监听器场景必用 ref
```typescript
// ❌ 错误：捕获旧值
useEffect(() => {
  const handler = () => {
    console.log(count); // 闭包捕获的是 effect 创建时的 count
  };
  window.addEventListener('click', handler);
  return () => window.removeEventListener('click', handler);
}, []); // count 变化时不会更新 handler

// ✅ 正确：始终最新
const handlerRef = useRef(() => {});
useEffect(() => {
  handlerRef.current = () => {
    console.log(count); // 始终使用最新的 count
  };
}, [count]);

useEffect(() => {
  const handler = () => handlerRef.current();
  window.addEventListener('click', handler);
  return () => window.removeEventListener('click', handler);
}, []); // 监听器只注册一次
```

---

## 实际代码对比

### 修复前的问题代码（来自我们的 CoinsList）：
```typescript
// ❌ 问题：每次 handleGetList 变化，handleGetRanking 也变化
const handleGetRanking = useCallback(async (collects) => {
  // ...
  timer.current = setInterval(() => {
    handleGetList(); // 直接调用
  }, 8000);
}, [handleGetList]); // ❌ 依赖 handleGetList

useEffect(() => {
  handleGetRanking(null);
}, [handleGetRanking]); // ❌ handleGetRanking 变化时重新执行
```

**结果**：组件疯狂重新挂载

### 修复后的代码：
```typescript
// ✅ 解决：使用 ref，打破依赖链
const handleGetListRef = useRef<() => Promise<void>>(async () => {});

useEffect(() => {
  handleGetListRef.current = handleGetList;
}, [handleGetList]);

const handleGetRanking = useCallback(async (collects) => {
  // ...
  timer.current = setInterval(() => {
    handleGetListRef.current(); // ✅ 通过 ref 调用
  }, 8000);
}, []); // ✅ 不依赖 handleGetList

useEffect(() => {
  handleGetRankingRef.current(null);
}, [isLogin]); // ✅ 只在 isLogin 变化时执行
```

**结果**：组件只在必要时挂载，定时器稳定运行

---

## 何时使用 ref 模式？

### 必须使用的场景：
1. ✅ 定时器中调用函数
2. ✅ 事件监听器中调用函数
3. ✅ 打破 useCallback/useEffect 依赖循环
4. ✅ 需要在异步回调中访问最新状态

### 不需要使用的场景：
1. ❌ 普通的同步函数调用
2. ❌ 没有依赖循环问题的地方
3. ❌ 组件内部简单的事件处理器

---

## 记忆口诀

**"定时器、监听器，用 ref 才灵器"**

当你需要在：
- `setInterval` / `setTimeout`
- `addEventListener`
- WebSocket 回调
- Promise 回调

中调用依赖组件状态的函数时，必须使用 ref 模式！
