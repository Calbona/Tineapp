/**
 * 首页导航 — 数据增改 / 阅览 / 设置。
 */
import type { Page } from '../../core/router.ts';
import { div, button, h } from '../../core/dom.ts';
import { t } from '../../services/i18n.ts';

export const HomePage: Page = {
	render(container: HTMLElement) {
		container.innerHTML = '';
		const title = h('h1', 'app-title', t('app.title'));

		const addModifySection = div('nav-section',
			h('h2', '', t('home.addModify')),
			div('nav-grid',
				button(t('home.newWorld'), () => { sessionStorage.removeItem('tineapp-draft-world'); window.location.hash = '#editor/world/new'; }, 'nav-btn'),
				button(t('home.modifyWorld'), () => { window.location.hash = '#database'; }, 'nav-btn'),
				button('自定义类型', () => { window.location.hash = '#settings/types'; }, 'nav-btn'),
				button('自定义历法', () => { window.location.hash = '#settings/calendars'; }, 'nav-btn'),
				button('自定义标签', () => { window.location.hash = '#settings/tags'; }, 'nav-btn'),
			),
		);

		const navItems: [string, string][] = [
			[t('nav.chronicle'), '#browser/chronicle'],
			[t('nav.state'), '#browser/state'],
			[t('nav.world'), '#browser/world'],
			[t('nav.character'), '#browser/character'],
			[t('nav.timeline'), '#browser/timeline'],
			[t('nav.map'), '#browser/map'],
			[t('nav.starmap'), '#browser/starmap'],
			[t('nav.event'), '#browser/event'],
			[t('nav.log'), '#browser/log'],
			[t('nav.data'), '#browser/data'],
		];
		const browseSection = div('nav-section',
			h('h2', '', t('home.browse')),
			div('nav-grid', ...navItems.map(([label, hash]) => button(label, () => { window.location.hash = hash; }, 'nav-btn'))),
		);

		const settingsSection = div('nav-section',
			h('h2', '', t('home.config')),
			div('nav-grid', button(t('home.settings'), () => { window.location.hash = '#settings'; }, 'nav-btn')),
		);

		container.append(title, addModifySection, browseSection, settingsSection);
	},
};
