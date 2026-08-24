# 执行计划：engine 实现（agent 拆分 / 顺序 / 上下文 / 提示词）

> 依据：`harness\Modularization.md`（模块划分）、`harness\Structure.md`（目录）、`harness\Protocol.md`（阅读序列与产出纪律）、`harness\Navigation.md`（页面清单）。
> 本计划为**纯规划**，不写代码。所有任务遵守 Protocol §2 阅读分层与 §3 任务必读序列、§4 产出自检、§5 冲突仲裁（冲突/缺口 → perfection 提案并停）。

## 一、依赖链（先做什么后做什么的根据）

```
T0 脚手架 ─► T1 types.ts ─► T2 BaseService ─┬► T3 服务批(并行 S1–S6) ─► T4 校验引擎
                                            │                           └──────► T5+T6 桥接/preload ─► T7 main
                                            └── 依赖关系：每个箭头 = 前一项必须完成
T8 渲染骨架(含 ELEMENT 组件) ─► T9 页面批(并行 R1–R7) ─► T10 集成验收
```

- **顺序强制**：T0→T1→T2→T3→(T4 ∥ T5)→T6→T7；以及 T0→T1→T8→T9→T10（T8 可在 T4/T5 阶段并行推进，只依赖 T1 + preload API 形状）。
- **同上下文**：见 §三。**并行**：见 §四。

## 二、任务清单（按项）

### T0 — 工程脚手架
- **内容**：补 `package.json` 依赖与构建链（electron / react / react-dom / typescript / 相应 @types / 构建工具），写 tsconfig，搭 Electron 主/预加载/渲染三进程目录与 dev/build 脚本。
- **依赖**：无（第一件）
- **上下文**：单 agent（一套配置必须自洽）
- **提示词**：
  ```
  为 Tineapp 搭建 Electron + React + TypeScript 工程脚手架：
  1) 读 harness\Modularization.md、harness\Structure.md、package.json。
  2) 补充依赖：electron、react、react-dom、typescript 及配套类型；构建工具**已定 electron-vite**。保留已有 archiver/chronologyjs/extract-zip/timelinejs。
  3) 配置三进程入口：engine\main\index.ts（主）、engine\preload\index.ts（预加载）、engine\renderer\ 渲染进程 HTML/入口。
  4) tsconfig 全仓统一（engine\types.ts 为共享类型）。
  5) 只新增/修改构建相关文件与空入口，不实现业务逻辑。
  完成后报告：依赖清单、目录拓扑、启动命令。
  ```

### T1 — 类型层 `engine\types.ts`
- **内容**：全部对象类型，与 `OBJECTS\*` 文档 JSON 格式**一一对应**（Chronology/World/Character/Organization/Regime/Region/NewEntityTemplate/NewEntity/Tag/Era/Event/Relationship/Document/Description/Config/可注册枚举 + ELEMENT：Id/TimePoint/Span/Piecewise/Property/Territory + Log/invalid.json）。
- **依赖**：T0
- **上下文**：单 agent（一个文件，全类型互恰，其他所有模块 import 它）
- **L1 必读**（Protocol §3 类型/契约）：`OBJECTS\OOP.md` → `OBJECTS\ELEMENTS\Id.md` → 相关 OBJECT 文档 → `Modularization.md`
- **提示词**：
  ```
  编写 engine\types.ts（替换空文件）：
  1) L1 必读：OBJECTS\OOP.md、OBJECTS\ELEMENTS\Id.md、Modularization.md；再用 Grep 逐个读 OBJECTS 各文档的"JSON 格式"节。
  2) 用 data\ 全部样例 JSON 作为校验基准：每个类型都能把对应样例"编译通过"（写一个只读的 `tsc --noEmit` 探针或用 `satisfies` 断言样例结构）。
  3) name 一律 string；ELEMENT 类型为组件数据，不设独立路由类型。
  4) 命名遵循"对象名 + JSON 同名键"；枚举用联合类型或字符串枚举。
  只改 engine\types.ts 及一个只读探针脚本，不触碰其他路径。
  完成后报告：类型清单、样例校验结果、任何"样例与文档不一致"（若发现→按 §5 上报，不自行脑补）。
  ```

### T2 — 数据服务基类 `BaseService`
- **内容**：id 物化路径编解码（对象代号↔页面代号、祖先链、`scope` 推导、级联删除前缀）、数据文件定位（Structure.md 目录表）、读写封装、引用即链接所需查询、注册表/枚举通用处理、提交时拦截的公共骨架。
- **依赖**：T1
- **上下文**：单 agent（服务契约根基）
- **L1 必读**：`Modularization.md` → 对应 OBJECT 文档 → `OBJECTS\OOP.md` → `Verify.md` → `IPC.md`
- **提示词**：
  ```
  编写 engine\main\services\BaseService.ts：
  1) L1 必读：Modularization.md、OBJECTS\OOP.md、OBJECTS\ELEMENTS\Id.md、Verify.md、IPC.md。
  2) 实现：id 物化路径编解码（Cg0_Wd0_Ch0 → 类型+祖先链+scope）、文件定位（data\ 各目录）、读写与目录级联删除（<id>_ 前缀）、注册表枚举通用存取。
  3) 参考 data\ 样例路径结构（Structure.md 目录表）对照实现。
  4) 校验能力留接口，各对象 Service 覆盖；写方法统一走"提交拦截"入口。
  同步在 IPC.md 登记 BaseService 暴露的方法（契约）。只改 services\BaseService.ts 与 IPC.md。
  完成后报告：方法清单、id 编解码示例。
  ```

### T3 — 数据服务批（并行 S1–S6，每分组一个 agent）
- **依赖**：T2（BaseService 已定型）
- **上下文**：**每个分组一个独立上下文**；S1–S6 文件集互不重叠，**可并行**
- **分组与目标文件**：
  - **S1** 历法/世界/配置/枚举：`ChronologyService.ts`、`WorldService.ts`、`ConfigService.ts`、枚举注册表服务
  - **S2** 实体组：`CharacterService.ts`、`OrganizationService.ts`、`RegimeService.ts`、`RegionService.ts`
  - **S3** 模板/自定义实体/标签：`NewEntityTemplateService.ts`、`NewEntityService.ts`、`TagService.ts`（含 Tag 白黑名单结算聚合）
  - **S4** 时期/事件/关系：`EraService.ts`、`EventService.ts`、`RelationshipService.ts`（含子事件层级、关系 span 冲突、双方生命周期交集）
  - **S5** 文档：`DocumentService.ts`(.docx 解包/写入，用 extract-zip)、`DescriptionService.ts`(.md)
  - **S6** 备份恢复：`TransferService.ts`（archiver 压缩到 backups\、 yauzl 和 '带路径 + 符号链接校验的解压函数' 恢复）
- **每分组 L1 必读**：`Modularization.md` → 对应 OBJECT 文档 → `OBJECTS\OOP.md` → `Verify.md` → `IPC.md`
- **分组提示词**（以 S2 为例，其余同构替换分组与对象）：
  ```
  编写 engine\main\services\ 下 4 个服务类：CharacterService、OrganizationService、RegimeService、RegionService。
  1) L1 必读：Modularization.md、OBJECTS\OOP.md、Verify.md、IPC.md；逐个读 OBJECTS\ENTITIES\Character.md、Organization.md、Regime.md、Region.md 的"JSON 格式/规则/示例"节，并对照 data\ 样例。
  2) 每个 Service 继承 BaseService，实现：读、写（提交时拦截，按该对象文档"必须字段/枚举/引用存在/Piecewise must cover/Span 在生命周期内"校验）、删（级联）、scope 下级列出。
  3) name 为 string；编辑方式语义来自文档（组件内嵌，服务不管 UI）。
  4) 同步在 IPC.md 登记各 Service 方法。
  只改 services\ 本组文件与 IPC.md。完成后报告：每 Service 方法清单、实现的校验项、样例读通结果。
  ```

### T4 — 全量校验引擎（跨对象间接非法）
- **内容**：启动/周期(Config.verify.T)/每次提交/备份恢复后触发；检出"对象自身非法"外的**间接非法**（实体事件计数越界、生命周期被破坏、删除实例）；写 `data\logs\invalid.json`（固定结构）；修复队列按（深度升序，同层 id 数字感知自然序）排列；全部合法后 `invalid` 复位。
- **依赖**：T3（需要各 Service 的校验钩子）
- **上下文**：单 agent（跨对象交叉逻辑）
- **L1 必读**：`Verify.md` → 涉及对象的 OBJECT 文档 → `Navigation.md`（修复模式 §5）→ `IPC.md`
- **提示词**：
  ```
  实现 engine\main\services\ValidationService.ts 全量校验引擎：
  1) L1 必读：Verify.md、Navigation.md §5 修复模式；Grep 各 OBJECT 文档的校验出处。
  2) 触发时机：启动 / Config.verify.T 周期 / 每次成功提交后 / 备份恢复后。
  3) 检出"间接非法"清单（Verify.md），产出 data\logs\invalid.json（invalid/queue/issues 固定结构）；修复队列排序规则照 Navigation §5。
  4) 提供"对象自身非法"的提交拦截复用（调用各 Service 校验）。
  同步 IPC.md 登记校验方法。只改 services\ 与 IPC.md。完成后报告：检出的非法种类、invalid.json 样例、排序结果。
  ```

### T5 + T6 — 桥接 + 预加载（**同一上下文**）
- **内容**：`engine\main\ipc\`（channels.ts 通知主题 / registry.ts 服务注册表 / index.ts 入口）+ `engine\preload\index.ts`（注入 `window.tineapp`，转发渲染进程调用/通知）。
- **依赖**：T3、T4 的服务存在
- **上下文**：**T5+T6 必须同一 agent**——通道常量与 `window.tineapp` API 形状必须完全一致，分开做必然漂移
- **L1 必读**：`Modularization.md` → `IPC.md` → 涉及 Service
- **提示词**：
  ```
  实现桥接层与预加载（同一上下文中完成，保证契约一致）：
  1) engine\main\ipc\channels.ts（通知主题）、registry.ts（服务注册表：把 services\ 已实现服务统一注册）、index.ts（接收预加载转发，调用服务，回传结果）。
  2) engine\preload\index.ts：向渲染进程注入 window.tineapp，类型化暴露与 IPC 完全一致的 API；主进程通知→转发渲染进程。
  3) L1 必读：Modularization.md、IPC.md；对照 services\ 现有方法与 IPC.md 登记。
  4) 把 IPC.md 从占位填成完整契约（已注册服务清单 + 通知主题）。
  只改 main\ipc\、preload\、IPC.md。完成后报告：通道清单、window.tineapp API 清单。
  ```

### T7 — 主进程入口 `engine\main\index.ts`
- **内容**：`initModules()`（初始化 services/ipc/preload 依赖）、`createMainWindow()`（BrowserWindow，加载 renderer）、生命周期管理。
- **依赖**：T5/T6
- **上下文**：单 agent
- **提示词**：
  ```
  补全 engine\main\index.ts（现为空）：initModules()（装配 services、ipc、校验引擎，读 setting.toml）、createMainWindow()（含深色模式 m=1、语言 l）、应用生命周期。读 Modularization.md"主进程启动模块"节。只改 engine\main\index.ts。
  ```

### T8 — 渲染骨架 + 共享组件（含 ELEMENT 编辑组件）
- **内容**：React 入口、路由表（Navigation §3 全部页面代号→组件）、返回栈（页内选择不入栈 / 跳转入栈 / 栈空按 §7 推导）、`id` 自解码与"引用即链接"、全局布局、语言切换、**ELEMENT 编辑组件全套**（Piecewise/Property/Span/TimePoint/Territory/Unit/LeapRule/TemplateProperty——按 §3.17 内嵌，无独立路由）。
- **依赖**：T1 + T6 的 `window.tineapp` API 形状
- **上下文**：单 agent（共享组件必须一次定型，页面批依赖它）
- **L1 必读**：`Navigation.md` → `STYLES\Global.md` + `STYLES\Edit.md` → `Modularization.md`
- **提示词**：
  ```
  搭建 engine\renderer\ 骨架与共享组件：
  1) L1 必读：Navigation.md 全篇、STYLES\Global.md、STYLES\Edit.md、Modularization.md。
  2) 路由表：Navigation §3 每个页面代号 → 懒加载组件占位；id 自解码工具、返回栈（§6 规则 + §7 栈空推导表）、引用即链接组件。
  3) ELEMENT 编辑组件（§3.17）全套：Piecewise（增删 Pw 段/Span/value）、Property、Span、TimePoint、Territory（Map 涂抹+瓦片法）、Unit、LeapRule、TemplateProperty。用 chronologyjs 校验时间合法性。
  4) 样式按 Global.md 基调（CSS 仅参考，重构实现）；适配深色（setting view.m）。
  只改 engine\renderer\。完成后报告：路由表清单、共享组件清单、ELEMENT 组件清单。
  ```

### T9 — 页面批（并行 R1–R7，每分组一个 agent）
- **依赖**：T8（骨架/共享组件已定型）
- **上下文**：**每个分组一个独立上下文**；R1–R7 文件集互不重叠，**可并行**
- **分组与页面**（依据 Navigation §3）：
  - **R1** 系统页+枚举页：`home` `search` `setting` `log` `enum-home` + `ct/ot/rmt/et/rlt` 的 list-edit/new/edit
  - **R2** 历法组：`cg-list-edit` `cg-new` `cg-edit` `cg-list-view` `cg-view` `cg-calendar`（万年历）
  - **R3** 世界组：`wd-list-edit` `wd-new` `wd-edit` `wd-list-view` `wd-view` `wd-home-edit` `wd-home-view`
  - **R4** 实体组：`ch/og/rm/rg` 各 list-edit/list-view/new/edit/view（实例编辑页用 ELEMENT 组件）
  - **R5** 模板/自定义实体/标签组：`nt`、`ne`、`tg` 各页
  - **R6** 时期/事件/关系/文档组：`er`、`ev`、`dc` 各页 + 关系组**仅编辑页** `rl-list-edit`/`rl-new`/`rl-edit`（**已裁决：关系无查看页，查看走关系星图 `star`，见 R7**）
  - **R7** 演示页：`table`（大事年表，按开始时间排序+时期侧栏高度）、`timeline`（TimelineJS）、`star`（关系星图 = **关系的唯一查看入口**，以实体为中心展示关系名+元信息+描述文档+文档列表）、`mapRm`/`mapRg`（瓦片着色，观察者时间切换重算）
- **每分组 L1 必读**：`Navigation.md` 对应小节 → `STYLES\<页面组>.md` → 涉及的 OBJECT 文档 → `Modularization.md`；页面样式含该组 CSS（仅参考，重构）
- **分组提示词**（以 R4 实体组为例，其余同构替换页面与对象）：
  ```
  实现 engine\renderer\ 下的实体组页面：ch/og/rm/rg 各 list-edit、list-view、new、edit、view。
  1) L1 必读：Navigation.md §3.5-3.8 与 §7 返回规则、STYLES\Edit.md、STYLES\View.md；逐个读 ENTITIES\Character.md 等对应 OBJECT 文档；对照 data\ 样例。
  2) 复用 T8 共享组件（ELEMENT 编辑组件、id 链接、返回栈、选择框）；页面行为按 Navigation"功能/可以跳转去"列；样式按 STYLES 该组分区（重构，不照抄）。
  3) 引用即链接：任何 id 渲染为链接跳 `<obj>-view?id=`。
  只改 engine\renderer\ 对应页面文件。完成后报告：页面清单、跳转实现、复用组件清单。
  ```

### T10 — 集成验收
- **内容**：启动应用走通：home→各页跳转、用 data\ 样例做一次 CRUD、提交触发全量校验、非法→修复队列→修复→复位、备份/恢复、万年历/时间轴/地图渲染、深色模式。
- **依赖**：T7 + T9 + 全部
- **上下文**：单 agent（端到端冒烟）
- **提示词**：
  ```
  对 Tineapp 做端到端冒烟：
  1) 启动应用（T0 脚本），逐项走 Navigation §3 页面清单：每页可达、入参正确、跳转正确。
  2) 用 data\ 样例：读取→修改→提交，确认提交拦截与全量校验触发；构造一次非法，确认 invalid.json、修复队列顺序、修复后复位。
  3) 验证备份/恢复（TransferService）、万年历/时间轴/星图/地图渲染、深色模式。
  4) 发现问题：是文档矛盾→perfection 提案并停；是代码缺陷→修复并回归。
  报告：通过清单、失败项与处理。
  ```

## 三、同一上下文的判定（哪几个必须一起做）

| 必须同一上下文 | 原因 |
|---|---|
| T1 types.ts | 一个文件、全类型互恰；所有模块 import |
| T2 BaseService | 服务契约根基，T3 全部继承 |
| T4 校验引擎 | 跨对象间接非法，交叉逻辑 |
| T5 + T6 桥接 + 预加载 | `window.tineapp` API 与 IPC 通道必须逐字一致 |
| T8 渲染骨架 + ELEMENT 组件 | 共享组件一次定型，R1–R7 全部复用 |
| 每个 T3 分组（S1–S6）内部 | 组内对象共享历法/生命周期/引用规则 |
| 每个 T9 分组（R1–R7）内部 | 组内页面共享对象文档与 STYLES 组 |

## 四、可并行的判定（哪几个可以同时）

| 并行批次 | 组成 | 前置 |
|---|---|---|
| 批 A | T3 的 S1–S6（6 个 agent） | T2 完成 |
| 批 B | T4（校验引擎）∥ T5+T6（桥接） | T3 完成 |
| 批 C | T7（main 入口）∥ T8（渲染骨架） | T5/T6、T1 完成 |
| 批 D | T9 的 R1–R7（7 个 agent） | T8 完成 |
| 尾批 | T10 集成验收 | 全部完成 |

> 提示：T3 批 A 与 T9 批 D 每批 agent 较多，若用 Workflow 编排，每批一次 fan-out；批内各自独立无屏障。

## 五、横切纪律（每任务提示词末尾都应附带）

1. **对照样例**：实现前必看 `data\` 对应样例，产出后核对（Protocol L3）。
2. **同步 IPC.md**：新增/修改 main 服务时登记 IPC.md（Protocol §4 硬性项）。
3. **L2 用 Grep**：只读任务必读序列的文档，其余 Grep 定位，禁止整读未列文档（Protocol §6）。
4. **冲突/缺口上报**：文档自相矛盾、`perfection\` 同名提案并**停**（Protocol §4/§5）；不得自行脑补。

## 六、已裁决记录（2026-08-21）

1. **T0 构建工具** → **electron-vite**。
2. **关系查看** → 关系只有编辑页（`rl-list-edit`/`rl-new`/`rl-edit`）；关系的查看在**关系星图 `star`**。对应修正 `harness\Navigation.md` 的 `ne-view` 行与 §4.5 mermaid（见 `perfection\提案-Navigation关系查看修正.md`）。
3. **校验职责边界** → 采纳：对象自身非法 = 各 Service 提交时拦截；间接非法 = ValidationService 全量校验。
