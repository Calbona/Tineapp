# Description 描述

## 概要

- `Description` 表示一条描述信息

## 数据

### Markdown 格式

`Description`: [id.md](Tineapp\data\documents\id.md)

这个 Markdown 的第一行为 id，id 在 `Description` 所属对象创建时自动生成，用户不会看到，用户不能编辑

文本中的任何文字，只要加上 []，如果这个名字对应的实体存在且唯一，会自动补齐链接，指向该实体的阅览页面

### 示例

[Cg0_Wd0_Ds0.md](Tineapp\data\documents\Cg0_Wd0_Ds0.md)

```md
Cg0_Wd0_Ds0
# 示例世界 1

这是示例世界 1 的一段描述文本
这个世界使用的历法是 [默认历法]
```

## 类

### 路径

[DescriptionService](Tineapp\engine\main\services\DescriptionService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成