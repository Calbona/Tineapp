/// <reference types="vite/client" />

/** Electron preload 暴露的文件 API */
interface AppAPI {
	readFile(filePath: string): Promise<string>;
	writeFile(filePath: string, content: string): Promise<boolean>;
	listFiles(dirPath: string): Promise<string[]>;
	exists(filePath: string): Promise<boolean>;
}

declare global {
	interface Window {
		appAPI?: AppAPI;
	}
}

export {};
