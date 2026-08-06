/**
 * Preload 脚本 — 通过 contextBridge 向渲染进程暴露安全的文件 API。
 * 渲染进程中通过 window.appAPI 调用。
 */
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('appAPI', {
	/** 读取文本文件，返回内容字符串 */
	readFile: (filePath: string): Promise<string> =>
		ipcRenderer.invoke('fs:readFile', filePath),

	/** 写入文本文件 */
	writeFile: (filePath: string, content: string): Promise<boolean> =>
		ipcRenderer.invoke('fs:writeFile', filePath, content),

	/** 列出目录中所有文件名 */
	listFiles: (dirPath: string): Promise<string[]> =>
		ipcRenderer.invoke('fs:listFiles', dirPath),

	/** 检查文件是否存在 */
	exists: (filePath: string): Promise<boolean> =>
		ipcRenderer.invoke('fs:exists', filePath),
});
