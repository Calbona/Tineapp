# Structure 项目结构

## 技术栈

- **Electron**：主进程 `engine\main\`、预加载 `engine\preload\`、渲染进程 `engine\renderer\`
- **React**：渲染进程（`engine\renderer\`）的 UI 框架
- **TypeScript**：全仓统一，类型定义集中在 `engine\types.ts`

## 文件夹

```
Tineapp
├─ CLAUDE.md            # 项目要求
├─ setting.toml         # Config 对象
├─ IPC.md               # 桥接契约：已注册服务清单与通知主题
├─ README.md            # 项目描述
├─ harness\             # 唯一事实来源
├─ perfection\          # 优化提案
├─ engineering\         # 设计笔记
├─ engine\              # 源码
├─ data\                # 运行时数据（对象实例、注册表、日志）
├─ assets\              # 静态资源（图片、语言文件）
├─ backups\             # 数据备份压缩包
└─ ...
```