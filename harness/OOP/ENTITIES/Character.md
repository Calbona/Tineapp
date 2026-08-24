# Character 角色

## 概要

- `Character` 表示一个角色

## 数据

### JSON 格式

`Character`: [id.json](Tineapp\data\characters\id.json)

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `id` | Id | 必需 | 创建时自动生成，用户不能编辑 | |
| `name` | string | 必需 | 用户从文字输入框编辑 | |
| `type` | CharacterType | 不必需 | 用户从选择框选择，选择框里显示的是 CharacterType 在软件语言下的含义而不是数字 | |
| `gender` | Gender | 必需 | 用户从按钮选择，按钮上显示的是 Gender 在软件语言下的含义而不是数字 | |
| `nationality` | Piecewise<string 或 null> | 必需 | 用户从 Piecewise 组件编辑，然后从选择框选择，选择框里显示的是 `Regime` 的 "name" | must cover |
| `properties` | Piecewise<Property[]> | 不必需 | 用户从 Piecewise 组件编辑 | |

### 规则

- 生命周期自唯一 birth 事件起，至 death 事件止；无 death 事件则直至永恒

### 示例

[Cg0_Wd0_Ch0.json](Tineapp\data\characters\Cg0_Wd0_Ch0.json)

```json
{
    "id": "Cg0_Wd0_Ch0",
    "name": "示例角色 1",
    "gender": 1,
    "nationality": [
        { "value": null, "span": { "start": { "unit0": 970 }, "type": 0, "end": { "unit0": 995 } } },
        { "value": "Cg0_Wd0_Rm0", "span": { "start": { "unit0": 995 }, "type": 0, "end": { "unit0": 1013 } } }
    ],
    "properties": [
        { "value": [ { "key": "示例角色 1 的属性 1", "value": "示例角色 1 属性 1 的值" } ], "span": { "start": { "unit0": 970 }, "type": 2 } }
    ]
}
```

## 类

### 路径

[CharacterService](Tineapp\engine\main\services\CharacterService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成