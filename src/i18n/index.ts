import { derived, get, writable } from 'svelte/store';
import { en, type MessageKey } from './en';
import { zh } from './zh';

export type Locale = 'en' | 'zh';

export const LOCALE_STORAGE_KEY = 'transformer-explainer-locale';

/** Chinese is the default so the localized interface shows up on first visit. */
export const defaultLocale: Locale = 'zh';

const dictionaries: Record<Locale, Record<string, string>> = { en, zh };

export const locale = writable<Locale>(defaultLocale);

type Vars = Record<string, string | number>;

/** Look up a key and fill `{placeholders}` with `vars`. Falls back to English, then to the key. */
export function translate(current: Locale, key: string, vars?: Vars): string {
	let text = dictionaries[current]?.[key] ?? en[key as MessageKey] ?? key;

	if (vars) {
		text = text.replace(/\{(\w+)\}/g, (match, name: string) =>
			name in vars ? String(vars[name]) : match
		);
	}

	return text;
}

/**
 * Store whose value is a translate function. Calling it as `$t(...)` inside a
 * component subscribes to the locale, so labels re-render when it changes.
 */
export const t = derived(locale, ($locale) => (key: string, vars?: Vars) =>
	translate($locale, key, vars)
);

function applyDocumentLocale(next: Locale) {
	if (typeof document === 'undefined') return;

	document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
	document.title = translate(next, 'meta.title');

	const description = document.querySelector('meta[name="description"]');
	description?.setAttribute('content', translate(next, 'meta.description'));
}

export function setLocale(next: Locale, { persist = true }: { persist?: boolean } = {}) {
	locale.set(next);

	if (typeof window === 'undefined') return;

	if (persist) {
		try {
			window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
		} catch {
			// Private mode / storage disabled: keep the in-memory choice only.
		}
	}

	applyDocumentLocale(next);
}

export function toggleLocale() {
	setLocale(get(locale) === 'zh' ? 'en' : 'zh');
}

/** Restore the saved language after hydration and sync the document metadata. */
export function initLocale() {
	if (typeof window === 'undefined') return;

	let stored: string | null = null;
	try {
		stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
	} catch {
		stored = null;
	}

	setLocale(stored === 'en' || stored === 'zh' ? stored : defaultLocale, { persist: false });
}
