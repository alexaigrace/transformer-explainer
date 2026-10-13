// Import only tokenizer modules; image pipelines and native Sharp are not needed.
import { AutoTokenizer } from '@xenova/transformers/src/tokenizers.js';
import { env } from '@xenova/transformers/src/env.js';

/** @type {Map<string, Promise<import('@xenova/transformers').PreTrainedTokenizer>>} */
const tokenizers = new Map();

/** @param {string} modelRoot Local directory or same-origin URL prefix, ending with '/'. */
export function loadLocalTokenizer(modelRoot) {
	const cached = tokenizers.get(modelRoot);
	if (cached) return cached;

	env.allowLocalModels = true;
	env.allowRemoteModels = false;
	env.localModelPath = modelRoot;
	// The bundled files are authoritative, including on a browser's first visit.
	env.useBrowserCache = false;
	env.useFSCache = false;

	const loading = AutoTokenizer.from_pretrained('gpt2', { local_files_only: true }).catch(
		(error) => {
			tokenizers.delete(modelRoot);
			throw error;
		}
	);
	tokenizers.set(modelRoot, loading);
	return loading;
}
