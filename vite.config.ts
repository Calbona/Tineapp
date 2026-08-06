import { defineConfig } from 'vite';

export default defineConfig({
	root: '.',
	base: './',  // Electron 用 file:// 协议，需相对路径
	build: {
		outDir: 'dist',
		target: 'es2022',
	},
	server: {
		port: 3000,
		open: false,  // Electron 自己打开窗口
	},
});
