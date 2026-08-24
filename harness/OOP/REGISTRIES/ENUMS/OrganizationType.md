# OrganizationType 组织类型

## 概要

- `OrganizationType` 用于表示 `Organization` 的类型

## 数据

### JSON 格式

`OrganizationType` 是一个自然数

| 值 | de_DE | en_US | es_ES | fr_FR | ja_JP | ko_KR | ru_RU | zh_CN | zh_TW |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | | religion | | | | | | 宗教 | |
| 1 | | gang | | | | | | 团伙 | |
| 2 | | party | | | | | | 党派 | |
| 3 | | family | | | | | | 家族 | |
| 其他 | | | | | | | | | |

### 规则

- 4 个保留值硬编码在类里
- 其他由用户注册，存在 `data\registries\ENUMS\` 里，文件名是 OrganizationType_值.json
- 所有语言都是必需的键

### 示例

[Cg0_Wd0_Og0.json](Tineapp\data\organizations\Cg0_Wd0_Og0.json) 的 "type" 值

```json
0
```

[OrganizationType_4.json](Tineapp\data\registries\ENUMS\OrganizationType_4.json)

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

[OrganizationTypeService](Tineapp\engine\main\services\OrganizationTypeService.ts)

### 方法

- 待完成