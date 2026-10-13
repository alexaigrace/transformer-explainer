import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { loadLocalTokenizer } from '../src/utils/localTokenizer.js';

test('GPT-2 tokenizer loads with networking disabled and preserves token IDs', async () => {
	const originalFetch = globalThis.fetch;
	const requests = [];
	globalThis.fetch = async (url) => {
		requests.push(String(url));
		throw new Error('Networking is disabled for this test');
	};
	const missingRoot = await mkdtemp(join(tmpdir(), 'local-tokenizer-missing-'));
	try {
		const root = fileURLToPath(new URL('../static/tokenizer/', import.meta.url));
		const tokenizer = await loadLocalTokenizer(root);
		assert.deepEqual(tokenizer.encode('Hello, world!'), [15496, 11, 995, 0]);
		assert.deepEqual(
			tokenizer.encode('Data visualization empowers users to'),
			[6601, 32704, 795, 30132, 2985, 284]
		);
		for (const input of ['Hello, world!', '中文测试', 'emoji 😊', '  spaces\nnext line']) {
			assert.equal(tokenizer.decode(tokenizer.encode(input)), input);
		}
		assert.equal(await loadLocalTokenizer(root), tokenizer);
		await assert.rejects(loadLocalTokenizer(`${missingRoot}/`), /not found locally/);
		assert.deepEqual(requests, [], 'Missing local files must not trigger a remote fallback');
	} finally {
		globalThis.fetch = originalFetch;
		await rm(missingRoot, { recursive: true, force: true });
	}
});
