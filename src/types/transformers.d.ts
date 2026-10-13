// Transformers.js publishes declarations separately from its tokenizer-only entry points.
declare module '@xenova/transformers/src/tokenizers.js' {
	export { AutoTokenizer } from '@xenova/transformers';
}

declare module '@xenova/transformers/src/env.js' {
	export { env } from '@xenova/transformers';
}
