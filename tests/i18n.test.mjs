import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));

function read(relativePath) {
	return readFileSync(join(root, relativePath), 'utf8');
}

/** Collect `'key': 'value'` and `'key': \`value\`` entries from a dictionary file. */
function extractEntries(source) {
	const entries = new Map();
	const pattern =
		/^\s*'([^']+)':\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`([\s\S]*?)`)/gm;
	for (const match of source.matchAll(pattern)) {
		entries.set(match[1], match[2] ?? match[3] ?? match[4] ?? '');
	}
	return entries;
}

function placeholders(value) {
	return [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

/** Walk a folder and return relative POSIX-style file paths. */
function walk(relativeDir) {
	const found = [];
	const visit = (relativePath) => {
		for (const entry of readdirSync(join(root, relativePath), { withFileTypes: true })) {
			const next = `${relativePath}/${entry.name}`;
			if (entry.isDirectory()) visit(next);
			else found.push(next);
		}
	};
	visit(relativeDir);
	return found;
}

const en = extractEntries(read('src/i18n/en.ts'));
const zh = extractEntries(read('src/i18n/zh.ts'));

test('English and Chinese dictionaries define exactly the same keys', () => {
	assert.ok(en.size > 100, `expected the English dictionary to be populated, got ${en.size} keys`);

	const missing = [...en.keys()].filter((key) => !zh.has(key));
	const extra = [...zh.keys()].filter((key) => !en.has(key));

	assert.deepEqual(missing, [], 'Chinese dictionary is missing keys');
	assert.deepEqual(extra, [], 'Chinese dictionary has keys that English does not define');
});

test('every Chinese translation is present, non-empty and keeps English placeholders', () => {
	for (const [key, english] of en) {
		const chinese = zh.get(key);
		assert.ok(chinese !== undefined, `missing Chinese value for "${key}"`);
		assert.ok(chinese.trim().length > 0, `empty Chinese value for "${key}"`);
		assert.deepEqual(
			placeholders(chinese),
			placeholders(english),
			`placeholder mismatch for "${key}"`
		);
	}
});

test('tutorial content keeps its HTML tags so {@html} rendering still works', () => {
	for (const [key, english] of en) {
		if (!key.startsWith('textbook.') || !key.endsWith('.content')) continue;

		const chinese = zh.get(key);
		const englishTags = [...english.matchAll(/<\/?([a-z]+)[^>]*>/g)].map((m) => m[1]).sort();
		const chineseTags = [...(chinese ?? '').matchAll(/<\/?([a-z]+)[^>]*>/g)].map((m) => m[1]).sort();

		assert.deepEqual(chineseTags, englishTags, `HTML tags changed in "${key}"`);
	}
});

test('every $t() key used in the source exists in both dictionaries', () => {
	const files = walk('src').filter((file) => /\.(svelte|ts)$/.test(file));
	const used = new Map();

	for (const file of files) {
		if (file.endsWith('src/i18n/en.ts') || file.endsWith('src/i18n/zh.ts')) continue;

		const source = read(file);
		for (const match of source.matchAll(/\$t\(\s*'([^']+)'/g)) {
			if (!used.has(match[1])) used.set(match[1], file);
		}
	}

	assert.ok(used.size > 40, `expected many translated labels, found ${used.size}`);

	for (const [key, file] of used) {
		assert.ok(en.has(key), `${file} uses unknown key "${key}"`);
		assert.ok(zh.has(key), `${file} uses key "${key}" that is missing a Chinese translation`);
	}
});

test('textbook pages point at keys that exist in both dictionaries', () => {
	const source = read('src/utils/textbookPages.ts')
		.split('\n')
		.filter((line) => !line.trim().startsWith('//'))
		.join('\n');
	const keys = [...source.matchAll(/(?:titleKey|contentKey): '([^']+)'/g)].map((match) => match[1]);

	assert.ok(keys.length >= 40, `expected title and content keys for every page, got ${keys.length}`);

	for (const key of keys) {
		assert.ok(en.has(key), `textbookPages.ts references unknown key "${key}"`);
		assert.ok(zh.has(key), `textbookPages.ts references "${key}" without a Chinese translation`);
	}
});

test('the language switch and the bilingual article are wired up', () => {
	const topbar = read('src/components/Topbar.svelte');
	const article = read('src/components/article/Article.svelte');
	const toggle = read('src/components/LanguageToggle.svelte');

	assert.match(topbar, /LanguageToggle/, 'Topbar should render the language switch');
	assert.match(toggle, /setLocale/, 'Language switch should write the locale');
	assert.match(article, /\{#if \$locale === 'zh'\}/, 'Article should branch on the locale');
	assert.match(article, /\{:else\}/, 'Article should keep an English branch');
	assert.match(article, /What is a Transformer\?/, 'English article text must be preserved');
});
