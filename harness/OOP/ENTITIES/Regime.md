# Regime 政权

## 概要

- `Regime` 表示一个政权

## 数据

### JSON 格式

`Regime`: [id.json](Tineapp\data\regimes\id.json)

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `id` | Id | 必需 | 创建时自动生成，用户不能编辑 | |
| `name` | string | 必需 | 用户从文字输入框编辑 | |
| `type` | RegimeType | 不必需 | 用户从选择框选择，选择框里显示的是 RegimeType 在软件语言下的含义而不是数字 | |
| `head` | Piecewise<Id 或 null> | 必需 | 用户从 Piecewise 组件编辑，然后从选择框选择，选择框里显示的是本世界 Character 或 Organization 的 "name" 而不是 Id | must cover；表示政权元首，值为本世界 Character 或 Organization 的 id 或 null |
| `properties` | Piecewise<Property[]> | 不必需 | 用户从 Piecewise 组件编辑 | |
| `territories` | Piecewise<Territory> | 必需 | 用户从 Piecewise 组件编辑 | |

### 规则

- 同一世界、同一时间，政权之间领土不得重叠
- 生命周期自唯一 establishment 事件起，至 destruction 事件止；无 destruction 事件则直至永恒
- 在地图形式演示时，领土显示为涂色区域；在档案形式演示时，领土显示为该 `Regime` 占据了或部分占据了哪些地区，而不是显示占据了哪些区块

### 示例

[Cg0_Wd0_Rm0.json](Tineapp\data\regimes\Cg0_Wd0_Rm0.json)

```json
{
    "id": "Cg0_Wd0_Rm0",
    "name": "示例王国 1",
    "type": 3,
    "head": [
        { "value": "Cg0_Wd0_Ch0", "span": { "start": { "unit0": 995 }, "type": 0, "end": { "unit0": 1013 } } },
        { "value": "Cg0_Wd0_Ch1", "span": { "start": { "unit0": 1013 }, "type": 0, "end": { "unit0": 1072 } } },
        { "value": null, "span": { "start": { "unit0": 1072 }, "type": 3 } }
    ],
    "territories": [
        { "value": ["200,150,649,300"], "span": { "start": { "unit0": 995 }, "type": 0, "end": { "unit0": 1060 } } },
        { "value": ["150,150,999,400"], "span": { "start": { "unit0": 1060 }, "type": 3 } }
    ]
}
```

## 类

### 路径

[RegimeService](Tineapp\engine\main\services\RegimeService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成