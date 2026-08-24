# Tineapp

面向大型虚拟世界观创作者的数据记录与可视化桌面应用。

## 功能

- **世界管理** — 以世界为单位管理角色、事件、国家、组织、标签
- **自定义历法** — 集成 ChronologyJS 支持架空历法，时间输入由历法 units 数据驱动
- **可视化** — 大事年表、TimelineJS 时间轴、人物传记、马赛克地图、人物关系星图
- **事件搜索** — 关键词匹配全部事件描述，点击跳转事件明细页
- **数据查看器** — 按世界浏览所有 JSON 数据文件
- **深色模式** — 浅色/深色/跟随系统

## 快速开始

```bash
npm install
npm run dev          # 浏览器开发
npm run electron:dev # Electron 桌面开发
npm run electron:build # 打包 Windows 安装程序
```

## 技术栈

Electron + Vite + TypeScript + TimelineJS + D3.js + ChronologyJS

## 架构

面向对象、模块化、数据驱动。详见 [ENGINEERING.md](./ENGINEERING.md)。

## JSON 数据格式

```json
世界: {id, name, chronology, config}
角色: {world, id, name, properties, events, relationships}
标签: {world, name, characters, tags}
```
