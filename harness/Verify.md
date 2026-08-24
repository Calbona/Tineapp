# Verify 校验

> 本表仅为**索引**；所有校验规则的权威判定以 `OBJECTS\*` 各文档原文为准

## 校验流程

- **提交时拦截**：写入前对 "对象自身非法" 拦截并提示；只有对象自身非法才拦截
- **提交后全量校验**：每次成功提交后触发，检出间接非法 / 未知非法
- **修复队列**：非法对象清单按（深度升序, 同层 id 数字感知自然序）排列，逐对象引导修复

## 触发时机

- 启动
- 周期（可配置，见 `OBJECTS\CONFIGS\Config.md`）
- 每次成功提交
- 备份恢复之后

## 非法数据的判定

所有对象的校验规则以各 OBJECT 文档（harness\OBJECTS\）为准。下表列出全部规则及其**权威出处**（判定以 OBJECT 文档原文为准，本表仅作索引）：

| 规则 | 权威出处 |
|---|---|
| 实例不能重复 | 显然 |
| TimePoint 必须在所属 World 的 Chronology 下合法（chronologyjs 的 isLegal） | ELEMENTS\TimePoint.md、CHRONOLOGIES\Chronology.md |
| id 不可修改；不能从属 Tag | OBJECTS\OOP.md、各对象文档的 id 注释、ENTITIES\Tag.md |
| 同一对（所属, 目标）可有多条关系，但 span 重叠时 type 不能相同 | RELATIONSHIPS\Relationship.md |
| 必须字段，要齐全 | 各对象文档的 JSON 格式 |
| Piecewise 的 span 不得互相重叠 | ELEMENTS\Piecewise.md |
| 若 must cover，Piecewise 必须覆盖所属 Entity 生命周期 | 各对象文档键注释 |
| Span 必须在所属对象生命周期内（Relationship 为所属与目标生命周期交集内） | EVENTS\Event.md、EVENTS\Era.md、RELATIONSHIPS\Relationship.md |
| 实体必须存在（被 nationality / head / Tag 白名单黑名单 / 自定义实体 entity 属性等引用） | 各对象文档 |
| birth 等事件的唯一性（Character 恰好一个 birth；Organization / Regime 恰好一个 establishment；death / dissolution / destruction 至多一个） | ENTITIES\Character.md、Organization.md、Regime.md、ENUMS\EventType.md |
| 同一世界、同一时间、同一种实体的领土不得重叠 | ENTITIES\Regime.md、Region.md、ELEMENTS\Territory.md |
| 其他非法情况 | 以各 OBJECT 文档为准；若发现本表未列出的规则，在 `perfection\` 提案补充本表与权威出处后继续 |

## 提交时拦截

用户输入的数据可能不合法，例如某个历法下不合法的时间
在点击提交时拦截，不允许保存，并提示原因
判定以 "本次修改涉及的对象" 为准

**"对象自身非法"清单**（写入前拦截，对象自身必须合法）：
- 一个完全相同的实例已经存在
- 结构非法（id 格式、必须字段缺失、Piecewise 段结构、Span 结构等）
- TimePoint / Span 在所属世界历法下非法
- 引用的对象不存在或种类不符（nationality 必须为本世界政权、head 必须为角色或组织、目标必须是存在的非 Tag 实体、模板必须存在等）
- id 层级必须真实存在（所属对象不存在即非法）
- 枚举取值不在注册范围；子事件类型与父事件不一致
- Span 超出所属对象生命周期（Relationship 超出双方生命周期交集）
- 同世界同时同种实体领土重叠（写入对象自身参与重叠即非法）
- 关系多实例冲突（与同（所属方, 目标）的既有关系 span 重叠且类型相同）
- Tag 结算集合含对象与其下属对象

## 间接非法与未知非法

用户修改某对象导致关联对象非法，这类 "间接非法" 必须被检出
用户直接修改 data\ 文件夹产生的 "未知非法" 同样适用本流程

**"间接非法"清单**（操作自身合法，但使关联对象非法）：
- 实体事件计数越界（例如写入第二个 birth，非法标记在角色上）
- 缩短实体生命周期后，其既有事件 / 关系不再落在生命周期内（事件 / 关系对象本身合法，但生命周期约束被破坏）
- 删除实例
- 其他可能导致非法的情况
- 然后启动修复流程

### 持久化格式

非法状态持久化到 `data\logs\invalid.json`，JSON 结构固定为：

```json
{
  "invalid": true,
  "queue": [ "id", "id" ],
  "issues": [
    { "id": "id", "reasons": [ "reason", "reason" ] }
  ]
}
```

修复时按 `queue` 顺序逐对象引导修改；全部合法后 `invalid` 复位为 false