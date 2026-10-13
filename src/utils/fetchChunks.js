const CACHE_PREFIX = 'onnx-model-cache';
const CACHE_NAME = `${CACHE_PREFIX}-v2`;

/** @typedef {{ total: number, completed: number, cacheHits: number }} ChunkProgress */
/** @typedef {{ onProgress?: (progress: ChunkProgress) => void, signal?: AbortSignal }} FetchOptions */
/** @typedef {{ hasCache: boolean, cacheHits: number, mergedArray: ArrayBuffer }} MergedChunks */

/**
 * @param {FetchOptions['onProgress']} onProgress
 * @param {ChunkProgress} progress
 */
function reportProgress(onProgress, progress) {
	if (typeof onProgress !== 'function') return;
	try {
		onProgress({ ...progress });
	} catch {
		// A UI subscriber must not interrupt model loading.
	}
}

/** @param {AbortSignal | undefined} signal */
function throwIfAborted(signal) {
	if (!signal?.aborted) return;
	if (signal.reason instanceof Error) throw signal.reason;
	const error = new Error('The operation was aborted');
	error.name = 'AbortError';
	throw error;
}

/** @param {CacheStorage | undefined} cacheStorage */
async function clearOldCaches(cacheStorage) {
	if (!cacheStorage || typeof cacheStorage.keys !== 'function') return;
	try {
		const cacheNames = await cacheStorage.keys();
		await Promise.all(
			cacheNames
				.filter((name) => name !== CACHE_NAME && name.startsWith(`${CACHE_PREFIX}-`))
				.map(async (name) => {
					try {
						await cacheStorage.delete(name);
					} catch {
						// Cache maintenance is optional and must not prevent a local fetch.
					}
				})
		);
	} catch {
		// Cache storage can be unavailable in restricted browser contexts.
	}
}

/**
 * Fire and observe the write rejection without making model startup wait for
 * persistent storage. `response` is a clone made before the network body is read.
 * @param {Cache} cache
 * @param {string} url
 * @param {Response} response
 */
function writeCacheWithoutWaiting(cache, url, response) {
	try {
		void Promise.resolve(cache.put(url, response)).catch(() => {
			// Quota and cache-write failures must not discard a successful fetch.
		});
	} catch {
		// Some cache implementations throw before returning a promise.
	}
}

/**
 * @param {string[]} chunkUrls
 * @param {FetchOptions} [options]
 * @returns {Promise<{ hasCache: boolean, cacheHits: number, modelBuffers: ArrayBuffer[] }>}
 */
async function fetchModelChunks(chunkUrls, { onProgress, signal } = {}) {
	/** @type {CacheStorage | undefined} */
	let cacheStorage;
	try {
		cacheStorage = globalThis.caches;
	} catch {
		cacheStorage = undefined;
	}

	throwIfAborted(signal);
	await clearOldCaches(cacheStorage);
	throwIfAborted(signal);

	/** @type {Cache | null} */
	let cache = null;
	if (cacheStorage && typeof cacheStorage.open === 'function') {
		try {
			cache = await cacheStorage.open(CACHE_NAME);
		} catch {
			// Cache writes and reads are an optimization; the server copy remains usable.
		}
	}
	throwIfAborted(signal);

	/** @type {(Response | undefined)[]} */
	let cachedResponses = chunkUrls.map(() => undefined);
	if (cache && typeof cache.match === 'function') {
		cachedResponses = await Promise.all(
			chunkUrls.map(async (url) => {
				try {
					return await cache.match(url);
				} catch {
					return undefined;
				}
			})
		);
	}
	throwIfAborted(signal);

	let completed = 0;
	let cacheHits = 0;
	const modelBuffers = await Promise.all(
		chunkUrls.map(async (url, index) => {
			throwIfAborted(signal);
			const cachedResponse = cachedResponses[index];
			if (cachedResponse) {
				try {
					const cachedBuffer = await cachedResponse.arrayBuffer();
					throwIfAborted(signal);
					cacheHits += 1;
					completed += 1;
					reportProgress(onProgress, {
						total: chunkUrls.length,
						completed,
						cacheHits
					});
					return cachedBuffer;
				} catch {
					throwIfAborted(signal);
					// A corrupt or unreadable cache entry falls back to the served chunk.
				}
			}

			throwIfAborted(signal);
			const response = await fetch(url, signal ? { signal } : undefined);
			throwIfAborted(signal);
			if (!response?.ok) {
				const status = response?.status ? ` (HTTP ${response.status})` : '';
				throw new Error(`Failed to fetch ${url}${status}`);
			}

			/** @type {Response | null} */
			let cacheCopy = null;
			if (cache && typeof cache.put === 'function') {
				try {
					cacheCopy = response.clone();
				} catch {
					// A response that cannot be cloned remains usable for this load.
				}
			}

			const modelBuffer = await response.arrayBuffer();
			throwIfAborted(signal);
			if (cache && cacheCopy) writeCacheWithoutWaiting(cache, url, cacheCopy);

			completed += 1;
			reportProgress(onProgress, {
				total: chunkUrls.length,
				completed,
				cacheHits
			});
			return modelBuffer;
		})
	);

	throwIfAborted(signal);
	return {
		hasCache: chunkUrls.length > 0 && cacheHits === chunkUrls.length,
		cacheHits,
		modelBuffers
	};
}

/**
 * Fetches and joins ordered model chunks. Cache API failures use the served
 * files directly, and `hasCache` is true only when every chunk was a cache hit.
 * @param {string[]} urls
 * @param {FetchOptions} [options]
 * @returns {Promise<MergedChunks>}
 */
export async function fetchAndMergeChunks(urls, options = {}) {
	const { hasCache, cacheHits, modelBuffers: chunks } = await fetchModelChunks(urls, options);
	throwIfAborted(options.signal);
	const totalSize = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
	const mergedArray = new Uint8Array(totalSize);
	let offset = 0;
	for (const chunk of chunks) {
		throwIfAborted(options.signal);
		mergedArray.set(new Uint8Array(chunk), offset);
		offset += chunk.byteLength;
	}
	throwIfAborted(options.signal);
	return { hasCache, cacheHits, mergedArray: mergedArray.buffer };
}
