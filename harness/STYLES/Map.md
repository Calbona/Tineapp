# Map 地图页

> 文档和 CSS 仅供参考，不要完全照抄

## 内容

- 在用户选择的观察者时间下，演示地图
- 提供观察者时间选择，切换时间即时重算着色

### 地图

```typescript
// 地图容器
mapArea.style.cssText = `
    position: relative;
    border: 2px solid #333;
    overflow: auto;
    background: #c8c7b4;
    min-height: 400px;
`;

// 地块格子，绝对定位、按 owner 颜色填充、半透明白边
el.style.cssText = `
    position: absolute;
    left: ${x * tileSize}px;
    top: ${y * tileSize}px;
    /* -1px 留出间隙 */
    width: ${tileSize - 1}px;
    height: ${tileSize - 1}px;
    /* 上色，无政权就 #d1c7a5 */
    background: ${bg};
    cursor: pointer;
    /* 半透明白边形成网格线 */
    border: 1px solid rgba(255,255,255,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    /* 随格子大小缩放 */
    font-size: ${Math.max(8, tileSize * 0.22)}px;
    color: rgba(255,255,255,0.85);
    overflow: hidden;
    text-align: center;
`;

// tileSize 动态计算，最大 48px，确保地图在 700px 宽度内完整显示
const tileSize = Math.min(48, Math.floor(700 / Math.max(mapW, mapH, 1)));
```

### 图例