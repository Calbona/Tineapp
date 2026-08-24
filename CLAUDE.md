# CLAUDE.md

## Tineapp 项目本质

面向大型虚拟世界观创作者，用于数据记录、修改、迁移与可视化的，桌面应用

## 技术偏好

- 模块化
- 数据驱动
- 面向对象

## 约束

harness 目录为项目唯一事实来源

- `harness\` 下所有文件和文件夹是**不可修改的约束**
- **默认禁止**对任何 `harness\` 路径执行 Write / Edit / Delete / Move
- 这些文件描述项目结构、页面路由、数据结构、技术实现、UI 风格、文件命名、代码风格等，优先级高于其他任何已存在的代码和文档
- 如果你认为 `harness\` 下的任何文件需要优化，在 `perfection\` 写提案并中止任务，直到我对提案作出决策

engineering 目录为笔记，agent 不需要阅读

- `engineering\` 下所有文件和文件夹是**不可修改的笔记**
- **默认禁止**对任何 `engineering\` 路径执行 Read / Write / Edit / Delete / Move

perfection 目录为优化提案，优化目标是 harness，你不能修改 harness，所以需要这个地方来写提案