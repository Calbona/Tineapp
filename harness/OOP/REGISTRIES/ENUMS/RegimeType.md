# RegimeType 政权类型

## 概要

- `RegimeType` 用于表示 `Regime` 的类型

## 数据

### JSON 格式

`RegimeType` 是一个自然数

| 值 | de_DE | en_US | es_ES | fr_FR | ja_JP | ko_KR | ru_RU | zh_CN | zh_TW |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | | tribe | | | | | | 部落 | |
| 1 | | monarchy | | | | | | 君主国 | |
| 2 | | republic | | | | | | 共和国 | |
| 3 | | federation | | | | | | 联邦 | |
| 4 | | refugee government | | | | | | 流亡政府 | |
| 其他 | | | | | | | | | |

### 规则

- 5 个保留值硬编码在类里
- 其他由用户注册，存在 `data\registries\ENUMS\` 里，文件名是 RegimeType_值.json
- 所有语言都是必需的键

### 示例

[Cg0_Wd0_Rm0.json](Tineapp\data\regimes\Cg0_Wd0_Rm0.json) 的 "type" 值

```json
3
```

[RegimeType_5.json](Tineapp\data\registries\ENUMS\RegimeType_5.json)

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

[RegimeTypeService](Tineapp\engine\main\services\RegimeTypeService.ts)

### 方法

- 待完成