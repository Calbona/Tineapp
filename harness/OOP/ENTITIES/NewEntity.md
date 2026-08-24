# NewEntity 自定义实体 & NewEntityTemplate 自定义实体模板

## 概要

- `NewEntity` 表示一个自定义的新实体
- 结构由所属 `NewEntityTemplate` 决定
- `NewEntityTemplate` 表示一个自定义实体模板，赋予用户足够的创作自由度

## 数据

### JSON 格式

`NewEntityTemplate`: [id.json](Tineapp\data\registries\templates\id.json)

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `id` | Id | 必需 | 创建时自动生成，用户不能编辑 | |
| `name` | string | 必需 | 用户从文字输入框编辑 | 在软件下不能重复 |
| `properties` | TemplateProperty[] | 必需 | 用户从按钮创建，并从 TemplateProperty 组件编辑 | 一旦 `NewEntityTemplate` 拥有下级对象，就不能修改 |

`TemplateProperty`

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `key` | string | 必需 | 用户从文字输入框编辑 | 在该 `NewEntityTemplate` 下不能重复 |
| `value` | 'number' 或 'string' 或 'id' 或 'span' 或 'territory' | 必需 | 用户从按钮选择 | 用于声明该键在 NewEntity 属性中的值类型 |

`NewEntity`: [id.json](Tineapp\data\news\id.json)

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `id` | Id | 必需 | 创建时自动生成，用户不能编辑 | |
| `name` | string | 必需 | 用户从文字输入框编辑 | |
| `properties` | Piecewise<Property[]> | 必需 | 用户从 Piecewise 组件编辑 | 由所属 `NewEntityTemplate` 决定，可编辑之处与普通 Property 不同 |

### 规则

- 删除 `NewEntityTemplate` 会级联删除其全部 `NewEntity`
- 不考虑生命周期

### 示例

[Cg0_Wd0_Nt0.json](Tineapp\data\registries\templates\Cg0_Wd0_Nt0.json)

```json
{
    "id": "Cg0_Wd0_Nt0",
    "name": "宝物",
    "properties": [
        { "key": "材质", "value": "string" },
        { "key": "持有者", "value": "id" }
    ]
}
```

[Cg0_Wd0_Nt0_Ne0.json](Tineapp\data\news\Cg0_Wd0_Nt0_Ne0.json)

```json
{
    "id": "Cg0_Wd0_Nt0_Ne0",
    "name": "示例宝物 1",
    "properties": [
        { "value": [ { "key": "材质", "value": "示例材质" }, { "key": "持有者", "value": "Cg0_Wd0_Ch0" } ],
          "span": { "start": { "unit0": -999 }, "type": 3 } }
    ]
}
```

## 类

### 路径

[NewEntityTemplateService](Tineapp\engine\main\services\NewEntityTemplateService.ts)

[NewEntityService](Tineapp\engine\main\services\NewEntityService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成