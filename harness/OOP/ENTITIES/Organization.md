# Organization 组织

## 概要

- `Organization` 表示一个组织

## 数据

### JSON 格式

`Organization`: [id.json](Tineapp\data\organizations\id.json)

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `id` | Id | 必需 | 创建时自动生成，用户不能编辑 | |
| `name` | string | 必需 | 用户从文字输入框编辑 | |
| `type` | OrganizationType | 不必需 | 用户从选择框选择，选择框里显示的是 OrganizationType 在软件语言下的含义而不是数字 | |
| `head` | Piecewise<Id 或 null> | 必需 | 用户从 Piecewise 组件编辑，然后从选择框选择，选择框里显示的是本世界 Character 或 Organization 的 "name" 而不是 Id | must cover；表示组织领袖，值为本世界 Character 或 Organization 的 id 或 null |
| `properties` | Piecewise<Property[]> | 不必需 | 用户从 Piecewise 组件编辑 | |

### 规则

- 生命周期自唯一 establishment 事件起，至 dissolution 事件止；无 dissolution 事件则直至永恒

### 示例

[Cg0_Wd0_Og0.json](Tineapp\data\organizations\Cg0_Wd0_Og0.json)

```json
{
    "id": "Cg0_Wd0_Og0",
    "name": "示例组织 1",
    "type": 0,
    "head": [
        { "value": "Cg0_Wd0_Ch0", "span": { "start": { "unit0": 1010 }, "type": 0, "end": { "unit0": 1013 } } },
        { "value": "Cg0_Wd0_Ch1", "span": { "start": { "unit0": 1013 }, "type": 0, "end": { "unit0": 1072 } } },
        { "value": null, "span": { "start": { "unit0": 1072 }, "type": 3 } }
    ],
    "properties": [
        { "value": [ { "key": "示例组织 1 的属性 1", "value": "Cg0_Wd0_Rg0" } ], "span": { "start": { "unit0": 1010 }, "type": 3 } }
    ]
}
```

## 类

### 路径

[OrganizationService](Tineapp\engine\main\services\OrganizationService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成