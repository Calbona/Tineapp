# Search 搜索页视觉效果

> 文档和 CSS 仅供参考，不要完全照抄

## 内容

- 输入的字符会与所有元信息和最下级对象的所有文本对比匹配

### 查询高亮

```css
/* 深色模式下搜索高亮 mark 标签 */
:root[data-theme="dark"] mark {
    /* 深黄色背景 */
    background: #665500;
    /* 亮黄色文字 */
    color: #ffe066;
}
```

**搜索高亮通过 TS 代码实现**

```typescript
// highlight 函数，在匹配文本外包裹 <mark> 标签
function highlight(text: string, query: string): string {
    const i = text.toLowerCase().indexOf(query);
    if (i < 0) return text;
    return text.slice(0, i) + '<mark>' + text.slice(i, i + query.length) + '</mark>'
         + text.slice(i + query.length);
}
```