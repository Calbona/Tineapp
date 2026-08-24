# Home 首页

> 文档和 CSS 仅供参考，不要完全照抄

## 内容

- 首页承载导航栏，用户通过它进入其他页面对数据进行修改、查看

## 示例

```css
/* .nav-section 首页的分组容器，每组之间 28px 间距 */
.nav-section {
    margin-bottom: 28px;
}

/* 分区标题 */
.nav-section h2 {
    /* 小号 */
    font-size: 0.85rem;
    font-weight: 500;
    color: #888;
    /* 全大写英文 */
    text-transform: uppercase;
    /* 字间距 */
    letter-spacing: 0.08em;
    margin-bottom: 10px;
    /* 与下方内容视觉对齐 */
    padding-left: 2px;
}
:root[data-theme="dark"] .nav-section h2 { color: #888; }

/* .nav-grid 响应式按钮网格 */
.nav-grid {
    display: grid;
    /* 最小列宽 140px，自动填充 */
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    /* 按钮之间 8px 间距 */
    gap: 8px;
}

/* .nav-btn 导航按钮，白底灰边框圆角 */
.nav-btn {
    display: block;
    width: 100%;
    padding: 12px 16px;
    font-size: 0.95rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
    color: #333;
    /* 手型光标 */
    cursor: pointer;
    /* hover 0.15s 平滑过渡 */
    transition: background 0.15s, border-color 0.15s;
    text-align: center;
}
/* hover 时反馈 */
.nav-btn:hover {
    /* 底色加深 */
    background: #f0f0f0;
    /* 边框变深 */
    border-color: #bbb;
}
:root[data-theme="dark"] .nav-btn {
    background: #2a2a2a; border-color: #444; color: #e0e0e0;
}
:root[data-theme="dark"] .nav-btn:hover { background: #333; border-color: #666; }
```