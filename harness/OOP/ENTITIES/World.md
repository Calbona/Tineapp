# World 世界

## 概要

- `World` 表示一个世界

## 数据

### JSON 格式

`World`: [id.json](Tineapp\data\worlds\id.json)

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `id` | Id | 必需 | 创建时自动生成，用户不能编辑 | |
| `name` | string | 必需 | 用户从文字输入框编辑 | 在软件下不能重复 |
| `properties` | Property[] | 不必需 | 用户从 Property 组件编辑 | |
| `mapscale` | [number, number] | 必需 | 用户从 2 个数字输入框编辑 | 地图尺寸 [宽, 高] (单位: 区块)，创建后不可修改 |

### 规则

- 生命周期自历法初始时间起直至永恒
- 删除 `World` 会级联删除所有下级

### 示例

[Cg0_Wd0.json](Tineapp\data\worlds\Cg0_Wd0.json)

```json
{
    "id": "Cg0_Wd0",
    "name": "示例世界 1",
    "properties": [ { "key": "示例世界 1 的属性 1", "value": 100 } ],
    "mapscale": [1000, 600]
}
```

## 类

### 路径

[WorldService](Tineapp\engine\main\services\WorldService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成