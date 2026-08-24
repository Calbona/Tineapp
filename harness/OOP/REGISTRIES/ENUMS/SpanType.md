# SpanType 时间段类型

## 概要

- `SpanType` 用于表示 `Span` 的类型

## 数据

### JSON 格式

`SpanType` 只能是这四种整数之一

| 值 | de_DE | en_US | es_ES | fr_FR | ja_JP | ko_KR | ru_RU | zh_CN | zh_TW | 含义 |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | | default | | | | | | 默认 | | 有起止时间，必须有 `end`，且 `end` 严格在 `start` 之后 |
| 1 | | instant | | | | | | 瞬时 | | 起止时间相同，时间段退化为一个点，不允许有 `end` |
| 2 | | lifelong | | | | | | 终身 | | 时间段随上级对象生命周期结束，不允许有 `end` |
| 3 | | eternal | | | | | | 永恒 | | 时间段永不结束，不允许有 `end` |

### 规则

- 固定四个实例，硬编码在类里，不可扩展、不持久化
- 无注册页

### 示例

[Cg0_Wd0_Ch0_Ev0.json](Tineapp\data\EVENTS\Cg0_Wd0_Ch0_Ev0.json) 的 "span" 的 "type" 值

```json
1
```

## 类

### 路径

[SpanTypeService](Tineapp\engine\main\services\SpanTypeService.ts)

### 方法

- 待完成