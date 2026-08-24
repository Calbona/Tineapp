# TimePoint 时间点

## 概要

- `TimePoint` 描述一个具体的时刻

## 数据

### JSON 格式

`TimePoint`

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `unit0` | INTEGER | 必需 | 用户从数字输入框编辑，初始化默认为 initial | |
| `unit1` | INTEGER | 不必需 | 用户从按钮创建，初始化默认为 initial，并从数字输入框编辑，从按钮删除 | 历法可能存在的多级单位 |
| ... | | | | |

### 规则

- `TimePoint` 合法性由所属 Chronology 决定
- 键必须从 `unit0` 开始连续创建，不允许跳过中间键
- 缺失尾部单位时，在数据处理时视为历法中的 initial，显示时省略，不会显示用户没创建的数值

### 示例

[Cg0_Wd0_Ch1_Ev0.json](Tineapp\data\EVENTS\Cg0_Wd0_Ch1_Ev0.json) 的 "span" 的 "start" 值

```json
{
    "unit0": 998
}
```

[Cg0_Wd0_Ev0.json](Tineapp\data\EVENTS\Cg0_Wd0_Ev0.json) 的 "span" 的 "end" 值

```json
{
    "unit0": 1027
}
```

## 类

### 路径

[TimePointService](Tineapp\engine\main\services\TimePointService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成