# Span 时间段
## 概要

- `Span` 描述一段连续的时间
- 是包括起止 TimePoint 的闭区间

## 数据

### JSON 格式

`Span`

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `start` | TimePoint | 必需 | 用户从 TimePoint 组件编辑 | |
| `type` | SpanType | 必需 | 用户从按钮选择，按钮上显示的是 SpanType 在软件语言下的含义而不是数字 | |
| `end` | TimePoint | `type` 为 default 时必需，非 default 时不存在该键 | 用户从 TimePoint 组件编辑 | |

### 规则

- `Span` 必须在所属 ENTITY 的生命周期内，所属 ENTITY 指的是 `Span` 所在的 id.json 所指的 ENTITY
- `Relationship` 的 `Span` 必须在所属 ENTITY 与目标 ENTITY 的生命周期交集内

### 示例

[Cg0_Wd0_Ch0_Ev0.json](Tineapp\data\EVENTS\Cg0_Wd0_Ch0_Ev0.json) 的 "span" 值

```json
{
    "start": {
        "unit0": 970
    },
    "type": 1
}
```

[Cg0_Wd0_Ev0_Ev1.json](Tineapp\data\EVENTS\Cg0_Wd0_Ev0_Ev1.json) 的 "span" 值

```json
{
    "start": {
        "unit0": 1021
    },
    "type": 0,
    "end": {
        "unit0": 1023
    }
}
```

## 类

### 路径

[SpanService](Tineapp\engine\main\services\SpanService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成