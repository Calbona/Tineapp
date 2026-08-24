# View 查看页

> 文档和 CSS 仅供参考，不要完全照抄

## EntityView 实体查看页

### 列表区

```css
/* .cv-char-list 列表容器，白色卡片，可滚动 */
.cv-char-list {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 8px;
    /* 超出时纵向滚动 */
    overflow-y: auto;
    max-height: 600px;
}
:root[data-theme="dark"] .cv-char-list { background: #2a2a2a; border-color: #444; }

/* .cv-char-item 列表项 */
.cv-char-item {
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    /* 极短的过渡，hover 即时反馈 */
    transition: background 0.12s;
}
.cv-char-item:hover { background: #f5f5f5; }
/* .active 选中态 */
.cv-char-item.active {
    background: #333;
    color: #fff;
}
/* 选中态下副文字变浅 */
.cv-char-item.active .cv-char-sub { color: #ccc; }
:root[data-theme="dark"] .cv-char-item:hover { background: #333; }
:root[data-theme="dark"] .cv-char-item.active { background: #e0e0e0; color: #1a1a1a; }
:root[data-theme="dark"] .cv-char-item.active .cv-char-sub { color: #666; }

/* 列表项主文字，中等粗细 */
.cv-char-name { font-size: 0.92rem; font-weight: 500; }

/* 列表项副文字，小号浅色 */
.cv-char-sub { font-size: 0.75rem; color: #999; margin-top: 2px; }
```

### 详情区

```css
/* .cv-detail 详情卡片，比左侧列表更大的 padding */
.cv-detail {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 28px;
    min-height: 400px;
}
:root[data-theme="dark"] .cv-detail { background: #2a2a2a; border-color: #444; }

/* 详情区标题，大号加粗 */
.cv-detail-name { font-size: 1.6rem; font-weight: 600; margin-bottom: 12px; }
:root[data-theme="dark"] .cv-detail-name { color: #e0e0e0; }

/* .cv-placeholder 占位提示 */
.cv-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #bbb;
    font-size: 0.95rem;
}
:root[data-theme="dark"] .cv-placeholder { color: #666; }

/* .cv-content 两栏 Grid 布局 */
.cv-content {
    display: grid;
    /* 固定 220px 和弹性列 */
    grid-template-columns: 220px 1fr;
    gap: 16px;
    min-height: 400px;
}
```

### 详情区分区

```css
/* .cv-section 内容分区，顶部 24px 间距 */
.cv-section { margin-top: 24px; }

/* 分区标题，小号、大写、浅灰、底部 1px 分割线 */
.cv-section h3 {
    font-size: 0.8rem;
    font-weight: 500;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #eee;
}
:root[data-theme="dark"] .cv-section h3 { color: #777; border-color: #3a3a3a; }
```

### 属性

```css
/* .cv-props 属性网格，两列等宽 */
.cv-props {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
}

/* .cv-prop 属性行 */
.cv-prop {
    display: flex;
    gap: 8px;
    padding: 6px 0;
    font-size: 0.88rem;
}

/* 属性键——浅灰、最小宽度 60px */
.cv-prop-key { color: #999; min-width: 60px; }
/* 属性值——深色 */
.cv-prop-val { color: #333; }
:root[data-theme="dark"] .cv-prop-key { color: #888; }
:root[data-theme="dark"] .cv-prop-val { color: #ccc; }
```

## EventView 事件查看页

- 按用户选择的实体，以两种视图呈现其下属事件，两者通过按钮互相跳转
    1. **时间轴视图**
    2. **大事年表视图**
- 只会显示所选择下属一级的事件，而不会显示下属的下属

### TimelineView 时间轴视图

- 用 TimelineJS 生成的时间轴
- 时间轴的时期只显示选择框内实体或 Tag 中最高一层实体的时期，事件则选择框内实体或 Tag 中每个实体的事件分 group 都显示

```css
/* TimelineJS 自带图标字体通过 @font-face 加载，需要指定正确的相对路径 */
@font-face {
    font-family: 'tl-icons';
    src: url('/css/icons/tl-icons.eot');
    src: url('/css/icons/tl-icons.eot?#iefix') format('embedded-opentype'),
         url('/css/icons/tl-icons.ttf') format('truetype'),
         url('/css/icons/tl-icons.woff2') format('woff2'),
         url('/css/icons/tl-icons.woff') format('woff'),
         url('/css/icons/tl-icons.svg#tl-icons') format('svg');
    font-weight: normal;
    font-style: normal;
}

/* .tl-embed TimelineJS 渲染容器，白色卡片 */
.tl-embed {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    min-height: 500px;
    overflow: hidden;
}
:root[data-theme="dark"] .tl-embed { background: #2a2a2a; border-color: #444; }

.tl-slide .tl-headline-date,
.tl-slidenav-previous .tl-slidenav-title,
.tl-slidenav-previous .tl-slidenav-description,
.tl-slidenav-next .tl-slidenav-title,
.tl-slidenav-next .tl-slidenav-description {
    display: none !important;
}

.tl-slide.tl-full-color-background .tl-slide-content-container {
    background: #fff !important;
}

.tl-slide.tl-full-color-background .tl-text h2.tl-headline {
    color: #111 !important;
    font-size: 1.4rem !important;
    font-weight: 600 !important;
    line-height: 1.5 !important;
    margin-bottom: 10px !important;
    text-shadow: none !important;
}

.tl-slide.tl-full-color-background .tl-slide-content-container .tl-slide-content .tl-text {
    color: #555 !important;
    font-size: 0.85rem !important;
    line-height: 1.7 !important;
    text-shadow: none !important;
}

.tl-slide.tl-full-color-background .tl-text .tl-text-content-container {
    background: transparent !important;
    padding: 16px 20px !important;
}

.tl-loading, .tl-empty, .tl-error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    font-size: 0.9rem;
    color: #bbb;
}
:root[data-theme="dark"] .tl-loading { color: #666; }
.tl-error { color: #c66; }

:root[data-theme="dark"] .tl-slide.tl-full-color-background .tl-slide-content-container {
    background: #2a2a2a !important;
}
:root[data-theme="dark"] .tl-slide.tl-full-color-background .tl-text h2.tl-headline {
    color: #fff !important;
}
:root[data-theme="dark"] .tl-slide.tl-full-color-background .tl-slide-content-container .tl-slide-content .tl-text {
    color: #ccc !important;
}
```

### EventsTableView 大事年表视图

- 按开始时间顺序，以列表呈现
- 时期在左边侧栏划出对应高度

```css
/* .db-list 数据库列表，卡片容器 */
.db-list {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 16px 20px;
}
:root[data-theme="dark"] .db-list { background: #2a2a2a; border-color: #444; }

/* .db-placeholder 空状态，虚线边框，居中提示 */
.db-placeholder {
    padding: 24px;
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    text-align: center;
    color: #aaa;
    font-size: 0.9rem;
}
:root[data-theme="dark"] .db-placeholder { border-color: #444; color: #666; }

/* .db-row 数据库行，底部分割线，最后一行无边线 */
.db-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
}
.db-row:last-child { border-bottom: none; }
:root[data-theme="dark"] .db-row { border-color: #333; }

.db-entity-name { font-size: 0.95rem; font-weight: 500; flex: 1; }
.db-entity-meta { font-size: 0.78rem; color: #aaa; }
:root[data-theme="dark"] .db-entity-meta { color: #777; }
```

## RelationshipView 关系数据查看页

- 实体间关系的查看器，呈现为**关系星图**

### 星图视图

```css
/* .sm-main 星图主容器，提供参考系 */
.sm-main { position: relative; }

/* SVG 画布 */
.sm-main svg {
    background: #1a1a1a;
    border-radius: 10px;
    border: 1px solid #333;
}
:root[data-theme="dark"] .sm-main svg { background: #111; border-color: #444; }

/* .sm-match-list 搜索匹配下拉 */
.sm-match-list {
    position: absolute;
    /* 在 SVG 画布之上 */
    z-index: 10;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    max-height: 200px;
    /* 超长时滚动 */
    overflow-y: auto;
    width: 200px;
    /* 柔和的投影 */
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
:root[data-theme="dark"] .sm-match-list { background: #2a2a2a; border-color: #444; }

/* 匹配项，可点击、hover 浅灰 */
.sm-match-list div {
    padding: 6px 12px;
    cursor: pointer;
    font-size: 0.85rem;
    color: #333;
}
.sm-match-list div:hover { background: #f0f0f0; }
:root[data-theme="dark"] .sm-match-list div { color: #ccc; }
:root[data-theme="dark"] .sm-match-list div:hover { background: #3a3a3a; }
```

```typescript
// 中央实体节点，110px 正圆、深灰背景、居中文字、z-index:2 在最上层
centerEl.style.cssText = `
    position: absolute;
    left: ${cx - 55}px;
    top: ${cy - 55}px;
    width: 110px;
    height: 110px;
    /* 圆形 */
    border-radius: 50%;
    /* 深灰背景 */
    background: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    /* 在 SVG 连线之上 */
    z-index: 2;
    /* 边框 */
    border: 2px solid #555;
`;

// 周围实体节点，76px 正圆、更暗背景、hover 时边框变亮
node.style.cssText = `
    position: absolute;
    left: ${tx - 38}px;
    top: ${ty - 38}px;
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: #2a2a2a;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
    border: 1px solid #555;
    transition: border-color 0.15s;  /* hover 边框过渡 */
`;

// SVG 连线，半透明灰色线条
line.setAttribute('stroke', '#666');
line.setAttribute('stroke-width', '1.5');
line.setAttribute('stroke-opacity', '0.6');

// 连线上的描述标签，小号灰色文字
label.setAttribute('fill', '#999');
label.setAttribute('font-size', '10px');
label.setAttribute('text-anchor', 'middle');

// 节点环形排列，通过三角函数计算每个外围节点的位置
const angle = (2 * Math.PI * i) / Math.max(targetIds.length, 1) - Math.PI / 2;
const tx = cx + 200 * Math.cos(angle); // radius = 200px
const ty = cy + 200 * Math.sin(angle);
```