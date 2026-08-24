# Relationship 关系

## 概要

- `Relationship` 表示两个 ENTITY 之间的单向、不可传递的关系

## 数据

### JSON 格式

`Relationship`: [id.json](Tineapp\data\relationships\id.json)

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `id` | Id | 必需 | 创建时自动生成，用户不能编辑 | |
| `target` | Id | 必需 | 用户从选择框选择，选择框里显示的是本世界 ENTITY 的 "name" 而不是 Id | 不能是自身、Tag 或不存在的 ENTITY |
| `type` | RelationshipType | 不必需 | 用户从选择框选择，选择框里显示的是 RelationshipType 在软件语言下的含义而不是数字 | |
| `span` | Span | 必需 | 用户从 Span 组件编辑 | 必须在所属 ENTITY 与目标 ENTITY 的生命周期交集内 |

### 示例

[Cg0_Wd0_Ch0_Rl0.json](Tineapp\data\relationships\Cg0_Wd0_Ch0_Rl0.json)

```json
{
    "id": "Cg0_Wd0_Ch0_Rl0",
    "target": "Cg0_Wd0_Ch1",
    "type": 0,
    "span": { "start": { "unit0": 998 }, "type": 0, "end": { "unit0": 1013 } }
}
```

### 规则

- 同一个 ENTITY 对另一个 ENTITY 可以有多个关系，但若 span 有重叠，则 `type` 不能相同

## 类

### 路径

[RelationshipService](Tineapp\engine\main\services\RelationshipService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成