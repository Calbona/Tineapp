/**
 * Electron 主进程 — 窗口管理 + IPC 文件操作。
 * 开发时加载 Vite dev server，生产时加载 dist/index.html。
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

let mainWindow: BrowserWindow | null = null;

/** 应用根目录（package.json 所在） */
const ROOT = path.resolve(app.getAppPath());

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 820,
		minWidth: 900,
		minHeight: 600,
		title: 'Tineapp',
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	// 开发模式加载 Vite dev server，否则加载打包文件
	if (process.env.VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(path.join(ROOT, 'dist', 'index.html'));
	}

	mainWindow.on('closed', () => { mainWindow = null; });
}

// ═══════════════════ IPC 文件操作 ═══════════════════

/** 读取文件内容（UTF-8 文本） */
ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
	const fullPath = path.join(ROOT, filePath);
	return fs.readFileSync(fullPath, 'utf-8');
});

/** 写入文件 */
ipcMain.handle('fs:writeFile', async (_event, filePath: string, content: string) => {
	const fullPath = path.join(ROOT, filePath);
	fs.mkdirSync(path.dirname(fullPath), { recursive: true });
	fs.writeFileSync(fullPath, content, 'utf-8');
	return true;
});

/** 列出目录中的文件 */
ipcMain.handle('fs:listFiles', async (_event, dirPath: string) => {
	const fullPath = path.join(ROOT, dirPath);
	if (!fs.existsSync(fullPath)) return [];
	return fs.readdirSync(fullPath, { withFileTypes: true })
		.filter(d => d.isFile())
		.map(d => d.name);
});

/** 检查文件是否存在 */
ipcMain.handle('fs:exists', async (_event, filePath: string) => {
	const fullPath = path.join(ROOT, filePath);
	return fs.existsSync(fullPath);
});

// ═══════════════════ 应用生命周期 ═══════════════════

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
