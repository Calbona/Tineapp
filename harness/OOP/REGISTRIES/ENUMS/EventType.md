# EventType 事件类型

## 概要

- `EventType` 用于表示 `Event` 的类型

## 数据

### JSON 格式

`EventType` 是一个自然数

| 值 | de_DE | en_US | es_ES | fr_FR | ja_JP | ko_KR | ru_RU | zh_CN | zh_TW | 允许该事件所属的对象 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | | birth | | | | | | 出生 | | Ch |
| 1 | | death | | | | | | 死亡 | | Ch |
| 2 | | marriage | | | | | | 婚姻 | | Ch |
| 3 | | establishment | | | | | | 建立 | | Og, Rm |
| 4 | | dissolution | | | | | | 解散 | | Og |
| 5 | | destruction | | | | | | 灭亡 | | Rm |
| 6 | | war | | | | | | 战争 | | Wd |
| 其他 | | | | | | | | | | |

### 规则

- 7 个保留值硬编码在类里
- 其他由用户注册，存在 `data\registries\ENUMS\` 里，文件名是 EventType_值.json
- 注册时需要明确该 `EventType` 能赋给哪些种 ENTITY 的 event，`allow` 是必需的键
- 所有语言都是必需的键

### 示例

[Cg0_Wd0_Ch0_Ev0.json](Tineapp\data\EVENTS\Cg0_Wd0_Ch0_Ev0.json) 的 "type" 值

```json
0
```

[EventType_7.json](Tineapp\data\registries\ENUMS\EventType_7.json)

```json
{
    "allow": [ "Og", "Wd" ],
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

[EventTypeService](Tineapp\engine\main\services\EventTypeService.ts)

### 方法

- 待完成