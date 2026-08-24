# Modularization 模块化

## 技术概要

本软件采用模块化设计，每个模块业务清晰，互相不掺杂
**完善模块时同时应更新接口文档（`IPC.md`）**

## 模块

### 本地数据服务模块

#### 路径

`Tineapp\engine\main\services\`

#### 功能

- 读取 `data\` 内的文件
- 修改 `data\` 内的文件
- 校验数据，非法对象清单持久化到 `data\logs\`
- 备份 `data\`，将压缩包存入 `backups\`
- 将数据恢复成某一次备份

#### 组成

- 基础服务类 — `BaseService` — 供其他服务类继承
- **基于组合的 OOP**
- 对象服务类 — `对象名 + Service` — 操作相应数据
- 备份服务类 — `TransferService` — 备份数据和恢复备份

### 桥接模块

#### 路径

`Tineapp\engine\main\ipc\`

#### 功能

- 负责主进程（Node 环境）和渲染进程之间的双向信息传递
- 接收预加载模块转发的渲染进程请求，调用数据服务模块的读写方法，把操作结果通过预加载模块发给渲染进程

#### 组成

- 服务注册表 — `registry.ts`
- 通道常量 — `channels.ts` — 通知主题
- 入口 — `index.ts`

### 主进程启动模块

#### 路径

`Tineapp\engine\main\index.ts`

#### 功能

- 初始化所有其他模块
- 创建软件窗口
- 管理软件的生命周期（启动、关闭、最小化等）

#### 组成

- `initModules()`
- `createMainWindow()` — 创建 BrowserWindow
- 其他应有的各组成部分

### 预加载模块

#### 路径

`Tineapp\engine\preload\index.ts`

#### 功能

- 接收渲染进程的调用，转发给主进程的桥接模块
- 接收主进程桥接模块的通知，转发给渲染进程
- 向渲染进程注入 `window.tineapp`，作为渲染层访问数据的唯一入口

#### 组成

- 应有的各组成部分

### 页面功能模块

#### 路径

`Tineapp\engine\renderer\`

#### 功能

- 展示数据
- 接收用户操作
- 触发数据更新
- UI 基于 **React**

#### 组成

- React 组件（页面组件与共享组件）
- 路由（页面清单与跳转规则见 `Navigation.md`）
- 其他应有的各组成部分

### 页面样式模块

#### 路径

`Tineapp\engine\renderer\`

#### 功能

- 控制页面的外观（简约现代风）

#### 组成

- 全局样式（基调见 `STYLES\Global.md`，CSS 仅供参考）
- 页面样式（`STYLES\<页面组>.md`，CSS 仅供参考）

### 静态资源模块

#### 路径

`Tineapp\assets\`

#### 功能

- 存放软件资源，包括图标和语言
- 本模块只放静态资源，不含代码

#### 组成

- `images\` — 图标
- `languages\` — 语言文件

### TypeScript 模块

#### 路径

`Tineapp\engine\types.ts`

#### 功能

- 存放 TypeScript 类型定义，保证不同模块用的数据结构完全一致

#### 组成

- 各对象类型定义（与 `OBJECTS\*` 文档的 JSON 格式一一对应）
- 应有的各组成部分