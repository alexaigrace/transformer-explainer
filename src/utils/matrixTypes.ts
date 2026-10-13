import type { ComponentType } from 'svelte';

export interface MatrixCell {
	cell: number | null;
	rowIndex: number;
	colIndex: number;
}

export type MatrixCellElement = SVGRectElement | SVGCircleElement;

export type MatrixColorScale = (value: number, index: number) => string;

export type MatrixCellHandler = (
	event: Event,
	data: MatrixCell,
	element?: MatrixCellElement
) => void;

export type MatrixSvgHandler = (event: Event, data?: MatrixCell, element?: SVGSVGElement) => void;

export interface MatrixTooltip {
	component: ComponentType;
	props: Record<string, unknown>;
}

export type MatrixTooltipContent = string | MatrixTooltip | undefined;

export type MatrixTooltipHandler = (event: Event, value: number | null) => MatrixTooltipContent;
