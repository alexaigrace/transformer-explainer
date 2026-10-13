import * as ort from 'onnxruntime-web';
import { createModelLoader } from './modelLoader.js';
import { fetchAndMergeChunks } from './fetchChunks.js';
import { modelSession } from '~/store';
import { createSessionPublisher } from './runScope.js';

// A loader is inexpensive at import time. Only browser onMount acquires sessions.
export const localModelLoader = createModelLoader({
	loadChunks: fetchAndMergeChunks,
	createSession: (bytes: Uint8Array) =>
		ort.InferenceSession.create(bytes, { executionProviders: ['wasm'] })
});

export const modelSessionPublisher = createSessionPublisher<ort.InferenceSession>((session) =>
	modelSession.set(session)
);
