/** @typedef {{ release: () => void | Promise<void> }} ReleasableSession */
/** @typedef {{ total: number, completed: number, cacheHits: number }} ChunkProgress */
/** @typedef {{ stage: 'loading' | 'initializing' | 'ready', completed: number, total: number, cacheHits: number, hasCache?: boolean }} ModelProgress */
/** @typedef {{ path: string, version: string }} ModelMetadata */
/** @typedef {{ mergedArray: ArrayBuffer, hasCache: boolean, cacheHits: number }} ChunkResult */
/** @typedef {{ path: string, version?: string | number, chunkUrls: string[], onProgress?: (progress: ModelProgress) => void }} AcquireOptions */

/**
 * @template TSession
 * @typedef {{ active: boolean, settled: boolean, onProgress?: (progress: ModelProgress) => void, resolve: (session: TSession) => void, reject: (reason: unknown) => void }} ModelLoaderOwner<TSession>
 */

/**
 * @template TSession
 * @typedef {{ key: string, path: string, version: string, chunkUrls: string[], owners: Set<ModelLoaderOwner<TSession>>, controller: AbortController | null, state: 'loading' | 'session' | 'failed' | 'released', progress: ModelProgress, started: boolean, abandoned: boolean, session: TSession | null, disposePromise: Promise<void> | null }} ModelLoaderEntry<TSession>
 */

/**
 * @template TSession
 * @typedef {{ promise: Promise<TSession>, release: () => Promise<void> }} ModelLoaderHandle<TSession>
 */

/**
 * @template TSession
 * @typedef {{
 *   loadChunks: (urls: string[], options: { onProgress: (progress: ChunkProgress) => void, signal?: AbortSignal }) => Promise<ChunkResult>,
 *   createSession: (bytes: Uint8Array, metadata: ModelMetadata) => TSession | Promise<TSession>
 * }} ModelLoaderDependencies<TSession>
 */

/**
 * @template TSession
 * @typedef {{ acquire: (options: AcquireOptions) => ModelLoaderHandle<TSession> }} ModelLoader<TSession>
 */

/** @returns {Error} */
function makeAbortError() {
	const error = new Error('Model loading was released before it was ready');
	error.name = 'AbortError';
	return error;
}

/**
 * @template {ReleasableSession} TSession
 * @param {TSession | null} session
 * @returns {Promise<void>}
 */
function disposeSession(session) {
	if (!session) return Promise.resolve();
	try {
		return Promise.resolve(session.release()).catch(() => {});
	} catch {
		return Promise.resolve();
	}
}

/** @param {ModelProgress} progress @returns {ModelProgress} */
function copyProgress(progress) {
	return { ...progress };
}

/**
 * Creates a reference-counted loader for ONNX sessions.
 *
 * @template {ReleasableSession} TSession
 * @param {ModelLoaderDependencies<TSession>} dependencies
 * @returns {ModelLoader<TSession>}
 */
export function createModelLoader({ loadChunks, createSession }) {
	if (typeof loadChunks !== 'function') throw new TypeError('loadChunks must be a function');
	if (typeof createSession !== 'function') throw new TypeError('createSession must be a function');

	/** @type {Map<string, ModelLoaderEntry<TSession>>} */
	const entries = new Map();

	/** @param {ModelLoaderEntry<TSession>} entry @param {ModelProgress} progress */
	function notify(entry, progress) {
		entry.progress = copyProgress(progress);
		for (const owner of [...entry.owners]) {
			if (!owner.active || typeof owner.onProgress !== 'function') continue;
			try {
				owner.onProgress(copyProgress(entry.progress));
			} catch {
				// A UI subscriber must not interrupt a shared model load.
			}
		}
	}

	/** @param {ModelLoaderEntry<TSession>} entry */
	function isCurrentAndOwned(entry) {
		return !entry.abandoned && entry.owners.size > 0 && entries.get(entry.key) === entry;
	}

	/** @param {ModelLoaderEntry<TSession>} entry */
	function removeIfCurrent(entry) {
		if (entries.get(entry.key) === entry) entries.delete(entry.key);
	}

	/** @param {ModelLoaderOwner<TSession>} owner @param {TSession} session */
	function resolveOwner(owner, session) {
		if (!owner.active || owner.settled) return;
		owner.settled = true;
		owner.resolve(session);
	}

	/** @param {ModelLoaderOwner<TSession>} owner @param {unknown} reason */
	function rejectOwner(owner, reason) {
		if (owner.settled) return;
		owner.settled = true;
		owner.reject(reason);
	}

	/** @param {ModelLoaderEntry<TSession>} entry @param {unknown} error */
	function failEntry(entry, error) {
		entry.state = 'failed';
		entry.abandoned = true;
		removeIfCurrent(entry);
		try {
			entry.controller?.abort();
		} catch {
			// Failure is already reported; sibling fetches are only best-effort to stop.
		}
		for (const owner of entry.owners) {
			if (!owner.active) continue;
			owner.active = false;
			rejectOwner(owner, error);
		}
		entry.owners.clear();
	}

	/** @param {ModelLoaderEntry<TSession>} entry @returns {Promise<void>} */
	async function startEntry(entry) {
		entry.started = true;
		try {
			const result = await loadChunks([...entry.chunkUrls], {
				signal: entry.controller?.signal,
				onProgress: (progress) => {
					if (!isCurrentAndOwned(entry)) return;
					const { total, completed, cacheHits } = progress;
					const normalizedTotal = Number.isFinite(total)
						? Math.max(0, total)
						: entry.chunkUrls.length;
					const normalizedCompleted = Number.isFinite(completed)
						? Math.min(normalizedTotal, Math.max(0, completed))
						: 0;
					const normalizedCacheHits = Number.isFinite(cacheHits)
						? Math.min(normalizedCompleted, Math.max(0, cacheHits))
						: 0;
					notify(entry, {
						stage: 'loading',
						total: normalizedTotal,
						completed: normalizedCompleted,
						cacheHits: normalizedCacheHits
					});
				}
			});

			if (!isCurrentAndOwned(entry)) return;

			const total = entry.chunkUrls.length;
			const cacheHits = result.cacheHits;
			const reportedHits = Number.isFinite(cacheHits)
				? Math.max(0, Math.min(total, cacheHits))
				: result.hasCache
					? total
					: 0;
			const hasCache = total > 0 && result.hasCache && reportedHits === total;
			notify(entry, {
				stage: 'initializing',
				completed: total,
				total,
				cacheHits: reportedHits,
				hasCache
			});
			if (!isCurrentAndOwned(entry)) return;

			const session = await createSession(new Uint8Array(result.mergedArray), {
				path: entry.path,
				version: entry.version
			});

			if (!isCurrentAndOwned(entry)) {
				await disposeSession(session);
				return;
			}

			entry.state = 'session';
			entry.session = session;
			notify(entry, {
				stage: 'ready',
				completed: total,
				total,
				cacheHits: reportedHits,
				hasCache
			});
			for (const owner of [...entry.owners]) resolveOwner(owner, session);
		} catch (error) {
			if (isCurrentAndOwned(entry)) failEntry(entry, error);
		}
	}

	/** @param {ModelLoaderEntry<TSession>} entry @param {ModelLoaderOwner<TSession>} owner */
	function releaseOwner(entry, owner) {
		if (!owner.active) return entry.disposePromise ?? Promise.resolve();
		owner.active = false;
		entry.owners.delete(owner);

		// Promise settlement is per owner. `entry.state` can already be `session`
		// while its ready notification is running synchronously.
		rejectOwner(owner, makeAbortError());
		if (entry.owners.size > 0) return Promise.resolve();

		entry.abandoned = true;
		removeIfCurrent(entry);
		if (entry.state === 'session') {
			const session = entry.session;
			entry.session = null;
			entry.state = 'released';
			entry.disposePromise = disposeSession(session);
			return entry.disposePromise;
		}

		try {
			entry.controller?.abort();
		} catch {
			// Abort is best-effort; the ownership checks still prevent stale publish.
		}
		return Promise.resolve();
	}

	return {
		/**
		 * Acquire one owner of a path/version session. Owners share loading and the
		 * session until every returned handle has been released.
		 * @param {AcquireOptions} options
		 * @returns {ModelLoaderHandle<TSession>}
		 */
		acquire({ path, version = '', chunkUrls, onProgress }) {
			if (path === undefined || path === null || String(path).length === 0) {
				throw new TypeError('path is required');
			}
			if (!Array.isArray(chunkUrls)) throw new TypeError('chunkUrls must be an array');

			const normalizedPath = String(path);
			const normalizedVersion = String(version);
			const normalizedUrls = chunkUrls.map(String);
			const key = JSON.stringify([normalizedPath, normalizedVersion]);
			let entry = entries.get(key);

			if (
				entry &&
				(entry.chunkUrls.length !== normalizedUrls.length ||
					entry.chunkUrls.some((url, index) => url !== normalizedUrls[index]))
			) {
				throw new Error(
					`Model ${normalizedPath}@${normalizedVersion} was acquired with different chunkUrls`
				);
			}

			if (!entry) {
				entry = {
					key,
					path: normalizedPath,
					version: normalizedVersion,
					chunkUrls: normalizedUrls,
					owners: new Set(),
					controller: typeof AbortController === 'function' ? new AbortController() : null,
					state: 'loading',
					progress: {
						stage: 'loading',
						completed: 0,
						total: normalizedUrls.length,
						cacheHits: 0
					},
					started: false,
					abandoned: false,
					session: null,
					disposePromise: null
				};
				entries.set(key, entry);
			}

			/** @type {(session: TSession) => void} */
			let resolvePromise = () => {};
			/** @type {(reason: unknown) => void} */
			let rejectPromise = () => {};
			const promise = new Promise((resolve, reject) => {
				resolvePromise = resolve;
				rejectPromise = reject;
			});
			// A caller may release while loading without ever awaiting its promise.
			// Mark the rejection handled while preserving it for callers that do await.
			void promise.catch(() => {});
			/** @type {ModelLoaderOwner<TSession>} */
			const owner = {
				active: true,
				settled: false,
				onProgress,
				resolve: resolvePromise,
				reject: rejectPromise
			};
			entry.owners.add(owner);

			if (entry.state === 'session') {
				const session = entry.session;
				if (!session) throw new Error('Session entry has no session');
				if (typeof owner.onProgress === 'function') {
					try {
						owner.onProgress(copyProgress(entry.progress));
					} catch {
						// A UI subscriber must not interrupt session reuse.
					}
				}
				resolveOwner(owner, session);
			} else {
				if (typeof owner.onProgress === 'function') {
					try {
						owner.onProgress(copyProgress(entry.progress));
					} catch {
						// A UI subscriber must not interrupt model loading.
					}
				}
				if (!entry.started) void startEntry(entry);
			}

			return {
				promise,
				release: () => releaseOwner(entry, owner)
			};
		}
	};
}
