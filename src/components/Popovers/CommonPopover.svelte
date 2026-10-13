<script lang="ts">
	import classNames from 'classnames';
	import Popover from 'flowbite-svelte/Popover.svelte';
	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';
	import { onMount } from 'svelte';
	import { userId } from '~/store';
	import { onClickReadMore } from '~/utils/event';
	import { t } from '~/i18n';

	export let offset: PopoverProps['offset'] = undefined;
	export let className: PopoverProps['class'] = undefined;
	export let triggeredBy: PopoverProps['triggeredBy'] = undefined;
	export let trigger: PopoverProps['trigger'] = 'hover';
	export let placement: PopoverProps['placement'] = 'right';
	export let title: PopoverProps['title'] = undefined;
	export let goTo: string | undefined = undefined;
	export let reference: PopoverProps['reference'] | undefined = undefined;

	$: interactive = Boolean(goTo);
	let isOpen = false;
	let contentElement: HTMLDivElement;
	let triggerElements: HTMLElement[] = [];
	let lastTriggerElement: HTMLElement | undefined;

	let startTime: number | undefined;
	const onShow = (e: CustomEvent<boolean>) => {
		startTime = e.timeStamp;
		window.dataLayer?.push({
			event: 'visibility-show',
			visible_name: `help-popover-${className}`,
			start_time: e.timeStamp,
			user_id: $userId
		});
	};
	const onHide = (e: CustomEvent<boolean>) => {
		window.dataLayer?.push({
			event: 'visibility-hide',
			visible_name: `help-popover-${className}`,
			end_time: e.timeStamp,
			visible_duration: e.timeStamp - (startTime || 0),
			user_id: $userId
		});
	};

	function handleEscape(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !interactive || !isOpen) return;

		event.preventDefault();
		event.stopPropagation();
		isOpen = false;
		const returnTarget =
			triggerElements.find((element) => element === document.activeElement) ??
			(lastTriggerElement?.isConnected ? lastTriggerElement : triggerElements[0]);
		returnTarget?.focus({ preventScroll: true });
	}

	function listenForEscape(node: HTMLElement) {
		node.addEventListener('keydown', handleEscape);
		return { destroy: () => node.removeEventListener('keydown', handleEscape) };
	}

	function handleFocusOut() {
		window.setTimeout(() => {
			const activeElement = document.activeElement;
			const focusStayedInPopover =
				activeElement instanceof Node &&
				(triggerElements.some((element) => element.contains(activeElement)) ||
					contentElement?.contains(activeElement));
			const pointerStayedInPopover =
				triggerElements.some((element) => element.matches(':hover')) ||
				contentElement?.closest('.popover')?.matches(':hover');

			if (!focusStayedInPopover && !pointerStayedInPopover) isOpen = false;
		}, 0);
	}

	onMount(() => {
		if (!interactive || !triggeredBy) return;

		triggerElements = Array.from(document.querySelectorAll<HTMLElement>(triggeredBy));
		const handleTriggerFocus = (event: FocusEvent) => {
			const triggerElement = event.currentTarget as HTMLElement;
			lastTriggerElement = triggerElement;
			if (triggerElement.matches(':focus-visible')) isOpen = true;
		};
		const rememberTrigger = (event: Event) => {
			lastTriggerElement = event.currentTarget as HTMLElement;
		};
		const handleTriggerKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') handleEscape(event);
			// Flowbite toggles a click-triggered popover. Reset the focus-open state
			// before native Enter/Space activation so the click opens it instead.
			if (trigger === 'click' && (event.key === 'Enter' || event.key === ' ')) {
				isOpen = false;
			}
		};
		const handleTriggerFocusOut = () => handleFocusOut();

		triggerElements.forEach((element) => {
			element.addEventListener('mouseenter', rememberTrigger);
			element.addEventListener('click', rememberTrigger);
			element.addEventListener('focusin', handleTriggerFocus);
			element.addEventListener('keydown', handleTriggerKeydown);
			element.addEventListener('focusout', handleTriggerFocusOut);
		});

		return () => {
			triggerElements.forEach((element) => {
				element.removeEventListener('mouseenter', rememberTrigger);
				element.removeEventListener('click', rememberTrigger);
				element.removeEventListener('focusin', handleTriggerFocus);
				element.removeEventListener('keydown', handleTriggerKeydown);
				element.removeEventListener('focusout', handleTriggerFocusOut);
			});
		};
	});
</script>

<!-- bug: {triggeredBy} prop triggers show event twice -->
<Popover
	class={classNames('popover text-sm', className)}
	{title}
	{placement}
	{reference}
	{trigger}
	{triggeredBy}
	activeContent={true}
	bind:open={isOpen}
	role={interactive ? 'dialog' : 'tooltip'}
	aria-label={interactive ? title || $t('popover.help') : undefined}
	offset={offset ?? 1}
	arrow={false}
	data-click={`popover-${className}`}
	on:show={(e) => {
		if (e.detail) {
			onShow(e);
		} else {
			onHide(e);
		}
	}}
>
	<div
		class="content"
		bind:this={contentElement}
		tabindex="-1"
		use:listenForEscape
		on:focusout={handleFocusOut}
	>
		<slot></slot>
		{#if goTo}
			<button
				type="button"
				class="more-btn mt-1 text-blue-600 hover:underline"
				on:click={(e) =>
					onClickReadMore(e, goTo, {
						value: title
					})}
				data-click={`read-more-btn-${className}`}
			>
				{$t('popover.readMore')}
			</button>
		{/if}
	</div></Popover
>

<style lang="scss">
	.more-btn {
		cursor: pointer;
		border: 0;
		padding: 0;
		background: transparent;
		font: inherit;
	}
</style>
