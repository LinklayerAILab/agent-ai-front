# StatusIndicator 组件

基于 LinkLayer 项目风格的状态指示器组件。

## 特性

- ✅ 多种状态颜色（绿色、红色、黄色、主要色、灰色）
- ✅ 可自定义尺寸
- ✅ 脉冲动画效果
- ✅ 加载状态支持
- ✅ 悬浮和按压交互效果
- ✅ 随机动画延迟，避免同步闪烁

## 使用方法

### 基础用法

```tsx
import StatusIndicator from "@/app/components/StatusIndicator";

// 默认灰色状态
<StatusIndicator />

// 指定状态颜色
<StatusIndicator statusColor="GREEN" />
<StatusIndicator statusColor="RED" />
<StatusIndicator statusColor="YELLOW" />
<StatusIndicator statusColor="PRIMARY" />
```

### 尺寸控制

```tsx
// 小尺寸 (16px)
<StatusIndicator statusColor="GREEN" size={16} />

// 中等尺寸 (24px, 默认)
<StatusIndicator statusColor="GREEN" size={24} />

// 大尺寸 (32px)
<StatusIndicator statusColor="GREEN" size={32} />

// 超大尺寸 (48px)
<StatusIndicator statusColor="GREEN" size={48} />
```

### 加载状态

```tsx
<StatusIndicator loading size={32} />
```

### 关闭脉冲效果

```tsx
<StatusIndicator statusColor="GREEN" pulse={false} />
```

### 自定义边框

```tsx
<StatusIndicator statusColor="GREEN" borderWidth={1} />
<StatusIndicator statusColor="GREEN" borderWidth={2} />
<StatusIndicator statusColor="GREEN" borderWidth={3} />
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `statusColor` | `'GREEN' \| 'RED' \| 'YELLOW' \| 'PRIMARY' \| 'GRAY'` | `'GRAY'` | 状态颜色 |
| `size` | `number` | `24` | 指示器尺寸（像素） |
| `borderWidth` | `number` | `2` | 边框宽度（像素） |
| `pulse` | `boolean` | `true` | 是否显示脉冲动画 |
| `loading` | `boolean` | `false` | 是否为加载状态 |
| `className` | `string` | `''` | 自定义类名 |

## 状态颜色映射

- `GREEN` - 正常/健康状态（绿色 #4ade80）
- `YELLOW` - 警告状态（黄色 #fbbf24）
- `RED` - 错误/危险状态（红色 #f87171）
- `PRIMARY` - 主要状态（项目主色 #cf0）
- `GRAY` - 未知/禁用状态（灰色 #d1d5db）

## 设计特点

1. **项目风格一致** - 使用项目的边框、阴影、按压效果
2. **动画优化** - 使用 `useMemo` 避免重复计算随机延迟
3. **响应式** - 在移动端有优化的交互效果
4. **可访问性** - 清晰的视觉反馈

## 实际应用示例

在 Brc20Card 中使用：

```tsx
import StatusIndicator from "@/app/components/StatusIndicator";

export function Brc20Card() {
  return (
    <div className="...">
      <div className="flex items-center gap-2">
        <StatusIndicator
          statusColor="GREEN"
          size={20}
        />
        <div>Optimal</div>
      </div>
    </div>
  );
}
```
