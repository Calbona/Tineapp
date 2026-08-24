# Id Id

## 概要

- `Id` 是对象的唯一编号

## 数据

### JSON 格式

`Id`

- 是一个字符串，由若干个对象代号之间用 '_' 连接组成，顺序表明了对象的从属关系
- 对象代号是 对象类型代号 + 一个按实例创建顺序自动生成的整数
- 对象类型代号一般是 一个大写字母 + 一个小写字母
- 数据的文件名就是 Id
- 所有引用 Id 的地方都有点击跳转的链接

| 对象 | 对象类型代号 | 上级对象允许的类型 | 下级对象允许的类型 |
|---|---|---|---|
| `Character` | Ch | Wd | Dc, Ds, Er, Ev, Rl |
| `Chronology` | Cg | 无，`Chronology` 是最上级对象 | Dc, Wd |
| `Description` | Ds | Ch, Er, Ev, Og, Rm, Rg, Rl, Wd, Tg, Nt, Ne | 无，`Description` 是最下级对象 |
| `Document` | Dc | Ch, Er, Ev, Og, Rm, Rg, Rl, Wd, Tg, Nt, Ne | Dc |
| `Era` | Er | Ch, Og, Rm, Rg, Rl, Wd, Ne | Dc, Ds, Ev |
| `Event` | Ev | Ch, Er, Ev, Og, Rm, Rg, Rl, Wd, Ne | Dc, Ds, Ev |
| `Organization` | Og | Wd | Dc, Ds, Er, Ev, Rl |
| `Regime` | Rm | Wd | Dc, Ds, Er, Ev, Rl |
| `Region` | Rg | Wd | Dc, Ds, Er, Ev, Rl |
| `Relationship` | Rl | Ch, Og, Rm, Rg, Wd, Ne | Dc, Ds, Ev |
| `World` | Wd | Cg | Ch, Dc, Ds, Er, Ev, Og, Rm, Rg, Rl, Tg, Nt |
| `Tag` | Tg | Wd | Dc, Ds |
| `NewEntityTemplate` | Nt | Wd | Dc, Ds, Ne |
| `NewEntity` | Ne | Nt | Dc, Ds, Er, Ev, Rl |

### 规则

- `Id` 本质是物化路径
- 不会展示给用户，只会在软件内部处理
- `Id` 在创建对象时自动生成
- `Id` 创建后不可修改
- 删除父对象时，以 `<id>_` 为前缀的全部后代对象被级联删除

### 示例

[Cg0_Wd0.json](Tineapp\data\worlds\Cg0_Wd0.json) 的 "id" 值

```json
"Cg0_Wd0"
```

## 类

### 路径

[IdService](Tineapp\engine\main\services\IdService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成