# CharacterType 角色类型

## 概要

- `CharacterType` 用于表示 `Character` 的类型

## 数据

### JSON 格式

`CharacterType` 是一个自然数

### 规则

- 由用户注册，存在 `data\registries\ENUMS\` 里，文件名是 CharacterType_值.json
- 所有语言都是必需的键

### 示例

[Cg0_Wd0_Ch1.json](Tineapp\data\characters\Cg0_Wd0_Ch1.json) 的 "type" 值

```json
0
```

[CharacterType_0.json](Tineapp\data\registries\ENUMS\CharacterType_0.json)

```json
{
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

[CharacterTypeService](Tineapp\engine\main\services\CharacterTypeService.ts)

### 方法

- 待完成