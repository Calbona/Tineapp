# Tag 标签

## 概要

- `Tag` 表示一个标签

## 数据

### JSON 格式

`Tag`: [id.json](Tineapp\data\tags\id.json)

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `id` | Id | 必需 | 创建时自动生成，用户不能编辑 | |
| `name` | string | 必需 | 用户从文字输入框编辑 | |
| `white` | Id[] | 必需 | 用户从按钮添加，并从选择框选择，或从列表删除，选择框和列表里显示的是 "name" 而不是 Id | 白名单，只能添加 ENTITY / EVENT / RELATIONSHIP |
| `black` | Id[] | 必需 | 用户从按钮添加，并从选择框选择，或从列表删除，选择框和列表里显示的是 "name" 而不是 Id | 黑名单，只能添加 ENTITY / EVENT / RELATIONSHIP |

### 规则

- `Tag` 是特殊的 ENTITY，用于演示 EVENT，`Tag` 的上级是 `World`
- `Tag` 是由若干 ENTITY / EVENT / RELATIONSHIP 内所有 event 和 era 组成的集合
- 结算时先以白名单为全集，再剔除黑名单命中的对象，最后得到的复合对象的所有直接下属的 EVENT 就是会被演示的内容
- 全部结算完成后，EVENT 不能出现重复，常见的重复例如同时含有一个对象和它的上级对象，或者其他重复原因
- 白黑名单的 id 必须指向存在的对象，否则非法

### 示例

[Cg0_Wd0_Tg0.json](Tineapp\data\tags\Cg0_Wd0_Tg0.json)

```json
{
    "id": "Cg0_Wd0_Tg0",
    "name": "示例实体结算聚合",
    "white": [ "Cg0_Wd0_Ch0", "Cg0_Wd0_Ch1" ],
    "black": []
}
```

## 类

### 路径

[TagService](Tineapp\engine\main\services\TagService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成