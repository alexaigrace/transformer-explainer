// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	interface Window {
		dataLayer?: Array<Record<string, unknown>>;
	}
	var gtag: ((event: 'event', name: string, params?: Record<string, unknown>) => void) | undefined;
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
