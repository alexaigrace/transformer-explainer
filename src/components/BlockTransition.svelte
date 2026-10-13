<script lang="ts">
	import AngleLeftOutline from 'flowbite-svelte-icons/AngleLeftOutline.svelte';
	import AngleRightOutline from 'flowbite-svelte-icons/AngleRightOutline.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import {
		blockIdx,
		blockIdxTemp,
		rootRem,
		modelMeta,
		isOnBlockTransition,
		isBoundingBoxActive,
		expandedBlock,
		weightPopover,
		isOnAnimation,
		userId
	} from '~/store';
	import { textPages } from '~/utils/textbookPages';
	import { t } from '~/i18n';
	import TextbookTooltip from './common/TextbookTooltip.svelte';

	let boundingPos = { left: 0, top: 0, width: 0 };

	const duration = 800;
	let isDestroyed = false;
	let isTransitionActive = false;
	let activeTransitionContainer: HTMLElement | null = null;
	let unsubscribeBlockIdxTemp: (() => void) | undefined;
	const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();

	const scheduleTimeout = (callback: () => void, timeout: number) => {
		let timeoutId: ReturnType<typeof setTimeout>;
		timeoutId = setTimeout(() => {
			pendingTimeouts.delete(timeoutId);
			if (!isDestroyed) callback();
		}, timeout);
		pendingTimeouts.add(timeoutId);
	};

	const asyncUpdateBlockIdx = (timeout = duration) => {
		scheduleTimeout(() => {
			$blockIdx = $blockIdxTemp;
		}, timeout);
	};

	const animateBlockTransition = async (
		animationClass: 'animate-forward' | 'animate-backward',
		asyncTime = duration
	) => {
		await tick();
		if (isDestroyed) return;

		const container = document.querySelector<HTMLElement>('.steps .blocks');
		if (!container) {
			asyncUpdateBlockIdx(asyncTime);
			return;
		}

		isTransitionActive = true;
		activeTransitionContainer = container;
		isOnBlockTransition.set(true);
		await tick();
		if (isDestroyed) return;
		if (!container.isConnected) {
			isTransitionActive = false;
			activeTransitionContainer = null;
			isOnBlockTransition.set(false);
			asyncUpdateBlockIdx(asyncTime);
			return;
		}

		container.classList.add(animationClass);
		await tick();
		if (isDestroyed) return;
		if (!container.isConnected) {
			container.classList.remove(animationClass);
			isTransitionActive = false;
			activeTransitionContainer = null;
			isOnBlockTransition.set(false);
			asyncUpdateBlockIdx(asyncTime);
			return;
		}

		asyncUpdateBlockIdx(asyncTime);

		scheduleTimeout(() => {
			if (container.isConnected) container.classList.remove(animationClass);
			if (activeTransitionContainer === container) activeTransitionContainer = null;
			isTransitionActive = false;
			isOnBlockTransition.set(false);
		}, duration);
	};

	const animateForwardTransition = ({ asyncTime = duration }: { asyncTime?: number } = {}) =>
		animateBlockTransition('animate-forward', asyncTime);

	const animateBackwardTransition = ({ asyncTime = duration }: { asyncTime?: number } = {}) =>
		animateBlockTransition('animate-backward', asyncTime);

	let currentBlockIdx = $blockIdxTemp;

	unsubscribeBlockIdxTemp = blockIdxTemp.subscribe((newIdx) => {
		if (newIdx === currentBlockIdx) return;

		// 2->1
		if (currentBlockIdx === 1 && newIdx === 0) {
			animateBackwardTransition({ asyncTime: 0 });
			currentBlockIdx = newIdx;
			return;
		}
		//11->12
		if (currentBlockIdx === $modelMeta.layer_num - 2 && newIdx === $modelMeta.layer_num - 1) {
			animateForwardTransition({ asyncTime: 0 });
			currentBlockIdx = newIdx;
			return;
		}

		// 12->1
		if (currentBlockIdx === $modelMeta.layer_num - 1 && newIdx === 0) {
			animateForwardTransition();
			currentBlockIdx = newIdx;
			return;
		}
		// 1->12
		if (newIdx === $modelMeta.layer_num - 1 && currentBlockIdx === 0) {
			animateBackwardTransition();
			currentBlockIdx = newIdx;
			return;
		}

		if (newIdx > currentBlockIdx) {
			animateForwardTransition();
			currentBlockIdx = newIdx;
			return;
		}

		if (newIdx < currentBlockIdx) {
			animateBackwardTransition();
			currentBlockIdx = newIdx;
			return;
		}
	});

	onDestroy(() => {
		isDestroyed = true;
		unsubscribeBlockIdxTemp?.();
		for (const timeoutId of pendingTimeouts) clearTimeout(timeoutId);
		pendingTimeouts.clear();

		if (isTransitionActive) {
			if (activeTransitionContainer?.isConnected) {
				activeTransitionContainer.classList.remove('animate-forward', 'animate-backward');
			}
			isTransitionActive = false;
			activeTransitionContainer = null;
			isOnBlockTransition.set(false);
		}
	});

	// transformer block bounding
	onMount(() => {
		const setPosition = () => {
			const scrollLeft = window.scrollX;
			const topbarHeight = document.querySelector<HTMLElement>('.top-bar')?.offsetHeight ?? 0;

			const embedding = document.querySelector<HTMLElement>(
				'.step.qkv .content .block-start-column'
			);
			const block =
				$blockIdx === $modelMeta.layer_num - 1
					? document.querySelector<HTMLElement>('.step.transformer-blocks .content .column.final')
					: document.querySelector<HTMLElement>('.step.transformer-blocks .content');
			if (!embedding || !block) return;

			const embeddingRect = embedding.getBoundingClientRect();
			const blockRect = block.getBoundingClientRect();

			boundingPos = {
				left: embeddingRect.left + scrollLeft + rootRem,
				top: embeddingRect.top - topbarHeight,
				width: blockRect.left - embeddingRect.left - rootRem
			};
		};
		setPosition();

		const resizeObserver = new ResizeObserver(() => {
			setPosition();
		});
		const elements = document.querySelectorAll<HTMLElement>('.resize-watch');
		elements.forEach((el) => resizeObserver.observe(el));

		return () => resizeObserver.disconnect();
	});

	const onClickNext = (e: MouseEvent) => {
		e.stopPropagation();
		textPages.find((page) => page.id === 'blocks')?.complete?.();

		$blockIdxTemp = $blockIdxTemp < $modelMeta.layer_num - 1 ? $blockIdxTemp + 1 : 0;

		window.dataLayer?.push({
			event: `pagination-transformer-block-next`,
			page_num: $blockIdxTemp,
			pagination_name: 'transformer-block',
			user_id: $userId
		});
	};
	const onClickPrev = (e: MouseEvent) => {
		e.stopPropagation();
		textPages.find((page) => page.id === 'blocks')?.complete?.();

		$blockIdxTemp = $blockIdxTemp > 0 ? $blockIdxTemp - 1 : $modelMeta.layer_num - 1;

		window.dataLayer?.push({
			event: `pagination-transformer-block-prev`,
			page_num: $blockIdxTemp,
			pagination_name: 'transformer-block',
			user_id: $userId
		});
	};
</script>

<div
	class="transformer-bounding"
	class:active={$isBoundingBoxActive}
	style={`left:${boundingPos.left}px;top:${boundingPos.top - rootRem * 3.5}px;width:${boundingPos.width}px;`}
></div>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="transformer-bounding-title"
	data-click="transformer-bounding-title"
	class:deactive={!!$weightPopover}
	class:hide={!!$expandedBlock.id}
	on:mouseenter={() => {
		isBoundingBoxActive.set(true);
	}}
	on:mouseleave={() => {
		isBoundingBoxActive.set(false);
	}}
	style={`top:${boundingPos.top - rootRem * 3.5}px;`}
	class:active={$isBoundingBoxActive}
>
	<TextbookTooltip id="blocks">
		<span class="title-text">Transformer Block {$blockIdxTemp + 1}</span>
	</TextbookTooltip>
	<button
		data-click="transformer-block-prev-btn"
		aria-label={$t('viz.previousBlock')}
		on:click={onClickPrev}
		disabled={$isOnAnimation || $isOnBlockTransition || $blockIdxTemp === 0}
		><AngleLeftOutline size="sm" /></button
	>
	<button
		data-click="transformer-block-next-btn"
		aria-label={$t('viz.nextBlock')}
		on:click={onClickNext}
		disabled={$isOnAnimation || $isOnBlockTransition || $blockIdxTemp === $modelMeta.layer_num - 1}
		><AngleRightOutline size="sm" /></button
	>
</div>

<style lang="scss">
	.transformer-bounding-title {
		&.deactive {
			pointer-events: none;
		}
		position: absolute;
		left: 13rem;
		transform: translate(0, calc(-100% - 0.2rem));
		z-index: $BOUNDING_BOX_INDEX;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.3rem;
		color: theme('colors.gray.400');
		transition: opacity 0.2s;

		&.hide {
			opacity: 0;
		}

		.title-text {
			width: 10rem;
			white-space: nowrap;
			text-align: center;
			font-weight: 500;
		}

		button {
			border-radius: 0.3rem;
			padding: 0.1rem;
			border: 1px solid theme('colors.gray.300');
			color: theme('colors.gray.400');
			box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
		}
		button:disabled {
			color: theme('colors.gray.200');
			border: 1px solid theme('colors.gray.200');
		}

		&.active {
			color: theme('colors.blue.600');

			button {
				border: 1px solid theme('colors.blue.500');
				color: theme('colors.blue.600');
			}
			button:disabled {
				border: 1px solid theme('colors.blue.300');
				color: theme('colors.blue.300');
			}
		}
	}
	.transformer-bounding {
		position: absolute;
		opacity: 1;
		z-index: $BOUNDING_BOX_INDEX;
		pointer-events: none;
		height: calc(95% - 3.5rem);
		border-radius: 1rem;
		transition: all 0.2s;

		&.active {
			border: 2px dashed theme('colors.blue.400');
		}
	}
</style>
