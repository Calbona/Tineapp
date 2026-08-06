/**
 * 应用入口。
 * 启动顺序：CSS → 主题 → 种子加载 → i18n → 注册路由 → 启动路由
 */
import './views/home/home.css';
import { initTheme } from './services/theme.ts';
import { initI18n, onLanguageChange } from './services/i18n.ts';
import { initRouter } from './core/router.ts';
import { seedFromFiles } from './services/repository.ts';
import { HomePage } from './views/home/home.ts';

// Editor pages
import { WorldEditorPage } from './views/editor/world-editor.ts';
import { EventEditorPage } from './views/editor/event-editor.ts';
import { CharacterEditorPage } from './views/editor/character-editor.ts';
import { StateEditorPage } from './views/editor/state-editor.ts';
import { OrgEditorPage } from './views/editor/org-editor.ts';
import { MapEditorPage } from './views/editor/map-editor.ts';

// Browser pages
import { WorldViewPage } from './views/browser/world-view.ts';
import { CharacterViewPage } from './views/browser/character-view.ts';
import { EventViewPage } from './views/browser/event-view.ts';
import { EventDetailPage } from './views/browser/event-detail.ts';
import { StateViewPage } from './views/browser/state-view.ts';
import { ChroniclePage } from './views/browser/chronicle.ts';
import { TimelinePage } from './views/browser/timeline.ts';
import { StarMapPage } from './views/browser/star-map.ts';
import { LogViewPage } from './views/browser/log-view.ts';
import { MapViewPage } from './views/browser/map-view.ts';
import { DataViewerPage } from './views/browser/data-viewer.ts';
import { DatabasePage } from './views/browser/database.ts';

// Settings
import { SettingsPage } from './views/settings/settings.ts';
import { TypeManagerPage } from './views/settings/type-manager.ts';
import { CalendarManagerPage } from './views/settings/calendar-manager.ts';
import { TagManagerPage } from './views/settings/tag-manager.ts';

const app = document.getElementById('app');
if (!app) throw new Error('Missing #app container');

const router = initRouter(app);

router.register('#home', HomePage);

router.register('#editor/world/new', WorldEditorPage);
router.register('#editor/world/:id', WorldEditorPage);
router.register('#editor/event/new', EventEditorPage);
router.register('#editor/event/:id', EventEditorPage);
router.register('#editor/character/new', CharacterEditorPage);
router.register('#editor/character/:id', CharacterEditorPage);
router.register('#editor/state/new', StateEditorPage);
router.register('#editor/org/new', OrgEditorPage);
router.register('#editor/map', MapEditorPage);

router.register('#database', DatabasePage);

router.register('#browser/world', WorldViewPage);
router.register('#browser/character', CharacterViewPage);
router.register('#browser/event', EventViewPage);
router.register('#browser/event-detail', EventDetailPage);
router.register('#browser/state', StateViewPage);
router.register('#browser/chronicle', ChroniclePage);
router.register('#browser/timeline', TimelinePage);
router.register('#browser/starmap', StarMapPage);
router.register('#browser/log', LogViewPage);
router.register('#browser/map', MapViewPage);
router.register('#browser/data', DataViewerPage);

router.register('#settings', SettingsPage);
router.register('#settings/types', TypeManagerPage);
router.register('#settings/calendars', CalendarManagerPage);
router.register('#settings/tags', TagManagerPage);

initTheme();

// 种子加载 → i18n → 启动路由
seedFromFiles().then(() => initI18n()).then(() => {
	router.start();
});

onLanguageChange(() => {
	const hash = window.location.hash || '#home';
	window.location.hash = '';
	window.location.hash = hash;
});
