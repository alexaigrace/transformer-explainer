<script lang="ts">
	import {
		expandedBlock,
		tokens,
		modelData,
		rootRem,
		attentionHeadIdx,
		hoveredMatrixCell,
		blockIdx,
		isExpandOrCollapseRunning,
		userId
	} from '~/store';
	import classNames from 'classnames';
	import Matrix from '~/components/common/Matrix.svelte';
	import { gsap } from '~/utils/gsap';
	import { maskArray } from '~/utils/array';
	import { getContext, onDestroy, onMount } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../tailwind.config';
	import * as d3 from 'd3';
	import Katex from '~/utils/Katex.svelte';
	import Tooltip from 'flowbite-svelte/Tooltip.svelte';
	import { ATTENTION_OUT } from '~/constants/opacity';
	import { ga } from '~/utils/event';
	import ZoomInOutline from 'flowbite-svelte-icons/ZoomInOutline.svelte';
	import TextbookTooltip from '~/components/common/TextbookTooltip.svelte';
	import { t } from '~/i18n';
	import { textPages } from '~/utils/textbookPages';
	import { highlightAttentionPath, removeAttentionPathHighlight } from '~/utils/textbook';
	import type {
		MatrixCellHandler,
		MatrixColorScale,
		MatrixTooltipHandler
	} from '~/utils/matrixTypes';

	const { theme } = resolveConfig(tailwindConfig);

	$: placeHolderData = Array($tokens.length)
		.fill(0)
		.map((col) => Array($tokens.length).fill(-Infinity));
	$: queryKey =
		$modelData?.outputs?.[`block_${$blockIdx}_attn_head_${$attentionHeadIdx}_attn`]?.data ||
		placeHolderData;
	$: masked =
		$modelData?.outputs?.[`block_${$blockIdx}_attn_head_${$attentionHeadIdx}_attn_masked`]?.data ||
		placeHolderData;
	$: softmaxed =
		$modelData?.outputs?.[`block_${$blockIdx}_attn_head_${$attentionHeadIdx}_attn_dropout`]?.data ||
		placeHolderData;

	let factor = 1; //todo
	let maxCellSize = 20 * factor;
	let minCellSize = 10 * factor;
	$: cellSize = Math.min(
		maxCellSize,
		Math.max((1 / $tokens.length) * rootRem * 6 * factor, minCellSize)
	);

	let attentionQK: HTMLDivElement | undefined;
	let attentionMask: HTMLDivElement | undefined;
	let attentionSoftmax: HTMLDivElement | undefined;
	let attentionResult: HTMLDivElement | undefined;

	let attentionMatrixWidth = 0;

	let isAttentionExpanded = false;

	const blockId = getContext<string>('block-id');

	// event handling

	$: if ($expandedBlock.id !== blockId && isAttentionExpanded) {
		isAttentionExpanded = false;
		collapseAttention();
	}
	$: if ($expandedBlock.id === blockId && !isAttentionExpanded) {
		isAttentionExpanded = true;
		expandAttention();
	}

	const onClickAttention = (e: MouseEvent | KeyboardEvent) => {
		e.stopPropagation();
		e.preventDefault();
		textPages.find((page) => page.id === 'masked-self-attention')?.complete?.();

		if (!isAttentionExpanded) {
			expandedBlock.set({ id: blockId });
		}
	};

	let expandableEl: HTMLDivElement | undefined;

	function handleOutsideClick(e: MouseEvent) {
		if (
			isAttentionExpanded &&
			expandableEl &&
			e.target instanceof Node &&
			!expandableEl.contains(e.target)
		) {
			expandedBlock.set({ id: null });
		}
	}
	onMount(() => {
		const mainSection = document.querySelector<HTMLElement>('.main-section');
		if (!mainSection) return;

		mainSection.addEventListener('click', handleOutsideClick);
		return () => {
			mainSection.removeEventListener('click', handleOutsideClick);
		};
	});

	// animation
	let expandTl = gsap.timeline();
	let collapseTl = gsap.timeline();
	let isDestroyed = false;
	let isOwnedAnimationRunning = false;

	// google analytics
	let startTime: number | null = null;

	const getConnectedAttentionElements = () => {
		if (
			isDestroyed ||
			!expandableEl?.isConnected ||
			!attentionQK?.isConnected ||
			!attentionMask?.isConnected ||
			!attentionSoftmax?.isConnected ||
			!attentionResult?.isConnected
		) {
			return undefined;
		}

		return { attentionQK, attentionMask, attentionSoftmax, attentionResult };
	};

	onDestroy(() => {
		isDestroyed = true;
		expandTl.kill();
		collapseTl.kill();
		if (isOwnedAnimationRunning) {
			isOwnedAnimationRunning = false;
			isExpandOrCollapseRunning.set(false);
		}
	});

	const expandAttention = () => {
		const elements = getConnectedAttentionElements();
		if (!elements) return;
		const { attentionQK, attentionMask, attentionSoftmax, attentionResult } = elements;
		highlightAttentionPath();

		isAttentionExpanded = true;
		isOwnedAnimationRunning = true;
		isExpandOrCollapseRunning.set(true);
		collapseTl.progress(1);

		const keyPaths = document.querySelectorAll<SVGPathElement>(
			'div.sankey g.attention path.key-to-attention'
		);
		const queryPaths = document.querySelectorAll<SVGPathElement>(
			'div.sankey g.attention path.query-to-attention'
		);
		const outPaths = document.querySelectorAll<SVGPathElement>(
			'div.sankey g.attention path.to-attention-out'
		);

		[...keyPaths, ...queryPaths].forEach((path) => {
			const length = String(path.getTotalLength());
			path.style.strokeDasharray = length;
			path.style.strokeDashoffset = length;
		});

		const QKDuration = 1.2;
		const stagger = Number((QKDuration / $tokens.length).toFixed(2));

		expandTl
			.set([attentionMask.querySelector('.prev'), attentionSoftmax.querySelector('.prev')], {
				opacity: 1
			})
			.set([attentionMask.querySelector('.main'), attentionSoftmax.querySelector('.main')], {
				opacity: 0
			});
		expandTl.set(outPaths, { opacity: 0 });

		expandTl.to(attentionResult, {
			opacity: 0,
			display: 'none',
			duration: 0.2
		});

		// show QK
		expandTl
			.set(attentionQK, {
				width: 'auto',
				display: 'flex',
				opacity: 0
			})
			.to(attentionQK, {
				opacity: 1,
				duration: 0.5
			})
			.to(keyPaths, {
				strokeDashoffset: 0,
				stagger,
				duration: QKDuration,
				ease: 'power2.out'
				// ease: 'back.out(1.7)'
			})
			.to(
				queryPaths,
				{
					strokeDashoffset: 0,
					stagger,
					duration: QKDuration,
					// ease: 'back.out(1.7)'
					ease: 'power2.out'
				},
				'<'
			)
			.from(
				attentionQK.querySelectorAll('svg circle'),
				{
					scale: 0,
					transformOrigin: '50% 50%',
					opacity: 0,
					delay: QKDuration / $tokens.length,
					stagger: Number((QKDuration / Math.pow($tokens.length, 2)).toFixed(2)),
					ease: 'power2.out',
					// ease: 'back.out(1.7)',
					duration: QKDuration
				},
				'<'
			);

		// show Masked
		expandTl
			.set(attentionMask, { width: 0, x: attentionMatrixWidth * -1, opacity: 0 })
			.to(attentionMask, {
				opacity: 1,
				display: 'flex',
				width: attentionMatrixWidth,
				x: 0,
				duration: 0.5
			})
			.to(attentionMask.querySelector('.prev'), {
				opacity: 0,
				duration: 1
			})
			.to(
				attentionMask.querySelector('.main'),
				{
					opacity: 1,
					duration: 1
				},
				'<'
			);

		// show Softmaxed
		expandTl
			.set(attentionSoftmax, { width: 0, x: attentionMatrixWidth * -1, opacity: 0 })
			.to(attentionSoftmax, {
				opacity: 1,
				display: 'flex',
				width: attentionMatrixWidth,
				x: 0,
				duration: 0.4
			})
			.to(attentionSoftmax.querySelector('.prev'), {
				opacity: 0,
				duration: 1
			})
			.to(
				attentionSoftmax.querySelector('.main'),
				{
					opacity: 1,
					duration: 1
				},
				'<'
			);

		expandTl.to(outPaths, {
			opacity: ATTENTION_OUT,
			onComplete: () => {
				if (isDestroyed) return;
				isOwnedAnimationRunning = false;
				isExpandOrCollapseRunning.set(false);
			}
		});

		startTime = performance.now();
		window.dataLayer?.push({
			event: 'visibility-show',
			visible_name: 'attention-expansion',
			start_time: startTime,
			user_id: $userId
		});
	};

	const collapseAttention = () => {
		const elements = getConnectedAttentionElements();
		if (!elements) return;
		const { attentionQK, attentionMask, attentionSoftmax, attentionResult } = elements;
		removeAttentionPathHighlight();
		const endTime = performance.now();
		const visibleDuration = startTime === null ? 0 : endTime - startTime;

		window.dataLayer?.push({
			event: 'visibility-hide',
			visible_name: 'attention-expansion',
			end_time: endTime,
			visible_duration: visibleDuration,
			user_id: $userId
		});

		isAttentionExpanded = false;
		isOwnedAnimationRunning = true;
		isExpandOrCollapseRunning.set(true);
		expandTl.progress(1);
		collapseTl.to([attentionQK, attentionMask, attentionSoftmax], {
			opacity: 0,
			display: 'none',
			width: 0,
			duration: 0.5
		});

		collapseTl.to(
			attentionResult,
			{
				opacity: 1,
				display: 'flex',
				duration: 0.5,
				onComplete: () => {
					if (isDestroyed) return;
					isOwnedAnimationRunning = false;
					isExpandOrCollapseRunning.set(false);
				}
			},
			0
		);
	};

	// color scale
	const isFiniteCell = (value: number | null): value is number =>
		typeof value === 'number' && Number.isFinite(value);
	let qkColorScale: MatrixColorScale;
	$: qkColorScaleDomain = d3.extent(queryKey.flat().filter(isFiniteCell));
	$: qkColorScale = (d, _i) => {
		return d3
			.scaleLinear<string>()
			.domain([qkColorScaleDomain[0] ?? 0, qkColorScaleDomain[1] ?? 1])
			.range(['white', theme.colors.purple[700]])(d);
	};
	const maskedColorScale: MatrixColorScale = (d, _i) => {
		return d3.scaleLinear<string>().domain([-3, 3]).range(['white', theme.colors.purple[700]])(d);
	};
	const softmaxColorScale: MatrixColorScale = (d, _i) => {
		return d3.interpolate('white', theme.colors['purple'][700])(d);
	};

	const onMouseOverCell: MatrixCellHandler = (_event, data, element) => {
		const rowIdx = data.rowIndex;
		const colIdx = data.colIndex;
		hoveredMatrixCell.set({ row: rowIdx, col: colIdx });
		if (element && isFiniteCell(data.cell)) {
			d3.select(element).attr('stroke', theme.colors.gray[400]);
		}
	};
	const onMouseOutCell: MatrixCellHandler = (_event, data, element) => {
		hoveredMatrixCell.set({ row: null, col: null });
		if (element && isFiniteCell(data.cell)) {
			d3.select(element).attr('stroke', theme.colors.gray[200]);
		}
	};

	const showTooltip: MatrixTooltipHandler = (_event, value) => {
		if (!isFiniteCell(value)) return;
		return value.toFixed(2);
	};
</script>

<div
	class="flex items-center gap-8 px-5"
	style={`--attention-matrix-width: ${attentionMatrixWidth}px;`}
	data-click="attention-matrix"
>
	<!-- QK -->
	<div
		role="none"
		class={classNames('attention-matrix-container relative flex', {
			active: isAttentionExpanded
		})}
		bind:this={expandableEl}
		on:click={onClickAttention}
		on:keydown={onClickAttention}
	>
		<div
			class={classNames('attention-matrix attention-qk flex flex-col items-center', {
				'attention-initial': isAttentionExpanded
			})}
			bind:this={attentionQK}
		>
			<Matrix
				className="main"
				data={queryKey}
				showSize={false}
				cellHeight={cellSize}
				cellWidth={cellSize}
				rowGap={3}
				colGap={3}
				shape={'circle'}
				colorScale={qkColorScale}
				{onMouseOverCell}
				{onMouseOutCell}
				{showTooltip}
			/>
			<TextbookTooltip id="masked-self-attention">
				<div class="matrix-label">{$t('viz.dotProduct')}</div>
			</TextbookTooltip>

			<Tooltip class="popover tooltip">
				<Katex math={'Q \\cdot K^T'}></Katex>
			</Tooltip>
			<div class="color-scale">
				<span class="val">{qkColorScaleDomain[0]?.toFixed(1)}</span>
				<div class="bar"></div>
				<span class="val">{qkColorScaleDomain[1]?.toFixed(1)}</span>
			</div>
		</div>
		<!-- Scaling · Mask -->
		<div
			class="attention-matrix attention-mask flex flex-col items-center"
			bind:this={attentionMask}
		>
			<svg
				class="arrow"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 12H5m14 0-4 4m4-4-4-4"
				/>
			</svg>

			<div>
				<Matrix
					className="prev absolute top-0 left-0 pointer-events-none"
					data={queryKey}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={qkColorScale}
					{onMouseOverCell}
					{onMouseOutCell}
					{showTooltip}
				/>
				<Matrix
					className="main opacity-0"
					data={maskArray(masked)}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={maskedColorScale}
					{onMouseOverCell}
					{onMouseOutCell}
					{showTooltip}
				/>
			</div>
			<TextbookTooltip id="masked-self-attention">
				<div class="matrix-label">{$t('viz.scalingMask')}</div>
			</TextbookTooltip>

			<Tooltip class="popover tooltip">
				<Katex math={'\\frac{QK^T}{\\sqrt{d_k}} + M'}></Katex>
			</Tooltip>
			<div class="color-scale">
				<span class="val">-3.0</span>
				<div class="bar"></div>
				<span class="val">3.0</span>
			</div>
		</div>

		<!-- Softmax -->
		<div
			class={classNames('attention-matrix attention-softmax flex flex-col items-center', {
				'attention-out': isAttentionExpanded
			})}
			bind:this={attentionSoftmax}
		>
			<svg
				class="arrow"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 12H5m14 0-4 4m4-4-4-4"
				/>
			</svg>
			<div>
				<Matrix
					className="prev absolute top-0 left-0  pointer-events-none"
					data={maskArray(masked)}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={maskedColorScale}
					{onMouseOverCell}
					{onMouseOutCell}
					{showTooltip}
				/>
				<Matrix
					className="main opacity-0"
					data={maskArray(softmaxed)}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={softmaxColorScale}
					{onMouseOverCell}
					{onMouseOutCell}
					{showTooltip}
				/>
			</div>

			<TextbookTooltip id="masked-self-attention">
				<div class="matrix-label">{$t('viz.softmax')}</div>
			</TextbookTooltip>
			<Tooltip class="popover tooltip">
				<Katex math={'\\text{softmax}(\\frac{QK^T}{\\sqrt{d_k}} + M)'}></Katex>
			</Tooltip>
			<div class="color-scale">
				<span class="val">0.0</span>
				<div class="bar"></div>
				<span class="val">1.0</span>
			</div>
		</div>
		<div
			class={classNames('attention-matrix attention-result flex flex-col items-center', {
				'attention-initial': !isAttentionExpanded,
				'attention-out': !isAttentionExpanded
			})}
			bind:this={attentionResult}
			bind:offsetWidth={attentionMatrixWidth}
		>
			<Matrix
				className="main"
				data={maskArray(softmaxed)}
				showSize={false}
				cellHeight={cellSize}
				cellWidth={cellSize}
				rowGap={3}
				colGap={3}
				shape={'circle'}
				colorScale={softmaxColorScale}
				{onMouseOverCell}
				{onMouseOutCell}
				{showTooltip}
			/>

			<div class="matrix-label flex items-center gap-1">
				{$t('viz.attention')}
				<ZoomInOutline></ZoomInOutline>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.attention-matrix-container {
		cursor: pointer;
		border-radius: 0.5rem;
		transition: 0.2s background-color;
		gap: 1rem;
		padding: 1rem;
	}

	.attention-matrix-container {
		.attention-qk,
		.attention-mask,
		.attention-softmax {
			display: none;
		}

		:global(.matrix) {
			padding: 0.5rem;
		}
		.matrix-label {
			white-space: nowrap;
			color: theme('colors.gray.400');
		}
		.attention-result {
			.matrix-label:hover {
				color: theme('colors.gray.600');
			}
		}
		.arrow {
			position: absolute;
			left: -1rem;
			top: calc(var(--attention-matrix-width) / 2 - 0.5rem);
			width: 1.2rem;
			height: 1.2rem;
			color: theme('colors.gray.300');
		}

		.attention-matrix {
			position: relative;
		}
	}
	.color-scale {
		position: absolute;
		bottom: -1.2rem;
		height: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0 1rem;
		gap: 0.2rem;

		.bar {
			height: 0.4rem;
			flex: 1 0 0;
			border: 1px solid theme('colors.gray.200');
			background: linear-gradient(90deg, white 0%, theme('colors.purple.700') 100%);
		}
		.val {
			flex-shrink: 0;
			font-family: monospace;
			font-size: 0.7rem;
			color: theme('colors.gray.600');
		}
	}
</style>
