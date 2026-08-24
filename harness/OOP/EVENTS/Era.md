# Era 时期

## 概要

- `Era` 表示一个时期
- 一个时期描述对象在一段时间内的基调

## 数据

### JSON 格式

`Era`: [id.json](Tineapp\data\EVENTS\id.json)

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `id` | Id | 必需 | 创建时自动生成，用户不能编辑 | |
| `name` | string | 必需 | 用户从文字输入框编辑 | |
| `properties` | Property[] | 不必需 | 用户从 Property 组件编辑 | |
| `span` | Span | 必需 | 用户从 Span 组件编辑 | `SpanType` 必须为 default，锁定该选择框，不能编辑；必须在所属对象的生命周期内 |

### 示例

[Cg0_Wd0_Er0.json](Tineapp\data\EVENTS\Cg0_Wd0_Er0.json)

```json
{
    "id": "Cg0_Wd0_Er0",
    "name": "示例时期 1",
    "properties": [ { "key": "示例时期的属性 1", "value": "示例时期属性 1 的值" } ],
    "span": { "start": { "unit0": 968, "unit1": 1, "unit2": 1 }, "type": 0, "end": { "unit0": 1120, "unit1": 1, "unit2": 1 } }
}
```

### 规则

- `Era` 的生命周期即其 `Span`

## 类

### 路径

[EraService](Tineapp\engine\main\services\EraService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成