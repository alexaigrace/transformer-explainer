<script lang="ts">
	import { t } from '~/i18n';
	import { modelMeta, tokens, rootRem } from '~/store';
	import * as d3 from 'd3';
	import { gsap } from '~/utils/gsap';
	import Matrix from '~/components/common/Matrix.svelte';
	import type { MatrixCellHandler, MatrixColorScale, MatrixSvgHandler } from '~/utils/matrixTypes';
	import { onDestroy, onMount } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../../tailwind.config';
	import HelpPopover from '../common/HelpPopover.svelte';
	import WeightPopoverCard from '../common/WeightPopoverCard.svelte';
	import Katex from '~/utils/Katex.svelte';

	export let isOpen = true;

	const { theme } = resolveConfig(tailwindConfig);

	const tokenGap = 6;

	// generate data
	const visibleDimension = 18;
	$: tokenLen = $tokens.length;
	$: inputData = Array(1)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);

	const weightData = Array(visibleDimension * 5)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);
	const biasData = Array(1)
		.fill(0)
		.map((col) =>
			Array(visibleDimension * 5)
				.fill(0)
				.map((d) => Math.random())
		);

	$: logitData = Array(1)
		.fill(0)
		.map((col) =>
			Array(visibleDimension * 5)
				.fill(0)
				.map((d) => Math.random())
		);

	// color scale
	const embeddingColorScale: MatrixColorScale = (d, i) => {
		return d3.interpolate(theme.colors['blue'][100], theme.colors['blue'][400])(d);
	};
	const weightColorScale: MatrixColorScale = (d, i) => {
		return d3.interpolate(theme.colors['gray'][100], theme.colors['gray'][400])(d);
	};
	const logitColorScale: MatrixColorScale = (d, i) => {
		return d3.interpolate(theme.colors['blue'][100], theme.colors['gray'][400])(d);
	};

	// animation
	let isAnimationActive = false;
	let progress = 0;
	let timeline: GSAPTimeline | undefined;
	let animationStartTimeout: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		const activeTimeline = gsap.timeline();
		timeline = activeTimeline;

		activeTimeline.eventCallback('onUpdate', () => {
			progress = activeTimeline.progress();
			if (progress === 1) isAnimationActive = false;
		});

		animationStartTimeout = setTimeout(() => {
			animationStartTimeout = undefined;
			isAnimationActive = true;
			draw();
		}, 300);
	});

	onDestroy(() => {
		if (animationStartTimeout !== undefined) clearTimeout(animationStartTimeout);
		timeline?.kill();
		timeline = undefined;
	});

	const draw = () => {
		const activeTimeline = timeline;
		if (!activeTimeline) return;

		const embeddingRows = d3.selectAll('.weight-popover-content .hidden-state g.g-row').nodes();
		const weightCols = d3.selectAll('.weight-popover-content .lm-head-weights g.g-col').nodes();
		const weightBiasCells = d3.selectAll('.weight-popover-content .lm-head-bias rect').nodes();

		const outRows = d3.selectAll('.weight-popover-content .logits g.g-row').nodes();

		const mulSymbol = d3.select('.weight-popover-content .symbol.mul').node();
		const plusSymbol = d3.select('.weight-popover-content .symbol.plus').node();
		const equalSymbol = d3.select('.weight-popover-content .symbol.equal').node();

		const highlight = '#94a3b8';

		// first row detail animation
		activeTimeline.set(weightBiasCells, { opacity: 0.1 });
		activeTimeline.set('.formula .first-row', { opacity: 1 });
		activeTimeline.set('.formula .total', { opacity: 0 });

		const firstOutputRowRects = d3.select(outRows[0]).selectAll('rect').nodes();
		const firstEmbeddingRowRects = d3.select(embeddingRows[0]).selectAll('rect').nodes();

		firstOutputRowRects.forEach((outputRect, outCellIdx) => {
			const isFirstOutCell = outCellIdx === 0;
			const firstWeightColRects = d3.select(weightCols[outCellIdx]).selectAll('rect').nodes();
			activeTimeline.set(firstEmbeddingRowRects, { opacity: 0.1 });

			firstEmbeddingRowRects.forEach((embeddingRect, i) => {
				//embedding
				activeTimeline
					.fromTo(
						embeddingRect,
						{ opacity: 0.1, strokeWidth: 0 },
						{
							opacity: 1,
							duration: isFirstOutCell ? 0.1 : 0.002,
							strokeWidth: 10,
							stroke: highlight
						}
					)
					.to(
						embeddingRect,
						{
							strokeWidth: 0,
							duration: isFirstOutCell ? 0.1 : 0.002
						},
						'<50%'
					);

				//weights
				activeTimeline
					.fromTo(
						firstWeightColRects[i],
						{ opacity: 0.1, strokeWidth: 0 },
						{
							opacity: 1,
							duration: isFirstOutCell ? 0.1 : 0.002,
							strokeWidth: 10,
							stroke: highlight
						},
						'<-50%'
					)
					.to(
						firstWeightColRects[i],
						{
							strokeWidth: 0,
							duration: isFirstOutCell ? 0.1 : 0.002
						},
						'<50%'
					);
			});

			//symbol
			if (isFirstOutCell) {
				activeTimeline.from(
					[
						mulSymbol,
						equalSymbol,
						'.formula .first-row .part1',
						plusSymbol,
						equalSymbol,
						'.formula .first-row .part2'
					],
					{
						duration: 0.05,
						opacity: 1
					},
					'<50%'
				);

				// activeTimeline.from(
				// 	[plusSymbol, equalSymbol, '.formula .first-row .part2'],
				// 	{
				// 		duration: 0.5,
				// 		opacity: 0.1
				// 	},
				// 	'<'
				// );
			}
			//bias
			activeTimeline
				.fromTo(
					weightBiasCells[outCellIdx],

					{ opacity: 0.1, strokeWidth: 0 },
					{
						opacity: 1,
						duration: isFirstOutCell ? 0.4 : 0.002,
						strokeWidth: 10,
						stroke: highlight
					},
					'<'
				)
				.to(
					weightBiasCells[outCellIdx],

					{
						strokeWidth: 0,
						duration: isFirstOutCell ? 0.4 : 0.002
					},
					'<50%'
				);

			//out
			activeTimeline
				.fromTo(
					outputRect,
					{ opacity: 0, strokeWidth: 0 },
					{
						opacity: 1,
						duration: isFirstOutCell ? 0.4 : 0.002,
						strokeWidth: 10,
						stroke: highlight
					},
					'<-50%'
				)
				.to(
					outputRect,

					{
						strokeWidth: 0,
						duration: isFirstOutCell ? 0.4 : 0.002
					},
					'<50%'
				);

			if (isFirstOutCell) {
				activeTimeline.to('.formula .first-row', { opacity: 0, duration: 0.3 }, '>+1');
				activeTimeline.to('.formula .total', { opacity: 1, duration: 0.3 }, `<`);
			}
		});

		// rest row animation
		let previousRowIdx = 0;

		// out vectors
		outRows.forEach(function (row, rowIdx) {
			if (rowIdx === 0) return;

			const outputCells = d3.select(row).selectAll('rect').nodes();
			const embeddingRowRects = d3.select(embeddingRows[rowIdx]).selectAll('rect').nodes();

			// Check if rowIdx has changed
			if (previousRowIdx !== null && previousRowIdx !== rowIdx) {
				activeTimeline.fromTo(
					embeddingRowRects,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					'<'
				);

				const weightColRects = d3
					.selectAll('.weight-popover-content .lm-head-weights g.g-col rect')
					.nodes();
				activeTimeline.set(weightColRects, { opacity: 0.1 });
				activeTimeline.set(weightBiasCells, { opacity: 0.1 });
			}

			outputCells.forEach((d, colIdx) => {
				const weightColRects = d3.select(weightCols[colIdx]).selectAll('rect').nodes();

				activeTimeline.fromTo(
					weightColRects,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					`<50%`
				);

				activeTimeline.from(
					d,
					{
						opacity: 0,
						duration: 0.01
					},
					`<50%`
				);
				activeTimeline.fromTo(
					weightBiasCells[colIdx],
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					'<'
				);
			});
			previousRowIdx = rowIdx;
		});
	};

	// event
	let highlightCol: number | undefined = undefined;
	let highlightRow: number | undefined = undefined;

	const onMouseOverCell: MatrixCellHandler = (_event, d) => {
		if (isAnimationActive) return;
		highlightRow = d.rowIndex;
		highlightCol = d.colIndex;
	};
	const onMouseOutSvg: MatrixSvgHandler = () => {
		highlightCol = undefined;
		highlightRow = undefined;
	};
</script>

<WeightPopoverCard
	id="logits"
	title={$t('popover.logits.title')}
	bind:isAnimationActive
	{timeline}
	bind:isOpen
>
	<div class="weight-popover-content flex items-center justify-start">
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				{@html $t('popover.outputEmbedding')}
				<HelpPopover id="hidden-states">{$t('popover.logits.embeddingsHelp')}</HelpPopover>
			</div>
			<Matrix
				className="hidden-state"
				data={inputData}
				showSize={false}
				cellHeight={rootRem * 0.8}
				cellWidth={2}
				rowGap={tokenGap}
				colorScale={embeddingColorScale}
				{highlightRow}
			/>
			<div class="size">(1, {$modelMeta.dimension})</div>
		</div>
		<div class="operator"><div class="symbol mul pl-3">&times;</div></div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				{$t('popover.projectionWeights')}
				<HelpPopover id="lm-head-weights">{$t('popover.logits.weightsHelp')}</HelpPopover>
			</div>
			<div class="flex gap-0">
				<Matrix
					className="lm-head-weights"
					data={weightData}
					showSize={false}
					groupBy={'col'}
					cellHeight={2}
					cellWidth={2}
					rowGap={0}
					colorScale={weightColorScale}
					{highlightCol}
				/>
			</div>

			<div class="size">({$modelMeta.dimension}, 50,257)</div>
		</div>
		<div class="operator"><div class="symbol plus">+</div></div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				{$t('popover.projectionBias')}<HelpPopover id="lm-head-bias"
					>{$t('popover.logits.biasHelp')}</HelpPopover
				>
			</div>
			<Matrix
				className="lm-head-bias"
				data={biasData}
				showSize={false}
				groupBy={'col'}
				cellHeight={1}
				cellWidth={8}
				rowGap={0}
				colorScale={weightColorScale}
				highlightRow={highlightCol}
			/>
			<div class="size">(50,257)</div>
		</div>
		<div class="operator"><div class="symbol equal">=</div></div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				{$t('popover.logits.title')}
				<HelpPopover id="logits">{$t('popover.logits.logitsHelp')}</HelpPopover>
			</div>
			<div class="flex">
				<Matrix
					className="logits"
					data={logitData}
					showSize={false}
					cellHeight={rootRem * 0.8}
					cellWidth={2}
					rowGap={tokenGap}
					colorScale={logitColorScale}
					{onMouseOverCell}
					{onMouseOutSvg}
					{highlightCol}
					{highlightRow}
				/>
			</div>
			<div class="size">(1, 50,257)</div>
		</div>
	</div>
	<div class="formula">
		<div class="first-row flex items-center justify-center gap-1">
			<span class="part1">
				<Katex
					displayMode
					math={`
	(Embedding_{1}×Weights_{1,1} + \\cdots + Embedding_{768}×Weights_{768,1})`}
				/>
			</span>
			<span class="part2">
				<Katex displayMode math={`+ Bias_1 = Logits_{1}`} />
			</span>
		</div>
		<div class="total">
			<Katex
				displayMode
				math={`
	\\sum_{d=1}^{768} Embedding_{d} \\cdot Weights_{di} + Bias_j = Logits_{i} 
	`}
			/>
		</div>
	</div>
</WeightPopoverCard>

<style lang="scss">
	.weight-popover-content {
		padding: 3rem 2rem 1.5rem 3.5rem;
		gap: 0.5rem;
	}
	.matrix .title {
		text-align: center;
		line-height: 1.2;
	}
</style>
