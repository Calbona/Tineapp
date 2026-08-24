# Document 文档

## 概要

- `Document` 表示一个文档

## 数据

### Docx 格式

`Document`: [id.docx](Tineapp\data\documents\id.docx)

这个 Docx 的第一个有字符的行，或字符太多时取前几个并加 '...' 为文档名，文档名与 id 无关，只是在软件内展示时会显示文档名而不是 id

### 示例

[Cg0_Wd0_Dc0.docx](Tineapp\data\documents\Cg0_Wd0_Dc0.docx)

```docx
示例世界 1

这是示例世界 1 的一个文档
```

## 类

### 路径

[DocumentService](Tineapp\engine\main\services\DocumentService.ts)

### 方法

- 通用方法继承自 `BaseService`
- 待完成