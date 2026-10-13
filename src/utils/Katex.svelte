<script lang="ts">
	import katex from 'katex';

	export let math: string;
	export let displayMode = false;
	export let style: string | undefined = undefined;

	$: options = {
		displayMode,
		throwOnError: false,
		style
	};

	$: katexString = katex.renderToString(math, options);
</script>

{@html katexString}
