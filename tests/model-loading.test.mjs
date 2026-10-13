import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchAndMergeChunks } from '../src/utils/fetchChunks.js';
import { createModelLoader } from '../src/utils/modelLoader.js';

function deferred() {
	let resolve;
	let reject;
	const promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

function buffer(bytes) {
	return Uint8Array.from(bytes).buffer;
}

function response(bytes, { ok = true } = {}) {
	const body = buffer(bytes);
	return {
		ok,
		clone() {
			return response(bytes, { ok });
		},
		async arrayBuffer() {
			return body.slice(0);
		}
	};
}

async function withGlobals(replacements, callback) {
	const originals = new Map();
	for (const [key, value] of Object.entries(replacements)) {
		originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
		if (value === undefined) delete globalThis[key];
		else Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
	}
	try {
		return await callback();
	} finally {
		for (const [key, descriptor] of originals) {
			if (descriptor) Object.defineProperty(globalThis, key, descriptor);
			else delete globalThis[key];
		}
	}
}

function cacheStorage(cache) {
	return {
		async keys() {
			return ['onnx-model-cache-v2'];
		},
		async open() {
			return cache;
		},
		async delete() {
			return true;
		}
	};
}

test('chunk merge preserves URL order when network responses finish out of order', async () => {
	const delays = [25, 1, 10];
	const progress = [];
	await withGlobals(
		{
			caches: undefined,
			fetch: async (url) => {
				const index = Number(url.slice(-1));
				await new Promise((resolve) => setTimeout(resolve, delays[index]));
				return response([index + 1]);
			}
		},
		async () => {
			const result = await fetchAndMergeChunks(['part0', 'part1', 'part2'], {
				onProgress: (event) => progress.push(event)
			});
			assert.deepEqual([...new Uint8Array(result.mergedArray)], [1, 2, 3]);
			assert.equal(result.hasCache, false);
			assert.equal(result.cacheHits, 0);
			assert.deepEqual(progress.at(-1), { total: 3, completed: 3, cacheHits: 0 });
			assert.equal(progress.length, 3);
		}
	);
});

test('partial cache hits merge with local fetches and rejected quota writes are harmless', async () => {
	const fetched = [];
	const progress = [];
	const cache = {
		async match(url) {
			if (url === 'part0') return response([8]);
			if (url === 'part2') return response([6]);
			return undefined;
		},
		put() {
			return Promise.reject(new Error('QuotaExceededError'));
		}
	};
	await withGlobals(
		{
			caches: cacheStorage(cache),
			fetch: async (url) => {
				fetched.push(url);
				return response([9]);
			}
		},
		async () => {
			const result = await fetchAndMergeChunks(['part0', 'part1', 'part2'], {
				onProgress: (event) => progress.push(event)
			});
			assert.deepEqual([...new Uint8Array(result.mergedArray)], [8, 9, 6]);
			assert.equal(result.hasCache, false);
			assert.equal(result.cacheHits, 2);
			assert.deepEqual(fetched, ['part1']);
			assert.deepEqual(progress.at(-1), { total: 3, completed: 3, cacheHits: 2 });
		}
	);
});

test('real Response is cloned before body consumption and cache writes do not block merge', async () => {
	let networkResponse;
	let putResponse;
	let putUrl;
	let cloneWasCalledAfterConsumption;
	let putCalls = 0;
	const cache = {
		async match() {
			return undefined;
		},
		put(url, responseCopy) {
			putCalls += 1;
			putUrl = url;
			putResponse = responseCopy;
			return new Promise(() => {}); // Storage may remain slow; loading must continue.
		}
	};
	await withGlobals(
		{
			caches: cacheStorage(cache),
			fetch: async () => {
				networkResponse = new Response(Uint8Array.from([21, 22]));
				const clone = networkResponse.clone.bind(networkResponse);
				networkResponse.clone = () => {
					cloneWasCalledAfterConsumption = networkResponse.bodyUsed;
					return clone();
				};
				return networkResponse;
			}
		},
		async () => {
			const result = await fetchAndMergeChunks(['part0']);
			assert.deepEqual([...new Uint8Array(result.mergedArray)], [21, 22]);
			assert.equal(networkResponse.bodyUsed, true);
			assert.equal(cloneWasCalledAfterConsumption, false);
			assert.equal(putCalls, 1);
			assert.equal(putUrl, 'part0');
			assert.ok(putResponse instanceof Response);
			assert.equal(putResponse.bodyUsed, false);
		}
	);
});

test('a complete cache hit reports hasCache and does not fetch', async () => {
	let fetchCalls = 0;
	const cache = {
		async match(url) {
			return response([url === 'a' ? 4 : 5]);
		}
	};
	await withGlobals(
		{
			caches: cacheStorage(cache),
			fetch: async () => {
				fetchCalls += 1;
				throw new Error('unexpected fetch');
			}
		},
		async () => {
			const result = await fetchAndMergeChunks(['a', 'b']);
			assert.equal(result.hasCache, true);
			assert.equal(result.cacheHits, 2);
			assert.deepEqual([...new Uint8Array(result.mergedArray)], [4, 5]);
			assert.equal(fetchCalls, 0);
		}
	);
});

test('missing, unavailable, or failing cache reads fall back to fetch', async () => {
	for (const cachesValue of [
		undefined,
		{
			async keys() {
				throw new Error('Cache storage unavailable');
			},
			async open() {
				throw new Error('Cache storage unavailable');
			}
		},
		cacheStorage({
			async match() {
				throw new Error('Cache read failed');
			}
		})
	]) {
		let fetchCalls = 0;
		await withGlobals(
			{
				caches: cachesValue,
				fetch: async () => {
					fetchCalls += 1;
					return response([3]);
				}
			},
			async () => {
				const result = await fetchAndMergeChunks(['only']);
				assert.equal(result.hasCache, false);
				assert.equal(result.cacheHits, 0);
				assert.deepEqual([...new Uint8Array(result.mergedArray)], [3]);
			}
		);
		assert.equal(fetchCalls, 1);
	}
});

test('old-cache cleanup deletes only caches under its own namespace', async () => {
	const deleted = [];
	const storage = {
		async keys() {
			return [
				'onnx-model-cache-v1',
				'onnx-model-cache-v2',
				'onnx-model-cacheish-v3',
				'other-onnx-model-cache-v1'
			];
		},
		async delete(name) {
			deleted.push(name);
			return true;
		},
		async open() {
			return {
				async match() {
					return response([1]);
				}
			};
		}
	};
	await withGlobals({ caches: storage, fetch: async () => response([2]) }, async () => {
		await fetchAndMergeChunks(['part0']);
	});
	assert.deepEqual(deleted, ['onnx-model-cache-v1']);
});

test('abort during cached body reading rejects instead of falling back to a network fetch', async () => {
	const controller = new AbortController();
	const started = deferred();
	const finishRead = deferred();
	let fetchCalls = 0;
	const cache = {
		async match() {
			return {
				async arrayBuffer() {
					started.resolve();
					await finishRead.promise;
					return buffer([1]);
				}
			};
		}
	};
	await withGlobals(
		{
			caches: cacheStorage(cache),
			fetch: async () => {
				fetchCalls += 1;
				return response([2]);
			}
		},
		async () => {
			const loading = fetchAndMergeChunks(['part0'], { signal: controller.signal });
			await started.promise;
			controller.abort();
			finishRead.resolve();
			await assert.rejects(loading, { name: 'AbortError' });
		}
	);
	assert.equal(fetchCalls, 0);
});

test('abort after the final chunk prevents the merge from publishing a buffer', async () => {
	const controller = new AbortController();
	await withGlobals(
		{
			caches: undefined,
			fetch: async () => response([5])
		},
		async () => {
			const loading = fetchAndMergeChunks(['part0'], {
				signal: controller.signal,
				onProgress() {
					controller.abort();
				}
			});
			await assert.rejects(loading, { name: 'AbortError' });
		}
	);
});

test('a non-OK chunk response rejects before a model session can be created', async () => {
	let createCalls = 0;
	const loader = createModelLoader({
		loadChunks: (urls, options) => fetchAndMergeChunks(urls, options),
		createSession: async () => {
			createCalls += 1;
			return { release() {} };
		}
	});
	await withGlobals(
		{
			caches: undefined,
			fetch: async () => response([], { ok: false })
		},
		async () => {
			const handle = loader.acquire({ path: '/model', version: 'v1', chunkUrls: ['part0'] });
			await assert.rejects(handle.promise, /Failed to fetch part0/);
			assert.equal(createCalls, 0);
		}
	);
});

test('model loader deduplicates concurrent owners and creates a session from Uint8Array', async () => {
	let loadCalls = 0;
	let createCalls = 0;
	const session = {
		releaseCalls: 0,
		release() {
			this.releaseCalls += 1;
		}
	};
	const loader = createModelLoader({
		async loadChunks(urls, { onProgress }) {
			loadCalls += 1;
			onProgress({ total: urls.length, completed: 1, cacheHits: 0 });
			return { mergedArray: buffer([10, 11]), hasCache: false, cacheHits: 0 };
		},
		async createSession(bytes, metadata) {
			createCalls += 1;
			assert.ok(bytes instanceof Uint8Array);
			assert.deepEqual([...bytes], [10, 11]);
			assert.deepEqual(metadata, { path: '/model', version: 'v1' });
			return session;
		}
	});
	const events = [];
	const first = loader.acquire({
		path: '/model',
		version: 'v1',
		chunkUrls: ['a', 'b'],
		onProgress: (event) => events.push(event)
	});
	const second = loader.acquire({ path: '/model', version: 'v1', chunkUrls: ['a', 'b'] });
	assert.equal(await first.promise, session);
	assert.equal(await second.promise, session);
	assert.equal(loadCalls, 1);
	assert.equal(createCalls, 1);
	assert.deepEqual(
		events.map(({ stage }) => stage),
		['loading', 'loading', 'initializing', 'ready']
	);
	assert.deepEqual(events.at(-1), {
		stage: 'ready',
		completed: 2,
		total: 2,
		cacheHits: 0,
		hasCache: false
	});
	first.release();
	assert.equal(session.releaseCalls, 0, 'one remaining owner keeps the session alive');
	second.release();
	second.release();
	assert.equal(session.releaseCalls, 1, 'the final release disposes exactly once');
});

test('owner released from its ready callback rejects and disposes the just-created session', async () => {
	const session = {
		releaseCalls: 0,
		release() {
			this.releaseCalls += 1;
		}
	};
	const loader = createModelLoader({
		async loadChunks() {
			return { mergedArray: buffer([1]), hasCache: false, cacheHits: 0 };
		},
		async createSession() {
			return session;
		}
	});
	let handle;
	handle = loader.acquire({
		path: 'model',
		version: '1',
		chunkUrls: ['one'],
		onProgress(event) {
			if (event.stage === 'ready') void handle.release();
		}
	});
	const [settled] = await Promise.allSettled([handle.promise]);
	assert.equal(settled.status, 'rejected');
	assert.equal(settled.reason.name, 'AbortError');
	await handle.release();
	assert.equal(session.releaseCalls, 1);
});

test('ready callback can release another owner without blocking the remaining owner', async () => {
	const session = {
		releaseCalls: 0,
		release() {
			this.releaseCalls += 1;
		}
	};
	const loader = createModelLoader({
		async loadChunks() {
			return { mergedArray: buffer([1]), hasCache: false, cacheHits: 0 };
		},
		async createSession() {
			return session;
		}
	});
	let other;
	const owner = loader.acquire({
		path: 'model',
		version: '1',
		chunkUrls: ['one'],
		onProgress(event) {
			if (event.stage === 'ready') void other.release();
		}
	});
	other = loader.acquire({ path: 'model', version: '1', chunkUrls: ['one'] });
	const [ownerResult, otherResult] = await Promise.allSettled([owner.promise, other.promise]);
	assert.equal(ownerResult.status, 'fulfilled');
	assert.equal(ownerResult.value, session);
	assert.equal(otherResult.status, 'rejected');
	assert.equal(otherResult.reason.name, 'AbortError');
	assert.equal(session.releaseCalls, 0, 'the still-active owner keeps the session alive');
	await owner.release();
	assert.equal(session.releaseCalls, 1);
});

test('same path and version cannot silently reuse a session for different chunks', async () => {
	const loader = createModelLoader({
		async loadChunks() {
			return { mergedArray: buffer([]), hasCache: false, cacheHits: 0 };
		},
		async createSession() {
			return { release() {} };
		}
	});
	const first = loader.acquire({ path: 'model', version: '1', chunkUrls: ['one'] });
	assert.throws(
		() => loader.acquire({ path: 'model', version: '1', chunkUrls: ['other'] }),
		/different chunkUrls/
	);
	await first.promise;
	first.release();
});

test('per-owner release cancels only that consumer and subscriber errors do not break progress', async () => {
	const pending = deferred();
	const loader = createModelLoader({
		loadChunks: () => pending.promise,
		async createSession() {
			return { release() {} };
		}
	});
	const released = loader.acquire({
		path: 'model',
		version: '1',
		chunkUrls: ['one'],
		onProgress() {
			throw new Error('subscriber error');
		}
	});
	const kept = loader.acquire({ path: 'model', version: '1', chunkUrls: ['one'] });
	released.release();
	await assert.rejects(released.promise, { name: 'AbortError' });
	pending.resolve({ mergedArray: buffer([1]), hasCache: false, cacheHits: 0 });
	const session = await kept.promise;
	assert.ok(session);
	kept.release();
});

test('releasing the last pending owner prevents stale session publication and allows retry', async () => {
	const loads = [];
	const signals = [];
	let createCalls = 0;
	const loader = createModelLoader({
		loadChunks(urls, { signal }) {
			const item = deferred();
			loads.push(item);
			signals.push(signal);
			return item.promise;
		},
		async createSession() {
			createCalls += 1;
			return { release() {} };
		}
	});
	const old = loader.acquire({ path: 'model', version: '1', chunkUrls: ['one'] });
	old.release();
	assert.equal(signals[0].aborted, true, 'the final pending owner aborts shared loading');
	await assert.rejects(old.promise, { name: 'AbortError' });
	const current = loader.acquire({ path: 'model', version: '1', chunkUrls: ['one'] });
	loads[0].resolve({ mergedArray: buffer([1]), hasCache: false, cacheHits: 0 });
	await new Promise((resolve) => setImmediate(resolve));
	assert.equal(createCalls, 0, 'abandoned load must not create a session');
	loads[1].resolve({ mergedArray: buffer([2]), hasCache: false, cacheHits: 0 });
	assert.ok(await current.promise);
	assert.equal(createCalls, 1);
	current.release();
});

test('failed loads are removed so a later acquire can retry', async () => {
	let calls = 0;
	const loader = createModelLoader({
		async loadChunks() {
			calls += 1;
			if (calls === 1) throw new Error('temporary network failure');
			return { mergedArray: buffer([7]), hasCache: false, cacheHits: 0 };
		},
		async createSession() {
			return { release() {} };
		}
	});
	const first = loader.acquire({ path: 'model', version: '1', chunkUrls: ['one'] });
	await assert.rejects(first.promise, /temporary network failure/);
	const retry = loader.acquire({ path: 'model', version: '1', chunkUrls: ['one'] });
	assert.ok(await retry.promise);
	assert.equal(calls, 2);
	retry.release();
});

test('late old session cleanup does not dispose or remove a newer entry', async () => {
	const oldCreate = deferred();
	const oldSession = {
		releaseCalls: 0,
		release() {
			this.releaseCalls += 1;
		}
	};
	const newSession = {
		releaseCalls: 0,
		release() {
			this.releaseCalls += 1;
		}
	};
	let createCalls = 0;
	const loader = createModelLoader({
		async loadChunks() {
			return { mergedArray: buffer([1]), hasCache: false, cacheHits: 0 };
		},
		createSession() {
			createCalls += 1;
			return createCalls === 1 ? oldCreate.promise : Promise.resolve(newSession);
		}
	});
	const old = loader.acquire({ path: 'model', version: '1', chunkUrls: ['one'] });
	while (createCalls === 0) await new Promise((resolve) => setImmediate(resolve));
	old.release();
	await assert.rejects(old.promise, { name: 'AbortError' });
	const current = loader.acquire({ path: 'model', version: '1', chunkUrls: ['one'] });
	assert.equal(await current.promise, newSession);
	oldCreate.resolve(oldSession);
	while (oldSession.releaseCalls === 0) await new Promise((resolve) => setImmediate(resolve));
	const another = loader.acquire({ path: 'model', version: '1', chunkUrls: ['one'] });
	assert.equal(await another.promise, newSession);
	assert.equal(newSession.releaseCalls, 0);
	current.release();
	assert.equal(newSession.releaseCalls, 0);
	another.release();
	assert.equal(newSession.releaseCalls, 1);
});
