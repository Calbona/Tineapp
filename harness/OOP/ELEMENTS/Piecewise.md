# Piecewise 分段值

## 概要

- `Piecewise` 表示一种特殊的键值对的值：对同一个键，值在不同时间下可能不同，在某些时间下，值甚至不存在

## 数据

### JSON 格式

`Piecewise`

是若干个 `Pw` 对象的数组，用户从 Piecewise 组件编辑

`Pw`

| 键 | 值的类型 | 是否必需 | 编辑方式 | 备注 |
|---|---|---|---|---|
| `value` | unknown，根据不同的键，值的类型可能不同，在键处会说明值的类型 | 必需 | 用户从对应方式编辑 | |
| `span` | Span | 必需 | 用户从 Span 组件编辑 | 在该 `Piecewise` 下，所有 `Pw` 的 `span` 不能有交集；有的 Piecewise 被要求必须覆盖所属 ENTITY 的整个生命周期，在键处会说明 must cover |

### 示例

[Cg0_Wd0_Ch0.json](Tineapp\data\characters\Cg0_Wd0_Ch0.json) 的 "nationality" 值

```json
[{
    "value": null,
    "span": { "start": { "unit0": 970 }, "type": 0, "end": { "unit0": 995 } }
},{
    "value": "Cg0_Wd0_Rm0",
    "span": { "start": { "unit0": 995 }, "type": 0, "end": { "unit0": 1013 } }
}]
```

## 类

### 路径

[PiecewiseService](Tineapp\engine\main\services\PiecewiseService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成