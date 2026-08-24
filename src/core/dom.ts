/**
 * 轻量 DOM 构建工具。
 */
export function h<K extends keyof HTMLElementTagNameMap>(
	tag: K, className?: string, ...children: (string | Node)[]
): HTMLElementTagNameMap[K] {
	const el = document.createElement(tag);
	if (className) el.className = className;
	el.append(...children);
	return el;
}

export function div(className?: string, ...children: (string | Node)[]): HTMLDivElement {
	return h('div', className, ...children);
}

export function button(label: string, onClick: (e: MouseEvent) => void, className?: string): HTMLButtonElement {
	const btn = h('button', className, label);
	btn.addEventListener('click', onClick);
	return btn;
}

export function formRow(label: string, control: HTMLElement): HTMLDivElement {
	return div('form-row', h('label', 'form-label', label), control);
}

export function select(
	options: { value: string; label: string }[], current: string, onChange: (v: string) => void, className?: string,
): HTMLSelectElement {
	const sel = h('select', className) as HTMLSelectElement;
	for (const o of options) {
		const opt = h('option', '', o.label) as HTMLOptionElement;
		opt.value = o.value; if (o.value === current) opt.selected = true; sel.append(opt);
	}
	sel.addEventListener('change', () => onChange(sel.value));
	return sel;
}

export function colorInput(value: string, onChange: (v: string) => void): HTMLInputElement {
	const i = h('input', 'color-input') as HTMLInputElement;
	i.type = 'color'; i.value = value; i.addEventListener('input', () => onChange(i.value));
	return i;
}

export function textInput(value: string, placeholder: string, onChange: (v: string) => void, className?: string): HTMLInputElement {
	const i = h('input', className ?? 'text-input') as HTMLInputElement;
	i.type = 'text'; i.value = value; i.placeholder = placeholder; i.addEventListener('input', () => onChange(i.value));
	return i;
}

export function toggleGroup(
	options: { value: string; label: string }[], current: string, onChange: (v: string) => void,
): HTMLDivElement {
	const g = div('toggle-group');
	for (const o of options) {
		const b = button(o.label, () => { g.querySelectorAll('.toggle-btn').forEach(bb => bb.classList.remove('active')); b.classList.add('active'); onChange(o.value); }, 'toggle-btn');
		if (o.value === current) b.classList.add('active'); g.append(b);
	}
	return g;
}
