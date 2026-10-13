<script lang="ts">
	import {
		isTextbookOpen,
		textbookCurrentPage,
		textbookCurrentPageId,
		textbookPreviousPage,
		textbookOpener,
		userId
	} from '~/store';
	import { textPages } from '~/utils/textbookPages';

	export let id: string;

	function openTextbook(e: MouseEvent | KeyboardEvent) {
		e.stopPropagation();
		e.preventDefault();

		const pageIndex = textPages.findIndex((page) => page.id === id);
		if (pageIndex !== -1) {
			textbookPreviousPage.set($textbookCurrentPage);
			textbookOpener.set(e.currentTarget instanceof HTMLElement ? e.currentTarget : null);
			isTextbookOpen.set(true);
			textbookCurrentPage.set(pageIndex);
			textbookCurrentPageId.set(id);
		}

		window.dataLayer?.push({
			event: `open-textbook`,
			page_id: id,
			open_via: 'tooltip',
			user_id: $userId
		});
	}
</script>

<div
	{id}
	class="textbook-tooltip"
	data-click={`textbook-tooltip`}
	on:click={openTextbook}
	role="button"
	tabindex="0"
	on:keydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			openTextbook(e);
		}
	}}
>
	<slot></slot>
</div>

<style lang="scss">
	.textbook-tooltip {
		cursor: help;
	}
</style>
