# Event 事件

## 概要

- `Event` 表示一个事件

## 数据

### JSON 格式

`Event`: [id.json](Tineapp\data\EVENTS\id.json)

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `id` | Id | 必需 | 创建时自动生成，用户不能编辑 | |
| `name` | string | 必需 | 用户从文字输入框编辑 | |
| `type` | EventType | 不必需 | 用户从选择框选择，选择框里显示的是 EventType 在软件语言下的含义而不是数字 | |
| `span` | Span | 必需 | 用户从 Span 组件编辑 | 必须在所属对象的生命周期内 |

### 示例

[Cg0_Wd0_Ch0_Ev1.json](Tineapp\data\EVENTS\Cg0_Wd0_Ch0_Ev1.json)

```json
{
    "id": "Cg0_Wd0_Ch0_Ev1",
    "name": "示例角色 1 去世",
    "type": 1,
    "span": { "start": { "unit0": 1013 }, "type": 1 }
}
```

### 规则


- Character 必须有且仅有一个 birth，最多一个 death
- Organization / Regime 必须有且仅有一个 establishment
- Organization 最多一个 dissolution
- Regime 最多一个 destruction
- 如果 `SpanType` 为 default，`Event` 的生命周期即其 `Span`；如果 `SpanType` 为 instant，`Event` 的生命周期为严格的该时间点；如果 `SpanType` 为 lifelong，`Event` 的生命周期为 start 起至所属对象生命周期结束；如果 `SpanType` 为 eternal，`Event` 的生命周期直至永恒

## 类

### 路径

[EventService](Tineapp\engine\main\services\EventService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成