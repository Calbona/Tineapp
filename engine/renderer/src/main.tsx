import { createRoot } from 'react-dom/client'

// 渲染进程入口：仅挂载 React 根节点，页面与业务逻辑后续实现
const container = document.getElementById('root')

if (container) {
  createRoot(container).render(<div>Tineapp</div>)
}
