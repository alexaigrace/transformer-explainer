<script lang="ts">
	import * as d3 from 'd3';
	import { onDestroy } from 'svelte';
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import type {
		MatrixCell,
		MatrixCellElement,
		MatrixCellHandler,
		MatrixColorScale,
		MatrixSvgHandler,
		MatrixTooltipContent,
		MatrixTooltipHandler
	} from '~/utils/matrixTypes';

	const { theme } = resolveConfig(tailwindConfig);

	export let data: (number | null)[][];
	export let cellHeight: number;
	export let cellWidth: number;
	export let rowGap: number = 2;
	export let colGap: number = 0;
	export let transpose: boolean = false;

	export let rowLen: number;
	export let dimension: number;

	export let groupBy: 'row' | 'col' = 'row';
	export let shape: 'circle' | 'rect' = 'rect';
	export let colorScale: string | MatrixColorScale | undefined = undefined;

	export let onMouseOverCell: MatrixCellHandler | undefined = undefined;
	export let onMouseOutCell: MatrixCellHandler | undefined = undefined;
	export let onMouseOutSvg: MatrixSvgHandler | undefined = undefined;
	export let showTooltip: MatrixTooltipHandler | undefined = undefined;
	export let highlightRow: number | undefined = undefined;
	export let highlightCol: number | undefined = undefined;

	let svgEl: SVGSVGElement | undefined;

	$: svgWidth =
		groupBy === 'col'
			? rowLen * cellWidth + (rowLen - 1) * colGap
			: dimension * cellWidth + (dimension - 1) * colGap;
	$: svgHeight =
		groupBy === 'col'
			? dimension * cellHeight + (dimension - 1) * rowGap
			: rowLen * cellHeight + (rowLen - 1) * rowGap;

	type ThemeColorKey = keyof typeof theme.colors;
	const isThemeColorKey = (value: string): value is ThemeColorKey =>
		Object.prototype.hasOwnProperty.call(theme.colors, value);
	const colorKey =
		typeof colorScale === 'string' && isThemeColorKey(colorScale) ? colorScale : 'blue';
	const matrixColorScale =
		typeof colorScale === 'function'
			? colorScale
			: d3.interpolate('white', theme.colors[colorKey][400]);
	type MatrixRow = (number | null)[];
	const isFiniteCell = (value: number | null): value is number =>
		typeof value === 'number' && Number.isFinite(value);

	const drawMatrixSvg = () => {
		if (!svgEl || isDestroyed) return;
		const svg = d3.select<SVGSVGElement, unknown>(svgEl);

		if (onMouseOutSvg) svg.on('mouseleave', onSvgOut);

		if (groupBy === 'col') {
			const cols = svg
				.selectAll<SVGGElement, MatrixRow>('g.g-col')
				.data(data)
				.join('g')
				.attr('class', (d, i) => `g-col g-col-${i} col-${i}`);
			cols.attr('transform', (d, i) => `translate(${i * cellWidth + i * colGap},0)`);

			if (shape === 'rect') {
				cols
					.selectAll<SVGRectElement, MatrixCell>('rect.cell')
					.data((d, colIndex) => d.map((cell, rowIndex) => ({ cell, colIndex, rowIndex })))
					.join('rect')
					.attr('class', (d, i, arr) => {
						const baseClass = `cell row-${i} col-${d.colIndex}`;
						const isLastRow = i === arr.length - 1;
						const isLastCol = d.colIndex === arr.length - 1;
						const lastClass = isLastRow || isLastCol ? ' last' : '';
						return baseClass + lastClass;
					})
					.attr('x', 0)
					.attr('y', (d, i) => i * cellHeight + i * rowGap)
					.attr('width', cellWidth)
					.attr('height', cellHeight)
					.attr('fill', (d) => {
						return isFiniteCell(d.cell)
							? matrixColorScale(d.cell, d.colIndex)
							: theme.colors.gray[200];
					})
					.on('mouseenter', onCellOver)
					.on('mouseleave', onCellOut);
			}
			if (shape === 'circle') {
				cols
					.selectAll<SVGCircleElement, MatrixCell>('circle.cell')
					.data((d, colIndex) => d.map((cell, rowIndex) => ({ cell, colIndex, rowIndex })))
					.join('circle')
					.attr('class', (d, i, arr) => {
						const baseClass = `cell row-${i} col-${d.colIndex}`;
						const isLastRow = i === arr.length - 1;
						const isLastCol = d.colIndex === arr.length - 1;
						const lastClass = isLastRow || isLastCol ? ' last' : '';
						return baseClass + lastClass;
					})
					.attr('cx', 0)
					.attr('cy', (d, i) => i * cellHeight + i * rowGap)
					.attr('r', cellWidth / 2)
					.attr('stroke', theme.colors.gray[500])
					.attr('fill', (d, i) => {
						return isFiniteCell(d.cell) ? matrixColorScale(d.cell, i) : theme.colors.gray[200];
					})
					.on('mouseenter', onCellOver)
					.on('mouseleave', onCellOut);
			}
		}

		if (groupBy === 'row') {
			const rows = svg
				.selectAll<SVGGElement, MatrixRow>('g.g-row')
				.data(data)
				.join('g')
				.attr('class', (d, i) => `g-row g-row-${i} row-${i}`);

			if (shape === 'rect') {
				rows.attr('transform', (d, i) =>
					transpose
						? `translate(${i * cellHeight + i * rowGap},0)`
						: `translate(0,${i * cellHeight + i * rowGap})`
				);

				rows
					.selectAll<SVGRectElement, MatrixCell>('rect.cell')
					.data((d, rowIndex) => d.map((cell, colIndex) => ({ cell, rowIndex, colIndex })))
					.join('rect')
					.attr('class', (d, i, arr) => {
						const baseClass = `cell row-${d.rowIndex} col-${i}`;
						const isLastCol = i === arr.length - 1;
						const isLastRow = d.rowIndex === arr.length - 1;
						const lastClass = isLastRow || isLastCol ? ' last' : '';
						return baseClass + lastClass;
					})
					.attr(transpose ? 'y' : 'x', (d, i) => i * cellWidth + i * colGap)
					.attr(transpose ? 'x' : 'y', 0)
					.attr('width', transpose ? cellHeight : cellWidth)
					.attr('height', transpose ? cellWidth : cellHeight)
					.on('mouseenter', onCellOver)
					.on('mouseleave', onCellOut)
					.attr('fill', (d, i) => {
						if (!isFiniteCell(d.cell)) return theme.colors.gray[200];
						return matrixColorScale(d.cell, i);
					});
			}
			if (shape === 'circle') {
				rows.attr('transform', (d, i) =>
					transpose
						? `translate(${cellHeight / 2 + i * cellHeight + i * rowGap},0)`
						: `translate(0,${cellHeight / 2 + i * cellHeight + i * rowGap})`
				);

				//To prevent the issue where the qkv path target position is misaligned due to circle scaling in Firefox
				rows
					.selectAll<SVGRectElement, number | null>('rect.cell')
					.data((d) => d)
					.join('rect')
					.attr('class', 'cell')
					.attr(transpose ? 'y' : 'x', (d, i) => i * cellWidth + i * colGap)
					.attr(transpose ? 'x' : 'y', (-1 * cellHeight) / 2)
					.attr('width', transpose ? cellHeight : cellWidth)
					.attr('height', transpose ? cellWidth : cellHeight)
					.attr('fill', 'rgba(0,0,0,0)');
				//

				rows
					.selectAll<SVGCircleElement, MatrixCell>('circle.cell')
					.data((d, rowIndex) => d.map((cell, colIndex) => ({ cell, rowIndex, colIndex })))
					.join('circle')
					.attr('class', (d, i, arr) => {
						const baseClass = `cell row-${d.rowIndex} col-${i}`;
						const isLastCol = i === arr.length - 1;
						const isLastRow = d.rowIndex === arr.length - 1;
						const lastClass = isLastRow || isLastCol ? ' last' : '';
						return baseClass + lastClass;
					})
					.attr(transpose ? 'cy' : 'cx', (d, i) => cellWidth / 2 + i * cellWidth + i * colGap)
					.attr(transpose ? 'cx' : 'cy', 0)
					.attr('r', cellWidth / 2)
					.attr('stroke', (d) => (!isFiniteCell(d.cell) ? 'none' : theme.colors.gray[200]))
					.on('mouseenter', onCellOver)
					.on('mouseleave', onCellOut)
					.transition()
					.duration(100)
					.attr('fill', (d, i) => {
						if (!isFiniteCell(d.cell)) return theme.colors.gray[200];
						return matrixColorScale(d.cell, i);
					});
			}
		}
	};

	let isDestroyed = false;
	let animationFrame: number | undefined;
	onDestroy(() => {
		isDestroyed = true;
		if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
		if (svgEl) d3.select(svgEl).selectAll('*').interrupt();
	});

	$: if (data && svgEl && !isDestroyed) {
		drawMatrixSvg();
	}

	// highlighting
	$: {
		if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
		const svg = svgEl;
		if (!svg || isDestroyed) {
			animationFrame = undefined;
		} else {
			animationFrame = requestAnimationFrame(() => {
				animationFrame = undefined;
				if (isDestroyed || !svg.isConnected) return;
				d3.select(svg)
					.selectAll<SVGRectElement | SVGCircleElement, MatrixCell>(shape)
					.attr('class', (d) => {
						const rowIdx = d.rowIndex;
						const colIdx = d.colIndex;
						if (highlightRow !== undefined && highlightCol !== undefined) {
							return rowIdx === highlightRow && colIdx === highlightCol
								? 'cell highlight'
								: 'cell dim';
						}
						if (highlightRow === undefined && highlightCol === undefined) return 'cell';
						if (highlightRow !== undefined) {
							return rowIdx === highlightRow ? 'cell highlight' : 'cell dim';
						}
						return colIdx === highlightCol ? 'cell highlight' : 'cell dim';
					});
			});
		}
	}

	// tooltip
	let tooltipData: MatrixTooltipContent | undefined = undefined;
	let tooltipVisible = false;
	let tooltipX = 0;
	let tooltipY = 0;

	function onCellOver(this: MatrixCellElement, event: Event, data: MatrixCell) {
		onMouseOverCell?.(event, data, this);

		const content = showTooltip?.(event, data.cell);
		if (content) visibleTooltip(event, content);
	}

	function onCellOut(this: MatrixCellElement, event: Event, data: MatrixCell) {
		onMouseOutCell?.(event, data, this);
		hideTooltip();
	}

	function onSvgOut(this: SVGSVGElement, event: Event) {
		onMouseOutSvg?.(event, undefined, this);
		hideTooltip();
	}

	function visibleTooltip(event: Event, content: MatrixTooltipContent) {
		const parentBbox = svgEl?.getBoundingClientRect();
		const target = event.target;
		if (!parentBbox || !(target instanceof Element)) return;
		const bbox = target.getBoundingClientRect();

		tooltipData = content;
		tooltipVisible = true;
		tooltipX = bbox.left + bbox.width / 2 - parentBbox.left;
		tooltipY = bbox.top - parentBbox.top - 10;
	}

	function hideTooltip() {
		tooltipVisible = false;
	}
</script>

<div class="relative">
	<svg
		class="matrix-svg relative"
		bind:this={svgEl}
		width={transpose ? svgHeight : svgWidth}
		height={transpose ? svgWidth : svgHeight}
	>
	</svg>
	{#if tooltipVisible}
		<div
			class="matrix-tooltip divide-gray-200 border border-gray-200 bg-white text-gray-500 shadow-md"
			style="left: {tooltipX}px; top: {tooltipY}px;"
		>
			{#if typeof tooltipData === 'string'}
				{tooltipData}
			{:else if tooltipData}
				<svelte:component this={tooltipData.component} {...tooltipData.props} />
			{/if}
			<div
				class="arrow pointer-events-none absolute block h-[10px] w-[10px] rotate-45 border-b border-e border-inherit bg-inherit"
			></div>
		</div>
	{/if}
</div>

<style lang="scss">
	:global(.cell-text) {
		font-size: 0.6rem;
		font-family: monospace;
		text-anchor: middle;
	}

	:global(.matrix-svg .cell) {
		opacity: 1;
	}
	:global(.matrix-svg .cell.highlight) {
		opacity: 1;
	}
	:global(.matrix-svg .cell.dim) {
		opacity: 0.1 !important;
	}

	.matrix-tooltip {
		position: absolute;
		padding: 0.5rem;
		pointer-events: none;
		transform: translate(-50%, -100%);
		font-family: monospace;
		border-radius: 3px;

		.arrow {
			left: calc(50% - 5px);
			bottom: -5px;
		}
	}
</style>
