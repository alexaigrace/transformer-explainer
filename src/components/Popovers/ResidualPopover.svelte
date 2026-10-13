<script lang="ts">
	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';
	import CommonPopover from './CommonPopover.svelte';
	import { t } from '~/i18n';

	export let offset: PopoverProps['offset'] = undefined;
	export let className: PopoverProps['class'] = undefined;
	export let triggeredBy: PopoverProps['triggeredBy'] = undefined;
	export let trigger: PopoverProps['trigger'] = undefined;
	export let placement: PopoverProps['placement'] = undefined;
	export let reference: PopoverProps['reference'];
</script>

<CommonPopover
	className={className ? `residual-popover ${className}` : 'residual-popover'}
	title={$t('popover.residual.title')}
	{offset}
	{triggeredBy}
	{trigger}
	{placement}
	{reference}
	goTo="article-residual"
>
	<div class="residual-content">
		{$t('popover.residual.body')}
	</div></CommonPopover
>

<style lang="scss">
	.residual-content {
		width: 12rem;
	}
</style>
