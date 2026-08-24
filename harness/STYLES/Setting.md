# Setting 设置页

> 文档和 CSS 仅供参考，不要完全照抄

## 内容

### 说明文字

```css
/* 设置页面 */

/* .setting-hint 设置项的说明文字，小号、浅灰，放在控件上方或下方 */
.setting-hint {
    font-size: 0.82rem;
    color: #999;
    margin-bottom: 12px;
    line-height: 1.5;
}
:root[data-theme="dark"] .setting-hint { color: #777; }

/* .setting-sub 子说明文字，更小、更浅，放在控件下方 */
.setting-sub {
    font-size: 0.75rem;
    color: #aaa;
    /* 负 margin-top 让说明紧贴上方控件 */
    margin: -4px 0 10px 0;
    padding-left: 2px;
}
:root[data-theme="dark"] .setting-sub { color: #666; }
```

### 颜色选择器

```css
/* .color-input 颜色选择器，36×36 方框，去掉 Webkit 默认色板边框 */
.color-input {
    width: 36px;
    height: 36px;
    padding: 2px;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    background: #fff;
}
/* 去除 Webkit 内核浏览器颜色选择器的默认内边距 */
.color-input::-webkit-color-swatch-wrapper {
    padding: 0;
}
/* 让颜色色板填满整个控件 */
.color-input::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
}
:root[data-theme="dark"] .color-input { border-color: #444; background: #2a2a2a; }

/* .palette-grid 调色盘网格 */
.palette-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

/* .palette-item 每个颜色项，颜色选择器和删除按钮横向排列 */
.palette-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

/* .palette-remove-btn 颜色删除按钮 */
.palette-remove-btn {
    width: 22px;
    height: 22px;
    padding: 0;
    font-size: 0.7rem;
    border: 1px solid #ddd;
    /* 圆形 */
    border-radius: 50%;
    background: #fff;
    color: #999;
    cursor: pointer;
    line-height: 22px;
    text-align: center;
}
.palette-remove-btn:hover {
    background: #fee;
    color: #c44;
    border-color: #ecc;
}
:root[data-theme="dark"] .palette-remove-btn {
    background: #2a2a2a; border-color: #444; color: #777;
}
:root[data-theme="dark"] .palette-remove-btn:hover {
    background: #3a2020; color: #f66; border-color: #633;
}

/* .palette-actions 调色盘操作按钮区 */
.palette-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
}
```

### 重置按钮

```css
/* .reset-btn 重置按钮，低调，hover 变红警示 */
.reset-btn {
    display: block;
    width: 100%;
    margin-top: 10px;
    padding: 12px;
    font-size: 0.9rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    color: #999;
    cursor: pointer;
    transition: all 0.15s;
}
.reset-btn:hover {
    color: #c44;
    border-color: #ecc;
    background: #fff5f5;
}
:root[data-theme="dark"] .reset-btn { background: #2a2a2a; border-color: #444; color: #777; }
:root[data-theme="dark"] .reset-btn:hover {
    color: #f66; border-color: #633; background: #2a2020;
}
```