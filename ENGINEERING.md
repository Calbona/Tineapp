# Tineapp — 工程设计文档

## 1. 项目概述

面向大型虚拟世界观创作者的数据记录与可视化桌面应用。

- **风格**：简约、现代
- **架构**：面向对象、模块化、数据驱动
- **数据存储**：Repository 模式 — 模型实例 ↔ JSON 文件
- **历法**：ChronologyJS 架空历法，时间输入字段由 units 定义动态生成
- **国际化**：`public/assets/lang/{lang}.json`

## 2. 技术栈

Electron + Vite + TypeScript + TimelineJS + D3.js + ChronologyJS

## 3. 架构分层

```
src/
├── main.ts              # 入口
├── core/                # 基础设施（Router + DOM 工具）
├── models/              # 领域模型（面向对象核心）
│   ├── TimePoint.ts     # 不可变值对象
│   ├── TimeSpan.ts      # 时间段
│   ├── Character.ts     # 角色聚合根
│   ├── CharacterEvent.ts / CharacterRelationship.ts
│   ├── State.ts         # 国家 + Territory + Region
│   ├── Organization.ts  # 组织
│   ├── WorldEvent.ts    # 世界事件
│   ├── Tag.ts           # 标签 + 嵌套解析
│   ├── MapTile.ts       # 地图地块
│   ├── World.ts         # 世界 + WorldConfig
│   ├── TypeRegistry.ts  # 类型注册表（单例）
│   └── CalendarRegistry.ts # 历法注册表（单例）
├── services/            # 业务逻辑层
│   ├── repository.ts    # 数据访问层
│   ├── event-utils.ts   # 事件收集 + 筛选
│   ├── data-manager.ts  # JSON 类型定义
│   ├── data-store.ts    # 旧版数据层（待废弃）
│   ├── config-loader.ts # 全局设置
│   ├── theme.ts / i18n.ts / logger.ts
├── views/               # UI 视图
│   ├── home/ editor/ browser/ settings/
└── types/
```

## 4. 数据文件结构

```
public/data/
├── worlds/          # 世界元数据
├── characters/      # 角色
├── events/          # 世界事件
├── states/          # 国家
├── organizations/   # 组织
├── regions/         # 地图地块名称
└── tags/            # 标签
```

每个目录含 `index.json`，实体文件按 `world` 字段关联。

## 5. 面向对象模型

所有模型类提供 `static fromJSON(json)` + `toJSON()`：

- **TimePoint** — `format()` `compare()` `sortKey` `fromRecord()`
- **TimeSpan** — `format()` `contains()` `fromRecord()`
- **Character** — `getName()` `getLifespan()` `isAliveAt()`
- **State** — `getName()` `getTerritoriesAt()`
- **Organization** — `getName()` `getMemberIds(allTags)`
- **Tag** — `resolveCharacterIds(allTags)`
- **MapTile** — `getName()` `rename()`

## 6. JSON 格式（v3）

### 世界
```json
{"id":0, "name":{"zh_CN":"示例世界"}, "chronology":"ExampleWorldChronology",
 "config":{"tagWhitelist":["ALL"], "defaultEndTimeStrategy":"instant", "mapWidth":101, "mapHeight":101}}
```

### 角色
```json
{"world":0, "id":0, "name":{"zh_CN":"张三"}, "properties":{"sexual":"女"},
 "events":[{"time":{"year":-100}, "type":"birth", "describe":"出生"}],
 "relationships":[{"target":1, "time":{"year":-92}, "type":"couple", "describe":"作为丈夫"}]}
```

### 标签
```json
{"world":0, "name":"女性", "characters":[1], "tags":["示例"]}
```

## 7. 路由

| Hash | 页面 |
|------|------|
| `#home` | 首页 |
| `#editor/world/new`, `#editor/world/:id` | 世界编辑器 |
| `#editor/event/new` | 事件编辑器 |
| `#editor/character/new` | 角色编辑器 |
| `#editor/state/new` | 国家编辑器 |
| `#editor/org/new` | 组织编辑器 |
| `#editor/map` | 地图编辑器 |
| `#database` | 数据库 |
| `#browser/chronicle` | 大事年表 |
| `#browser/timeline` | 时间轴 |
| `#browser/character` | 人物传记 |
| `#browser/world` | 组织概况 |
| `#browser/state` | 国家概况 |
| `#browser/event` | 事件查询 |
| `#browser/event-detail` | 事件明细 |
| `#browser/map` | 地图浏览 |
| `#browser/starmap` | 人物关系星图 |
| `#browser/log` | 运行日志 |
| `#browser/data` | 数据查看器 |
| `#settings` | 全局设置 |
| `#settings/types` | 类型管理 |
| `#settings/calendars` | 自定义历法 |
| `#settings/tags` | 标签管理 |

## 8. 关键设计决策

### Repository 模式
JSON 文件 ↔ readJSON/writeJSON ↔ Model.fromJSON/toJSON ↔ 视图

### 数据驱动的时间输入
`CalendarRegistry.getUnits(chronology)` → `timeInputs(record, units)` → 动态生成输入框

### 黑白名单共享
`event-utils.ts` 提供 `collectAllEvents()` + `filterCharacters()`，大事年表和时间轴共用

### 标签驱动组织成员
组织存标签名 → `Tag.resolveCharacterIds()` → 成员列表

### 草稿机制
新建世界时存入 sessionStorage，保存后持久化

## 9. 打包

```bash
npm run electron:build   # Windows 安装程序 → release/
```

需要 256×256+ PNG 图标 → `public/assets/icons/icon.png`

## 10. 命名约定

| 类别 | 风格 | 示例 |
|------|------|------|
| 类名 | PascalCase | `Character`, `TimePoint` |
| 方法 | camelCase | `getName()`, `fromJSON()` |
| 模型文件 | PascalCase.ts | `Character.ts` |
| 服务/视图 | kebab-case.ts | `repository.ts`, `character-view.ts` |
| CSS | 与 TS 同名 | `character-view.css` |
