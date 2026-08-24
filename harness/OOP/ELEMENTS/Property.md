# Property 属性

## 概要

- `Property` 表示一组属性
- 通常以数组形式出现，`Property[]` 表示若干组属性

## 数据

### JSON 格式

`Property`

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `key` | string | 必需 | 用户从文字输入框编辑 | 表示这个属性的名称，在该 `Property[]` 下不能重复 |
| `value` | number 或普通 string 或 Id | 必需 | 用户从按钮选择，按钮上显示的是 number / string / Id，并相应从数字输入框编辑、从文字输入框编辑或从选择框选择，选择框里显示的是 ENTITY 的 "name" | 表示这个属性的值 |

### 规则

- `value` 为 Id 时有点击跳转的链接，引用的对象必须存在，否则 `Property[]` 所属的对象会被标记为非法，等待修复

### 示例

[Cg0_Wd0_Er0.json](Tineapp\data\EVENTS\Cg0_Wd0_Er0.json) 的 "Property[]" 值

```json
[{
    "key": "示例时期的属性 1",
    "value": "示例时期属性 1 的值"
}]
```

## 类

### 路径

[PropertyService](Tineapp\engine\main\services\PropertyService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成