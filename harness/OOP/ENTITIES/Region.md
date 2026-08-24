# Region 地区

## 概要

- `Region` 表示一个地区
- 没有生命周期，其事件 / 关系的 span 只需在 World 的历法范围内即可

## 数据

### JSON 格式

`Region`: [id.json](Tineapp\data\regions\id.json)

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `id` | Id | 必需 | 创建时自动生成，用户不能编辑 | |
| `name` | string | 必需 | 用户从文字输入框编辑 | |
| `properties` | Piecewise<Property[]> | 不必需 | 用户从 Piecewise 组件编辑 | |
| `territories` | Piecewise<Territory> | 必需 | 用户从 Map 编辑组件可视化地编辑 | |

### 规则

- 同一世界，地区之间领土不得重叠
- 在地图形式演示时，领土只显示边线，鼠标悬停时显示为半透明浮起区域
- 不考虑生命周期

### 示例

[Cg0_Wd0_Rg0.json](Tineapp\data\regions\Cg0_Wd0_Rg0.json)

```json
{
    "id": "Cg0_Wd0_Rg0",
    "name": "示例城镇 1",
    "territories": [ { "value": ["0,400,1000,599"], "span": { "start": { "unit0": -999 }, "type": 3 } } ]
}
```

## 类

### 路径

[RegionService](Tineapp\engine\main\services\RegionService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成