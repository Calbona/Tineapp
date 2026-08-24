# Gender 性别

## 概要

- `Gender` 用于表示 `Character` 的性别

## 数据

### JSON 格式

`Gender` 只能是这四种整数之一

| 值 | de_DE | en_US | es_ES | fr_FR | ja_JP | ko_KR | ru_RU | zh_CN | zh_TW |
|---|---|---|---|---|---|---|---|---|---|
| 0 | | female | | | | | | 女 | |
| 1 | | male | | | | | | 男 | |
| 2 | | other | | | | | | 其他 | |
| 3 | | unknown | | | | | | 未知 | |

### 规则

- 固定四个实例，硬编码在类里，不可扩展、不持久化
- 无注册页

### 示例

[Cg0_Wd0_Ch0.json](Tineapp\data\characters\Cg0_Wd0_Ch0.json) 的 "gender" 值

```json
1
```

## 类

### 路径

[GenderService](Tineapp\engine\main\services\GenderService.ts)

### 方法

- 待完成