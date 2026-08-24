# Territory 领土

## 概要

- `Territory` 表示所属 ENTITY 在世界地图上所占据的整个范围
- 通常在 `Piecewise` 中出现，表示领土变迁

## 数据

### JSON 格式

`Territory`

- 是一个数组，每一项是一个字符串 "x1, y1, x2, y2"，表示一个矩形区域的左上角与右下角区块的坐标
- 同一个数组内的矩形区域不重叠，所有矩形区域加在一起就是该 ENTITY 所占据的整个范围
- 用户从 Map 编辑组件可视化地编辑，涂抹一片区域，然后软件根据瓦片法把区域记录成要求的格式

### 规则

- 坐标必须为非负整数，且不超出所属 World 的 `mapscale`
- 矩形区域是闭区间，覆盖区块 x ∈ [x1, x2]、y ∈ [y1, y2]
- 同一世界、同一时间，同种 ENTITY 之间，占据的范围不得重叠，否则这两个或多个 ENTITY 都非法

### 示例

[Cg0_Wd0_Rm0.json](Tineapp\data\regimes\Cg0_Wd0_Rm0.json) 的 "territories" 的 `Piecewise` 中第 1 个元素的 "value" 值

```json
["200,150,649,300"]
```

## 类

### 路径

[TerritoryService](Tineapp\engine\main\services\TerritoryService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成