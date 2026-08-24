# Global 全局

> 文档和 CSS 仅供参考，不要完全照抄

## 风格

简约风、现代风

## 示例

### 全局重置
```css
*, *::before, *::after {
    /* 让所有元素的宽高包含 padding 和 border，避免因 padding 导致尺寸计算错误 */
    box-sizing: border-box;
    /* 清除浏览器默认 margin */
    margin: 0;
    /* 清除浏览器默认 padding */
    padding: 0;
}

body {
    /* 系统字体 */
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    /* 浅色模式背景 */
    background: #f5f5f5;
    /* 浅色模式正文 */
    color: #1a1a1a;
    /* 行高 */
    line-height: 1.6;
}
/* 深色模式，通过 :root[data-theme="dark"] 选择器精确覆盖浅色规则，主题切换时动态修改 */
:root[data-theme="dark"] body {
    background: #1a1a1a;
    color: #e0e0e0;
}

#app {
    /* #app 容器最大 900px 防止宽屏文字过长 */
    max-width: 900px;
    /* 水平居中 */
    margin: 0 auto;
    /* 上下 24px 内边距，左右 16px */
    padding: 24px 16px;
}
```

### 标题

```css
/* .app-title 应用大标题，营造简约高端感 */
.app-title {
    /* 居中 */
    text-align: center;
    /* 32px 大号 */
    font-size: 2rem;
    /* 细体 */
    font-weight: 300;
    /* 字间距 20% 字宽，呼吸感 */
    letter-spacing: 0.2em;
    /* 与下方内容拉开距离 */
    margin-bottom: 32px;
    color: #333;
}
:root[data-theme="dark"] .app-title { color: #e0e0e0; }

/* .page-title 页面标题，给各子页面使用 */
.page-title {
    font-size: 1.4rem;
    /* 中等粗细 */
    font-weight: 500;
    margin-bottom: 20px;
}
```

### 按钮

```css
/* .back-btn 返回按钮，通常在页面左上角 */
.back-btn {
    font-size: 0.85rem;
    padding: 6px 14px;
    margin-bottom: 16px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    color: #666;
    cursor: pointer;
    transition: background 0.15s;
}
.back-btn:hover {
    background: #f0f0f0;
}
:root[data-theme="dark"] .back-btn {
    background: #2a2a2a; border-color: #444; color: #aaa;
}
:root[data-theme="dark"] .back-btn:hover { background: #333; }

/* .submit-btn 提交按钮，醒目 */
.submit-btn {
    display: block;
    width: 100%;
    /* 与表单区域拉开距离 */
    margin-top: 24px;
    padding: 14px;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    /* 深灰背景 */
    background: #333;
    /* 白色文字 */
    color: #fff;
    cursor: pointer;
    transition: background 0.15s;
}
/* hover 时变亮 */
.submit-btn:hover {
    background: #555;
}
:root[data-theme="dark"] .submit-btn {
    background: #e0e0e0; color: #1a1a1a;
}
:root[data-theme="dark"] .submit-btn:hover { background: #fff; }
```

### 小按钮
```css
/* .small-btn 小按钮，比 nav-btn 更紧凑 */
.small-btn {
    padding: 7px 14px;
    font-size: 0.82rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    color: #555;
    cursor: pointer;
    transition: background 0.15s;
    /* 防止文字换行 */
    white-space: nowrap;
}
.small-btn:hover {
    background: #f0f0f0;
}
:root[data-theme="dark"] .small-btn {
    background: #2a2a2a; border-color: #444; color: #aaa;
}
:root[data-theme="dark"] .small-btn:hover { background: #333; }
```

### 单选按钮组

```css
/* .toggle-group 将多个按钮合并为一个整体 */
.toggle-group {
    display: inline-flex;
    border: 1px solid #ddd;
    border-radius: 8px;
    /* 内部按钮的圆角被裁切，形成整体圆角 */
    overflow: hidden;
}
:root[data-theme="dark"] .toggle-group { border-color: #444; }

/* .toggle-btn 组内按钮 */
.toggle-btn {
    padding: 8px 20px;
    font-size: 0.88rem;
    border: none;
    /* 按钮之间分割线 */
    border-right: 1px solid #ddd;
    background: #fff;
    color: #666;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}
/* 最后一个按钮右边无分割线 */
.toggle-btn:last-child { border-right: none; }
.toggle-btn:hover { background: #f5f5f5; }
/* .active 激活态 */
.toggle-btn.active {
    background: #333;
    color: #fff;
}
:root[data-theme="dark"] .toggle-btn {
    background: #2a2a2a; border-color: #444; color: #999;
}
:root[data-theme="dark"] .toggle-btn:hover { background: #333; }
:root[data-theme="dark"] .toggle-btn.active {
    background: #e0e0e0; color: #1a1a1a;
}
```

### 表单

```css
/* .form-section 表单卡片，白底、圆角、细边框 */
.form-section {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 16px;
}

/* 表单分区标题，小号灰色 */
.form-section h2 {
    font-size: 0.9rem;
    font-weight: 500;
    color: #888;
    margin-bottom: 12px;
}

/* .form-placeholder 表单占位区 */
.form-placeholder {
    padding: 24px;
    /* 虚线边框可以暗示“此处可添加内容” */
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    /* 居中浅色文字 */
    text-align: center;
    color: #aaa;
    font-size: 0.9rem;
}

/* .form-row 表单行 */
.form-row {
    display: flex;
    /* 垂直居中对齐 */
    align-items: center;
    /* 控件之间 10px 间距 */
    gap: 10px;
    margin-bottom: 10px;
}

/* .form-label 表单标签，右对齐感 */
.form-label {
    /* 不伸缩，固定 110px */
    flex: 0 0 110px;
    font-size: 0.88rem;
    color: #555;
}
:root[data-theme="dark"] .form-label { color: #aaa; }

/* .form-select 下拉框 */
.form-select {
    /* 撑满可用空间 */
    flex: 1;
    padding: 8px 12px;
    font-size: 0.9rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    color: #333;
    cursor: pointer;
    /* 去掉浏览器默认 focus 轮廓 */
    outline: none;
}
.form-select:focus {
    /* focus 时边框加深表示活跃 */
    border-color: #888;
}

/* .text-input 文本/数字输入框，统一样式 */
.text-input {
    flex: 1;
    padding: 8px 12px;
    font-size: 0.9rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    color: #333;
    outline: none;
}
.text-input:focus {
    border-color: #888;
}
:root[data-theme="dark"] .form-select,
:root[data-theme="dark"] .text-input {
    /* 比卡片更深的背景 */
    background: #1e1e1e;
    border-color: #444;
    color: #e0e0e0;
}
```

### 通知

```css
/* .toast 底部弹出提示 */
.toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    /* 水平居中，初始下沉 20px */
    transform: translateX(-50%) translateY(20px);
    padding: 10px 24px;
    font-size: 0.88rem;
    background: #333;
    color: #fff;
    border-radius: 8px;
    /* 初始透明 */
    opacity: 0;
    /* 淡入、上升动画 */
    transition: opacity 0.25s, transform 0.25s;
    /* 不响应鼠标，避免阻挡操作 */
    pointer-events: none;
    /* 最顶层 */
    z-index: 9999;
}
:root[data-theme="dark"] .toast { background: #e0e0e0; color: #1a1a1a; }

/* .toast.show 激活态 */
.toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}
```