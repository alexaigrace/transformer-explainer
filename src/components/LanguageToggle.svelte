<script lang="ts">
	import { locale, setLocale, t } from '~/i18n';

	$: isZh = $locale === 'zh';

	const onToggle = () => {
		setLocale(isZh ? 'en' : 'zh');
	};
</script>

<button
	type="button"
	class="language-switch"
	class:zh={isZh}
	role="switch"
	aria-checked={isZh}
	aria-label={$t('lang.switch')}
	title={$t('lang.switch')}
	data-click="language-switch"
	on:click={onToggle}
>
	<span class="thumb" aria-hidden="true"></span>
	<span class="option zh-option">{$t('lang.zh')}</span>
	<span class="option en-option">{$t('lang.en')}</span>
</button>

<style lang="scss">
	.language-switch {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
		width: 5.6rem;
		height: 1.7rem;
		padding: 0.15rem;
		border: 1px solid theme('colors.gray.300');
		border-radius: 999px;
		background: theme('colors.gray.100');
		cursor: pointer;
		font-size: 0.72rem;
		line-height: 1;
		transition: border-color 0.2s;

		&:hover {
			border-color: theme('colors.gray.400');
		}

		&:focus-visible {
			outline: 2px solid theme('colors.purple.400');
			outline-offset: 1px;
		}
	}

	.thumb {
		position: absolute;
		top: 0.15rem;
		left: 0.15rem;
		width: calc(50% - 0.15rem);
		height: calc(100% - 0.3rem);
		border-radius: 999px;
		background: white;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.18);
		transition: transform 0.24s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
	}

	.language-switch:not(.zh) .thumb {
		transform: translateX(100%);
	}

	.option {
		position: relative;
		z-index: 1;
		flex: 1 1 0;
		text-align: center;
		color: theme('colors.gray.400');
		font-weight: 500;
		user-select: none;
		transition: color 0.2s;
	}

	.language-switch.zh .zh-option,
	.language-switch:not(.zh) .en-option {
		color: theme('colors.gray.900');
	}
</style>
