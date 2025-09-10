<script lang="ts">
	import { randomizeBattingOrder } from '$lib/baseball-lineup-logic.svelte';

	// Props
	let { battingOrder = [] }: { battingOrder?: string[] } = $props();
</script>

<!-- Batting Order Tab -->
<div class="space-y-6 print:hidden">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-semibold text-[var(--color-text)]">Batting Order</h2>
		<button
			class="rounded bg-[var(--color-error)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-secondary-dark)]"
			onclick={randomizeBattingOrder}
		>
			Randomize
		</button>
	</div>

	<!-- Current Batting Order (Screen View) -->
	<div class="rounded-lg bg-[var(--color-bg-accent)] p-4 print:hidden">
		{#if battingOrder.length === 0}
			<p class="text-[var(--color-text-muted)] italic">No players in batting order yet</p>
		{:else}
			<div class="space-y-2">
				{#each battingOrder as player, index (player)}
					<div
						class="flex items-center justify-between rounded border bg-[var(--color-bg-secondary)] p-3"
					>
						<span class="font-medium">{index + 1}. {player}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
