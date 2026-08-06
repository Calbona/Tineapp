/**
 * 页面接口 — 每个视图必须实现 render，可选 destroy
 */
export interface Page {
	/** 将页面渲染到指定容器中 */
	render(container: HTMLElement): void;
	/** 离开页面时的清理工作 */
	destroy?(): void;
}

/**
 * 路由表条目
 */
interface RouteEntry {
	/** 路径模式，支持动态参数如 /world/:id */
	pattern: string;
	/** 参数名列表 */
	paramNames: string[];
	/** 匹配正则 */
	regex: RegExp;
	/** 页面工厂 */
	page: Page;
}

/**
 * 简易 Hash 路由
 * - 所有路由以 # 开头，如 #home, #editor/world/new
 * - 支持动态参数：路径中以 : 开头为参数，如 /world/:id
 * - 不匹配时回退到 #home
 */
export class Router {
	readonly #container: HTMLElement;
	readonly #routes: RouteEntry[] = [];
	#current: Page | null = null;
	#fallback: string = '#home';

	constructor(container: HTMLElement) {
		this.#container = container;
		window.addEventListener('hashchange', () => this.#handle());
	}

	/**
	 * 注册路由
	 * @param path 路径模式，如 '#editor/world/:id' 或 '#home'
	 * @param page Page 实例
	 */
	register(path: string, page: Page): void {
		const paramNames: string[] = [];
		const regexStr = '^' + path.replace(/:(\w+)/g, (_: string, name: string) => {
			paramNames.push(name);
			return '([^/]+)';
		}) + '$';

		this.#routes.push({
			pattern: path,
			paramNames,
			regex: new RegExp(regexStr),
			page,
		});
	}

	/**
	 * 导航到指定路径
	 */
	navigate(path: string): void {
		window.location.hash = path;
	}

	/**
	 * 替换当前路径（不产生历史记录）
	 */
	replace(path: string): void {
		window.location.replace(`#${path}`);
	}

	/**
	 * 启动路由 — 处理当前 hash 并开始监听
	 */
	start(): void {
		this.#handle();
	}

	/**
	 * 获取当前路径（含 #）
	 */
	get currentPath(): string {
		return window.location.hash || this.#fallback;
	}

	/**
	 * 获取动态路由参数
	 */
	get params(): Record<string, string> {
		const path = this.currentPath;
		for (const route of this.#routes) {
			const m = path.match(route.regex);
			if (m) {
				const params: Record<string, string> = {};
				route.paramNames.forEach((name, i) => {
					params[name] = m[i + 1];
				});
				return params;
			}
		}
		return {};
	}

	/**
	 * 处理 hash 变化
	 */
	#handle(): void {
		const path = window.location.hash || this.#fallback;

		// 查找匹配路由
		for (const route of this.#routes) {
			const m = path.match(route.regex);
			if (m) {
				this.#activate(route.page);
				return;
			}
		}

		// 无匹配，回退
		this.navigate(this.#fallback.slice(1));
	}

	/**
	 * 激活页面
	 */
	#activate(page: Page): void {
		if (this.#current && this.#current.destroy) {
			this.#current.destroy();
		}
		this.#current = page;
		this.#container.innerHTML = '';
		page.render(this.#container);
	}
}

/**
 * 全局单例
 */
let _router: Router | null = null;

export function getRouter(): Router {
	if (!_router) {
		throw new Error('Router not initialized. Call initRouter() first.');
	}
	return _router;
}

export function initRouter(container: HTMLElement): Router {
	_router = new Router(container);
	return _router;
}
