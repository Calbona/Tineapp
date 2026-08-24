# RelationshipType 关系类型

## 概要

- `RelationshipType` 用于表示 `Relationship` 的类型

## 数据

### JSON 格式

`RelationshipType` 是一个自然数

| 值 | de_DE | en_US | es_ES | fr_FR | ja_JP | ko_KR | ru_RU | zh_CN | zh_TW | 允许该关系所属与目标 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | | parent | | | | | | 父母 | | Ch=>Ch |
| 1 | | child | | | | | | 孩子 | | Ch=>Ch |
| 2 | | spouse | | | | | | 配偶 | | Ch=>Ch |
| 3 | | lover | | | | | | 恋人 | | Ch=>Ch |
| 4 | | friend | | | | | | 朋友 | | Ch=>Ch |
| 5 | | ally | | | | | | 盟友 | | Rm=>Rm |
| 其他 | | | | | | | | | | |

### 规则

- 6 个保留值硬编码在类里
- 其他由用户注册，存在 `data\registries\ENUMS\` 里，文件名是 RelationshipType_值.json
- 注册时需要明确该 `RelationshipType` 能赋给哪些种 relationship，`allow` 是必需的键
- 所有语言都是必需的键

### 示例

[Cg0_Wd0_Ch0_Rl0.json](Tineapp\data\relationships\Cg0_Wd0_Ch0_Rl0.json) 的 "type" 值

```json
0
```

[RelationshipType_6.json](Tineapp\data\registries\ENUMS\RelationshipType_6.json)

```json
{
    "allow": [ "Og=>Rm", "Ch=>Rg" ],
    "de_DE": "beispiel",
    "en_US": "example",
    "es_ES": "ejemplo",
    "fr_FR": "échantillon",
    "ja_JP": "例",
    "ko_KR": "예시",
    "ru_RU": "Пример",
    "zh_CN": "示例",
    "zh_TW": "示例"
}
```

## 类

### 路径

[RelationshipTypeService](Tineapp\engine\main\services\RelationshipTypeService.ts)

### 方法

- 待完成