/**
 * Tracks operations that must finish before their model session is released.
 * Aborting stops UI publication; an already running WASM call still settles.
 */
export function createRunScope() {
	const controller = new AbortController();
	/** @type {Set<Promise<unknown>>} */
	const pending = new Set();
	let closed = false;
	/** @type {Promise<void> | undefined} */
	let closing;
	return {
		signal: controller.signal,
		/** @template T @param {Promise<T>} promise @returns {Promise<T>} */
		track(promise) {
			pending.add(promise);
			void promise.then(
				() => pending.delete(promise),
				() => pending.delete(promise)
			);
			return promise;
		},
		/** @param {() => void | Promise<void>} release @returns {Promise<void>} */
		close(release) {
			if (closed) return closing ?? Promise.resolve();
			closed = true;
			controller.abort();
			closing = Promise.allSettled([...pending]).then(async () => {
				await release();
			});
			return closing;
		}
	};
}

/**
 * Session identity alone cannot distinguish two pages sharing the same session.
 * @template T
 * @param {(session: T | undefined) => void} write
 */
export function createSessionPublisher(write) {
	/** @type {symbol | undefined} */
	let publishedBy;
	/** @type {(() => void) | undefined} */
	let revoke;
	return {
		/** @param {symbol} owner @param {() => void} [invalidate] */
		reserve(owner, invalidate) {
			const previousRevoke = publishedBy !== owner ? revoke : undefined;
			publishedBy = owner;
			revoke = invalidate;
			write(undefined);
			previousRevoke?.();
		},
		/** @param {symbol} owner @param {T} session */
		publish(owner, session) {
			if (publishedBy !== owner) return false;
			write(session);
			return true;
		},
		/** @param {symbol} owner */
		clear(owner) {
			if (publishedBy !== owner) return false;
			publishedBy = undefined;
			revoke = undefined;
			write(undefined);
			return true;
		}
	};
}
