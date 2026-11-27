<script lang="ts">
  export type IconName =
    | 'arrow-right'
    | 'arrow-up-right'
    | 'arrow-left'
    | 'chevron-right'
    | 'chevron-up'
    | 'chevron-down'
    | 'sun'
    | 'moon'
    | 'download'
    | 'lock'
    | 'menu'
    | 'close'
    | 'plus'
    | 'trash'
    | 'upload'
    | 'external'
    | 'logout'
    | 'file'
    | 'mail'
    | 'copy'
    | 'check'
    | 'eye'
    | 'eye-off';

  let { name, size = 16, class: className = '' }: { name: IconName; size?: number; class?: string } =
    $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.75"
  stroke-linecap="square"
  stroke-linejoin="miter"
  aria-hidden="true"
  class={className}
>
  {#if name === 'arrow-right'}
    <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
  {:else if name === 'arrow-left'}
    <path d="M19 12H5" /><path d="m11 6-6 6 6 6" />
  {:else if name === 'arrow-up-right' || name === 'external'}
    <path d="M7 17 17 7" /><path d="M8 7h9v9" />
  {:else if name === 'chevron-right'}
    <path d="m9 6 6 6-6 6" />
  {:else if name === 'chevron-up'}
    <path d="m6 15 6-6 6 6" />
  {:else if name === 'chevron-down'}
    <path d="m6 9 6 6 6-6" />
  {:else if name === 'sun'}
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" /><path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  {:else if name === 'moon'}
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  {:else if name === 'download'}
    <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 20h16" />
  {:else if name === 'lock'}
    <rect width="16" height="10" x="4" y="11" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  {:else if name === 'menu'}
    <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />
  {:else if name === 'close'}
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  {:else if name === 'plus'}
    <path d="M12 5v14" /><path d="M5 12h14" />
  {:else if name === 'trash'}
    <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6v14h12V6" />
  {:else if name === 'upload'}
    <path d="M12 15V3" /><path d="m7 8 5-5 5 5" /><path d="M4 20h16" />
  {:else if name === 'logout'}
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" /><path d="M21 12H9" />
  {:else if name === 'file'}
    <path d="M14 2H6v20h12V8z" /><path d="M14 2v6h6" />
  {:else if name === 'mail'}
    <rect width="18" height="14" x="3" y="5" /><path d="m3 7 9 6 9-6" />
  {:else if name === 'copy'}
    <rect width="12" height="12" x="9" y="9" /><path d="M5 15H4V4h11v1" />
  {:else if name === 'check'}
    <path d="m5 12 5 5L20 7" />
  {:else if name === 'eye'}
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  {:else if name === 'eye-off'}
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <path d="m2 2 20 20" />
  {/if}
</svg>
