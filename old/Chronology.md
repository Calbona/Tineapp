# Chronology 历法

## 概要

- `Chronology` 描述一种历法

## 数据

### JSON 格式

`Chronology`: [id.json](Tineapp\data\registries\chronologies\id.json)

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `id` | Id | 必需 | 创建时自动生成，用户不能编辑 | |
| `chronology` | string | 不必需 | 用户从文字输入框编辑 | 在软件下不能重复 |
| `unit0` | Unit | 必需 | 用户从 Unit 组件编辑 | |
| `unit1` | Unit | 不必需 | 用户从 Unit 组件编辑 | |
| ... | | | | |

`Unit`

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `name` | string | 必需 | 用户从文字输入框编辑 | 在该 `Chronology` 下不能重复 |
| `initial` | INTEGER | 不必需 | 用户从数字输入框编辑 | |
| `priority1` | LeapRule | 不必需 | 用户从 LeapRule 组件编辑 | |
| `priority2` | LeapRule | 不必需 | 用户从 LeapRule 组件编辑 | |
| ... | | | | |
| `default` | INTEGER | 必需，最后一个 Unit 例外 | 用户从数字输入框编辑 | 最后一个 Unit 的 `default` 没有用途 |

`LeapRule`

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `condition` | INTEGER 或 INTEGER 数组或一个 JavaScript 表达式（可引用 `unit0`、`unit1`、... 直到当前层级的值） | 必需 | 用户从按钮选择，并从文字输入框编辑 | |
| `subunit` | INTEGER | 必需 | 用户从数字输入框编辑 | |

### 规则

- 默认历法硬编码在类里
- 一个 `Chronology` 一旦拥有下级对象，就只能查看或删除，而不能修改
- 删除 `Chronology` 会级联删除其全部下级对象，并提醒用户

### 示例

[Cg0.json](Tineapp\data\registries\chronologies\Cg0.json)

```json
{
    "id": "Cg0",
    "chronology": "默认历法",
    "unit0": {
        "initial": -999, "name": "year",
        "priority1": { "condition": 0, "subunit": 0 }, "default": 12
    },
    "unit1": {
        "name": "month",
        "priority1": { "condition": "(unit1 === 2) && ((unit0 % 400 === 0) || ((unit0 % 4 === 0) && (unit0 % 100 !== 0)))", "subunit": 29 },
        "priority2": { "condition": 2, "subunit": 28 },
        "priority3": { "condition": [4, 6, 9, 11], "subunit": 30 },
        "default": 31
    },
    "unit2": { "name": "day", "default": 24 },
    "unit3": { "initial": 0, "name": "hour" }
}
```

## 类

### 路径

[ChronologyService](Tineapp\engine\main\services\ChronologyService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成