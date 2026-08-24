# Config 配置

## 概要

- `Config` 记录软件的设置内容

## 数据

### toml 格式

`Config`: [setting.toml](Tineapp\setting.toml)

| 表 | 功能 |
|---|---|
| `[view]` | 外观 |
| `[language]` | 语言 |
| `[verify]` | 校验 |
| `[palette]` | 调色盘 |

`[view]`

| 键 | 值 | 默认 | 备注 | 编辑方式 |
|---|---|---|
| `m` | 0 或 1 或 2 | 0 | 深色浅色模式，0 浅色，1 深色，2 跟随系统 | 用户从按钮选择 |

`[language]`

| 键 | 值 | 默认 | 备注 | 编辑方式 |
|---|---|---|
| `l` | 'de_DE' 或 'en_US' 或 'es_ES' 或 'fr_FR' 或 'ja_JP' 或 'ko_KR' 或 'ru_RU' 或 'zh_CN' 或 'zh_TW' | 'zh_CN' | 界面语言 | 用户从选择框选择 |

`[verify]`

| 键 | 值 | 默认 | 备注 | 编辑方式 |
|---|---|---|
| `T` | INTEGER 且 >= 30 | 60 | 全局校验周期 | 用户从数字输入框编辑 |

`[palette]`

| 键 | 值 | 默认 | 备注 | 编辑方式 |
|---|---|---|
| `ReNum` | INTEGER 且 >= 4 | 8 | 用多少种颜色去填地图上的地区 | 用户从数字输入框编辑 |
| `ReArray` | 颜色数组 | ['#ffb0b0','#ffd1b0','#ffeeb0','#ffffb0','#baffb0','#b0ffed','#b0ddff','#b0c4ff'] | 用于给地图上的地区填色 | 用户从颜色选择器选择 |
| `RgNum` | INTEGER 且 >= 4 | 8 | 用多少种颜色去填地图上的政权 | 用户从数字输入框编辑 |
| `RgArray` | 颜色数组 | ['#ffb0b0','#ffd1b0','#ffeeb0','#ffffb0','#baffb0','#b0ffed','#b0ddff','#b0c4ff'] | 用于给地图上的政权填色 | 用户从颜色选择器选择 |

### 规则

- `Config` 是单例
- 与具体的世界观内容无关
- 如果 `ReNum` 或 `RgNum` 增加到超过默认，超出的新增颜色默认初始化为 '#b9b0ff'

### 示例

[setting.toml](Tineapp\setting.toml)

```toml
[view]

# m is a number
# m refers to that the app will be light or dark mode, 0 for light, 1 for dark, 2 for follow system
# default m = 0

m = 1

[language]

# l is a string that refers to a language
# the overall app will be this language's version
# default l = 'zh_CN'

l = 'zh_CN'

[verify]

# T is an integer >= 30
# the time cycle that the app verify its overall data
# default T = 60

T = 45

[palette]

# ReNum is an integer >= 4
# how many colors to fill regions on the map
# default ReNum = 8

ReNum = 8

# ReArray is an array of colors
# these colors will be applied to regions on the map
# if ReNum increases beyond the default, new colors default to '#b9b0ff'
# default ReArray = ['#ffb0b0','#ffd1b0','#ffeeb0','#ffffb0','#baffb0','#b0ffed','#b0ddff','#b0c4ff']

ReArray = ['#ffb0b0','#ffd1b0','#ffeeb0','#ffffb0','#baffb0','#b0ffed','#b0ddff','#b0c4ff']

# RgNum is an integer >= 4
# how many colors to fill regimes on the map
# default RgNum = 8

RgNum = 8

# RgArray is an array of colors
# these colors will be applied to regimes on the map
# if RgNum increases beyond the default, new colors default to '#b9b0ff'
# default RgArray = ['#ffb0b0','#ffd1b0','#ffeeb0','#ffffb0','#baffb0','#b0ffed','#b0ddff','#b0c4ff']

RgArray = ['#ffb0b0','#ffd1b0','#ffeeb0','#ffffb0','#baffb0','#b0ffed','#b0ddff','#b0c4ff']
```

## 类

### 路径

[ConfigService](Tineapp\engine\main\services\ConfigService.ts)

### 方法

- defaultConfig() — 重置默认配置
- 待完成