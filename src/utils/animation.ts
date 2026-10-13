import { gsap } from 'gsap';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';
import { blockIdx, isOnAnimation, modelMeta } from '~/store';
import { get } from 'svelte/store';
import * as d3 from 'd3';
const { theme } = resolveConfig(tailwindConfig);

const getGradientStops = (className: string, stopIdx = 1) => {
	return Array.from(document.querySelectorAll<SVGElement>(className)).map(
		(el) => el.querySelectorAll<SVGStopElement>('stop')[stopIdx]
	);
};

type GradientAnimationOptions = Omit<GSAPTweenVars, 'duration' | 'ease'> & {
	color?: string;
	duration?: number;
	ease?: GSAPTweenVars['ease'];
	offset?: { from?: string; to?: string };
	position?: gsap.Position;
};

const generateGradientAnimation = (
	tl: GSAPTimeline,
	gradStop: undefined | SVGStopElement | (SVGStopElement | undefined)[],
	options: GradientAnimationOptions = {}
) => {
	const {
		color = 'rgba(255,255,255,0)',
		duration = 0.1,
		ease = 'power1.in',
		offset = { from: '0%', to: '100%' },
		position = '+=0',
		...restOptions
	} = options;

	const { from = '0%', to = '100%' } = offset;

	let animationTargets: SVGStopElement | SVGStopElement[];
	let initialColor: string | null | (string | null)[];
	let stopsWithoutColor: SVGStopElement[];
	if (Array.isArray(gradStop)) {
		const validStops = gradStop.filter((stop): stop is SVGStopElement => stop !== undefined);
		if (validStops.length === 0) return;
		animationTargets = validStops;
		initialColor = validStops.map((stop) => stop.getAttribute('stop-color'));
		stopsWithoutColor = validStops.filter((stop) => stop.getAttribute('stop-color') === null);
	} else {
		if (!gradStop) return;
		animationTargets = gradStop;
		initialColor = gradStop.getAttribute('stop-color');
		stopsWithoutColor = initialColor === null ? [gradStop] : [];
	}

	tl.fromTo(
		animationTargets,
		{ attr: { offset: from, ['stop-color']: color } },
		{
			attr: {
				offset: to,
				['stop-color']: color
			},
			duration,
			ease,
			...restOptions
		},
		position
	).to(
		animationTargets,
		{
			attr: {
				offset: to,
				['stop-color']: (i: number): string =>
					(Array.isArray(initialColor) ? initialColor[i] : initialColor) ?? color
			},
			duration,
			ease,
			...restOptions
		},
		'-=50%'
	);

	if (stopsWithoutColor.length > 0) {
		tl.call(() => {
			stopsWithoutColor.forEach((stop) => stop.removeAttribute('stop-color'));
		});
	}
};

const fadeOutColor = theme.colors.gray[100];
const nodeFadeOutOpacity = 0.2;
let flowTimeline: GSAPTimeline | undefined;

export const completeCurrentAnimation = () => {
	if (flowTimeline) {
		flowTimeline.progress(1);
	}
};

export const showFlowAnimation = async (
	tokenLength: number,
	isNextTokenOnly = true,
	signal?: AbortSignal
) => {
	if (signal?.aborted) return;
	completeCurrentAnimation();

	let isFirstBlock = get(blockIdx) === 0;
	let isLastBlock = get(blockIdx) === get(modelMeta)?.layer_num - 1;

	return new Promise<void>((resolve) => {
		let settled = false;
		const tl = gsap.timeline();
		flowTimeline = tl;

		const settle = () => {
			if (settled) return;
			settled = true;
			signal?.removeEventListener('abort', handleAbort);
			resolve();
		};
		const handleAbort = () => {
			tl.kill();
			if (flowTimeline === tl) {
				flowTimeline = undefined;
				isOnAnimation.set(false);
			}
			settle();
		};

		tl.eventCallback('onStart', () => {
			if (flowTimeline === tl) isOnAnimation.set(true);
		});
		tl.eventCallback('onComplete', () => {
			if (flowTimeline === tl) {
				flowTimeline = undefined;
				isOnAnimation.set(false);
			}
			settle();
		});

		signal?.addEventListener('abort', handleAbort, { once: true });
		if (signal?.aborted) {
			handleAbort();
			return;
		}

		const duration = 0.02;

		// ============================
		// add token vector to embedding
		// ============================
		const tokenEmbedding = document.querySelectorAll(
			isNextTokenOnly ? '.embedding .content .last' : '.embedding .content'
		);

		tl.fromTo(
			tokenEmbedding,
			{ opacity: 0 },
			{
				opacity: 1,
				duration: isNextTokenOnly ? duration : 0.2
			}
		);

		if (!isFirstBlock) {
			// ============================
			// draw embedding to start block path
			// ============================
			const [embeddingToStartStop1, embeddingToStartStop1Last] =
				getGradientStops('.gray-white-blue');
			const [embeddingToStartStop2, embeddingToStartStop2Last] = getGradientStops(
				'.gray-white-blue',
				3
			);

			const startBlockTl = gsap.timeline();

			generateGradientAnimation(
				startBlockTl,
				isNextTokenOnly
					? [embeddingToStartStop1Last]
					: [embeddingToStartStop1, embeddingToStartStop1Last],
				{
					duration: duration * 5,
					offset: { to: '50%' },
					ease: 'sine.inOut'
				}
			);
			generateGradientAnimation(
				startBlockTl,
				isNextTokenOnly
					? [embeddingToStartStop2Last]
					: [embeddingToStartStop2, embeddingToStartStop2Last],
				{
					duration: duration * 5,
					offset: { from: '50%' },
					ease: 'sine.inOut'
				}
			);

			tl.add(startBlockTl);

			const tokenEmbedding2 = document.querySelectorAll('.qkv .block-start-column');

			tl.fromTo(
				tokenEmbedding2,
				{
					opacity: (i, d) => {
						if (isNextTokenOnly) {
							return d.classList.contains('last') ? 0 : 1;
						}
						return 0;
					}
				},
				{
					opacity: 1,
					duration: isNextTokenOnly ? duration : 0.2
				}
			);
		}

		// ============================
		// draw embedding to qkv weight mul path
		// ============================
		const [embeddingToQKVGrad, embeddingToQKVGradLast] = getGradientStops(
			isFirstBlock ? '.gray-blue' : '.transparent-blue'
		);

		if (isNextTokenOnly) {
			// generateGradientAnimation(tl, embeddingToQKVGrad, {
			// 	color: fadeOutColor,
			// 	duration: duration * 10
			// });
			generateGradientAnimation(tl, embeddingToQKVGradLast, {
				position: '<',
				duration: duration * 10
			});
		} else {
			generateGradientAnimation(tl, [embeddingToQKVGrad, embeddingToQKVGradLast], {
				duration: duration * 10
			});
		}

		// ============================
		// add qkv vector to attention
		// ============================
		const qkvVectors = document.querySelectorAll('.qkv .qkv-weighted');
		tl.fromTo(
			qkvVectors,
			{
				opacity: (i, d) => {
					if (isNextTokenOnly) {
						return d.classList.contains('last') ? 0 : 1;
					}
					return 0;
				}
			},
			{
				opacity: 1,
				duration: isNextTokenOnly ? duration : 0.2
			}
		);

		// ============================
		// draw multi-head divided path
		// ============================
		const [queryH1Grad, queryH1GradLast] = getGradientStops('.blue-blue');
		const [keyH1Grad, keyH1GradLast] = getGradientStops('.red-red');
		const [valueH1Grad, valueH1GradLast] = getGradientStops('.green-green');

		const [queryGrad, queryGradLast] = getGradientStops('.blue-blue2');
		const [keyGrad, keyGradLast] = getGradientStops('.red-red2');
		const [valueGrad, valueGradLast] = getGradientStops('.green-green2');

		if (isNextTokenOnly) {
			// generateGradientAnimation(
			// 	tl,
			// 	[queryH1Grad, keyH1Grad, valueH1Grad, queryGrad, keyGrad, valueGrad],
			// 	{
			// 		color: fadeOutColor,
			// 		duration: duration * 10
			// 	}
			// );

			generateGradientAnimation(tl, [queryH1GradLast, keyH1GradLast, valueH1GradLast], {
				// stagger: 0.2
				position: '<',
				duration: duration * 10
			});
			generateGradientAnimation(tl, [queryGradLast, keyGradLast, valueGradLast], {
				// stagger: 0.2,
				position: '<',
				duration: duration * 10
			});
		} else {
			generateGradientAnimation(
				tl,
				[queryH1Grad, keyH1Grad, valueH1Grad, queryH1GradLast, keyH1GradLast, valueH1GradLast],
				{
					// stagger: 0.2
					duration: duration * 10
				}
			);
			generateGradientAnimation(
				tl,
				[queryGrad, keyGrad, valueGrad, queryGradLast, keyGradLast, valueGradLast],
				{
					// stagger: 0.2,
					duration: duration * 10
				}
			);
		}

		// ============================
		// add h1 qkv vector
		// ============================
		const qkvHead1 = document.querySelectorAll('.attention .head-block .qkv .column .head1');
		tl.fromTo(
			qkvHead1,
			{
				opacity: (i, d) => {
					if (isNextTokenOnly) {
						return d.classList.contains('last') ? 0 : 1;
					}
					return 0;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw attention matrix mul path
		// add attention values
		// ============================
		const keyPaths = document.querySelectorAll<SVGPathElement>(
			'.sankey-top g.attention path.key-to-attention'
		);
		const queryPaths = document.querySelectorAll<SVGPathElement>(
			'.sankey-top g.attention path.query-to-attention'
		);
		const attentionMatrix = document.querySelector<HTMLElement>('.attention .attention-result');

		if (isNextTokenOnly) {
			const QKDuration = 0.7;
			const stagger = Number((QKDuration / tokenLength).toFixed(2));

			[...keyPaths, ...queryPaths].forEach((path) => {
				path.style.strokeDasharray = '0';
				path.style.strokeDashoffset = '0';
			});

			const lastKeyPath = keyPaths.item(keyPaths.length - 1);
			const lastQueryPath = queryPaths.item(queryPaths.length - 1);

			if (lastKeyPath && lastQueryPath) {
				[lastKeyPath, lastQueryPath].forEach((path) => {
					const length = path.getTotalLength();
					path.style.strokeDasharray = String(length);
					path.style.strokeDashoffset = String(length);
				});

				tl.to(lastKeyPath, {
					strokeDashoffset: 0,
					stagger,
					duration: QKDuration,
					ease: 'power2.out'
				}).to(
					lastQueryPath,
					{
						strokeDashoffset: 0,
						stagger,
						duration: QKDuration,
						// ease: 'back.out(1.7)'
						ease: 'power2.out'
					},
					'<'
				);

				if (attentionMatrix) {
					tl.from(
						attentionMatrix.querySelectorAll<SVGCircleElement>('svg circle.last'),
						{
							scale: 0,
							transformOrigin: '50% 50%',
							opacity: 0,
							delay: QKDuration / tokenLength,
							stagger: Number((QKDuration / Math.pow(tokenLength, 2)).toFixed(2)),
							ease: 'power2.out',
							// ease: 'back.out(1.7)',
							duration: QKDuration
						},
						'<'
					);
				}
			}
		} else {
			const QKDuration = 0.4;
			const stagger = Number((QKDuration / tokenLength).toFixed(2));

			[...keyPaths, ...queryPaths].forEach((path) => {
				const length = path.getTotalLength();
				path.style.strokeDasharray = String(length);
				path.style.strokeDashoffset = String(length);
			});

			tl.to(keyPaths, {
				strokeDashoffset: 0,
				stagger,
				duration: QKDuration,
				ease: 'power2.out'
			}).to(
				queryPaths,
				{
					strokeDashoffset: 0,
					stagger,
					duration: QKDuration,
					// ease: 'back.out(1.7)'
					ease: 'power2.out'
				},
				'<'
			);

			if (attentionMatrix) {
				tl.from(
					attentionMatrix.querySelectorAll<SVGCircleElement>('svg circle'),
					{
						scale: 0,
						transformOrigin: '50% 50%',
						opacity: 0,
						delay: QKDuration / tokenLength,
						stagger: Number((QKDuration / Math.pow(tokenLength, 2)).toFixed(2)),
						ease: 'power2.out',
						// ease: 'back.out(1.7)',
						duration: QKDuration
					},
					'<'
				);
			}
		}

		// ============================
		// draw val and attention mul path
		// ============================
		const valueMulGrad = getGradientStops('.green-purple');
		const attentionMulrad = getGradientStops('.transparent-purple2');

		generateGradientAnimation(tl, [attentionMulrad, valueMulGrad].flat(), {
			color: isNextTokenOnly ? fadeOutColor : undefined,
			position: '<50%'
		});

		// ============================
		// add output vector
		// ============================
		const outputHead1 = document.querySelectorAll('.attention .head-block .head-out .column .cell');
		const outputTitle = document.querySelector('.attention .head-block .head-out .title');

		tl.fromTo(
			[outputHead1, outputTitle],
			{
				opacity: (i, d) => {
					if (isNextTokenOnly) {
						return d.classList.contains('last') ? 0 : 1;
					}
					return 0;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw concat path
		// ============================
		const [outputH1Grad, outputH1GradLast] = getGradientStops('.purple-purple');
		const [outputGrad, outputGradLast] = getGradientStops('.transparent-purple');

		if (isNextTokenOnly) {
			// generateGradientAnimation(tl, [outputH1Grad, outputGrad], {
			// 	color: fadeOutColor
			// });
			generateGradientAnimation(tl, [outputH1GradLast, outputGradLast], { position: '<' });
		} else {
			generateGradientAnimation(tl, [outputH1Grad, outputGrad, outputH1GradLast, outputGradLast]);
		}

		// ============================
		// add MLP input vector
		// ============================
		const mlpInputs = document.querySelectorAll('.mlp .first-layer .cell');

		tl.fromTo(
			mlpInputs,
			{
				opacity: (i, d) => {
					if (isNextTokenOnly) {
						return d.classList.contains('last') ? 0 : 1;
					}
					return 0;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw MLP first layer path
		// ============================

		const [mlpInputPath, mlpInputPathLast] = getGradientStops('.purple-indigo');

		if (isNextTokenOnly) {
			// generateGradientAnimation(tl, mlpInputPath, {
			// 	color: fadeOutColor
			// });
			generateGradientAnimation(tl, mlpInputPathLast, { position: '<' });
		} else {
			generateGradientAnimation(tl, [mlpInputPath, mlpInputPathLast]);
		}

		// ============================
		// add MLP first layer output vector
		// ============================
		const mlpProjections = document.querySelectorAll('.mlp .second-layer .cell');
		const mlpActivations = document.querySelectorAll('.mlp #mlp-activation .cell');

		tl.fromTo(
			[mlpProjections, mlpActivations],
			{
				opacity: (i, d) => {
					if (isNextTokenOnly) {
						return d.classList.contains('last') ? 0 : 1;
					}
					return 0;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw MLP output layer
		// ============================
		const [mlpSecondPath, mlpSecondPathLast] = getGradientStops('.indigo-blue');

		if (isNextTokenOnly) {
			// generateGradientAnimation(tl, mlpSecondPath, {
			// 	color: fadeOutColor
			// });
			generateGradientAnimation(tl, mlpSecondPathLast, { position: '<' });
		} else {
			generateGradientAnimation(tl, [mlpSecondPath, mlpSecondPathLast]);
		}

		// ===========================
		// add MLP output vector
		// ============================
		const mlpOutputs = document.querySelectorAll('.mlp .ouputs .cell');
		tl.fromTo(
			mlpOutputs,
			{
				opacity: (i, d) => {
					if (isNextTokenOnly) {
						return d.classList.contains('last') ? 0 : 1;
					}
					return 0;
				}
			},
			{ opacity: 1, duration }
		);

		if (isLastBlock) {
			const [lastBlockPath, lastBlockPathLast] = getGradientStops('.blue');

			if (isNextTokenOnly) {
				// generateGradientAnimation(tl, lastBlockPath, {
				// 	color: fadeOutColor
				// });
				generateGradientAnimation(tl, lastBlockPathLast, { position: '<' });
			} else {
				generateGradientAnimation(tl, [lastBlockPath, lastBlockPathLast]);
			}
		} else {
			// ============================
			// show repetition of blocks
			// ============================
			const [transformerBlocksStop1, transformerBlocksStop1Last] =
				getGradientStops('.blue-white-blue');
			const [transformerBlocksStop2, transformerBlocksStop2Last] = getGradientStops(
				'.blue-white-blue',
				3
			);

			const blockTl = gsap.timeline({
				// repeat: 2
			});
			if (isNextTokenOnly) {
				generateGradientAnimation(blockTl, [transformerBlocksStop1Last], {
					duration: duration * 5,
					offset: { to: '50%' },
					ease: 'sine.inOut'
				});
				generateGradientAnimation(blockTl, [transformerBlocksStop2Last], {
					duration: duration * 5,
					offset: { from: '50%' },
					ease: 'sine.inOut'
				});
			} else {
				generateGradientAnimation(blockTl, [transformerBlocksStop1, transformerBlocksStop1Last], {
					duration: duration * 5,
					offset: { to: '50%' },
					ease: 'sine.inOut'
				});
				generateGradientAnimation(blockTl, [transformerBlocksStop2, transformerBlocksStop2Last], {
					duration: duration * 5,
					offset: { from: '50%' },
					ease: 'sine.inOut'
				});
			}

			tl.add(blockTl);
		}

		// ============================
		// add final output vector
		// ============================
		const finalOutput = document.querySelectorAll('.transformer-blocks .cell');
		tl.fromTo(
			finalOutput,
			{
				opacity: (i, d) => {
					if (isNextTokenOnly) {
						return d.classList.contains('last') ? 0 : 1;
					}
					return 0;
				}
			},
			{ opacity: 1, duration }
		);

		// ============================
		// draw logit path
		// ============================

		const logitPath = getGradientStops('.blue-gray');

		generateGradientAnimation(tl, logitPath, { offset: { to: `50%` } });

		// ============================
		// show top k tokens and probabilities
		// ============================
		const probabilities = document.querySelectorAll('.softmax .content');
		tl.fromTo(probabilities, { opacity: 0 }, { opacity: 1, duration });

		// ============================
		// sampling animation
		// ============================
		// showSamplingAnimation();
	});
};

export const drawResidualLine = (id?: string) => {
	let residualAnimation: GSAPTween | undefined;

	const connectLine = (paths: SVGLineElement[]) => {
		residualAnimation = gsap.to(paths, {
			strokeDashoffset: -50,
			duration: 1,
			repeat: -1,
			ease: 'none'
		});
	};

	const drawLine = () => {
		const startSelector = id ? `#${id}-start` : '[data-click="residual-start"]';
		const endSelector = id ? `#${id}-end` : '[data-click="residual-end"]';
		const connectorSelector = id ? `.residual-connector.${id}` : '.residual-connector';
		const connector = d3.selectAll<SVGLineElement, unknown>(connectorSelector);
		const startGroup = document.querySelectorAll(startSelector);
		const endGroup = document.querySelectorAll(endSelector);

		connector.style('opacity', 1);
		connectLine(connector.nodes());

		startGroup.forEach((el) => el.classList.add('active'));
		endGroup.forEach((el) => el.classList.add('active'));
	};

	const removeLine = () => {
		const startSelector = id ? `#${id}-start` : '[data-click="residual-start"]';
		const endSelector = id ? `#${id}-end` : '[data-click="residual-end"]';
		const connectorSelector = id ? `.residual-connector.${id}` : '.residual-connector';
		const connector = d3.selectAll<SVGLineElement, unknown>(connectorSelector);
		const startGroup = document.querySelectorAll(startSelector);
		const endGroup = document.querySelectorAll(endSelector);

		connector.style('opacity', 0);
		if (residualAnimation) {
			residualAnimation.kill();
			connector.style('stroke-dashoffset', 0);
		}

		startGroup.forEach((el) => el.classList.remove('active'));
		endGroup.forEach((el) => el.classList.remove('active'));
	};

	return {
		drawLine,
		removeLine
	};
};
