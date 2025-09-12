<script lang="ts">
	import {
		randomizeBattingOrder,
		togglePlayerAttendance,
		isPlayerAttending,
		getSortedBattingOrderForDisplay,
		gameMetadata,
		updateGameMetadata
	} from '$lib/baseball-lineup-logic.svelte';

	// Props
	let { battingOrder = [] }: { battingOrder?: string[] } = $props();

	// Get the sorted batting order for display (attending players first, then non-attending)
	const displayOrder = $derived(getSortedBattingOrderForDisplay());

	// Helper function to format time for input (HH:MM format)
	function formatTimeForInput(time: string): string {
		if (!time) return '';
		// If time is in HH:MM format, return as is
		if (time.match(/^\d{2}:\d{2}$/)) return time;
		// If time is in HH:MM:SS format, remove seconds
		if (time.match(/^\d{2}:\d{2}:\d{2}$/)) return time.substring(0, 5);
		return time;
	}
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

	<!-- Game Metadata Section - Only show if batting order has been generated -->
	{#if battingOrder.length > 0}
		<div class="rounded-lg bg-[var(--color-bg-accent)] p-4">
			<h3 class="mb-4 text-lg font-semibold text-[var(--color-text)]">Game Information</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<!-- Game Date -->
				<div>
					<label for="gameDate" class="mb-1 block text-sm font-medium text-[var(--color-text)]">
						Game Date
					</label>
					<input
						id="gameDate"
						type="date"
						bind:value={gameMetadata.gameDate}
						oninput={(e) => updateGameMetadata({ gameDate: (e.target as HTMLInputElement).value })}
						class="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
					/>
				</div>

				<!-- Game Time -->
				<div>
					<label for="gameTime" class="mb-1 block text-sm font-medium text-[var(--color-text)]">
						Game Time
					</label>
					<input
						id="gameTime"
						type="time"
						value={formatTimeForInput(gameMetadata.gameTime)}
						oninput={(e) => updateGameMetadata({ gameTime: (e.target as HTMLInputElement).value })}
						class="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
					/>
				</div>

				<!-- Field -->
				<div>
					<label for="field" class="mb-1 block text-sm font-medium text-[var(--color-text)]">
						Field
					</label>
					<input
						id="field"
						type="text"
						bind:value={gameMetadata.field}
						oninput={(e) => updateGameMetadata({ field: (e.target as HTMLInputElement).value })}
						placeholder="Enter field name"
						class="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
					/>
				</div>

				<!-- Home Team -->
				<div>
					<label for="homeTeam" class="mb-1 block text-sm font-medium text-[var(--color-text)]">
						Home Team
					</label>
					<input
						id="homeTeam"
						type="text"
						bind:value={gameMetadata.homeTeam}
						oninput={(e) => updateGameMetadata({ homeTeam: (e.target as HTMLInputElement).value })}
						placeholder="Enter home team name"
						class="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
					/>
				</div>

				<!-- Away Team -->
				<div>
					<label for="awayTeam" class="mb-1 block text-sm font-medium text-[var(--color-text)]">
						Away Team
					</label>
					<input
						id="awayTeam"
						type="text"
						bind:value={gameMetadata.awayTeam}
						oninput={(e) => updateGameMetadata({ awayTeam: (e.target as HTMLInputElement).value })}
						placeholder="Enter away team name"
						class="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
					/>
				</div>
			</div>

			<!-- Home/Away Toggle -->
			<div class="mt-4">
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						bind:checked={gameMetadata.isHomeTeam}
						onchange={(e) =>
							updateGameMetadata({ isHomeTeam: (e.target as HTMLInputElement).checked })}
						class="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
					/>
					<span class="text-sm font-medium text-[var(--color-text)]">
						Our team is the home team
					</span>
				</label>
			</div>
		</div>
	{/if}

	<!-- Current Batting Order (Screen View) -->
	<div class="rounded-lg bg-[var(--color-bg-accent)] p-4 print:hidden">
		{#if battingOrder.length === 0}
			<p class="text-[var(--color-text-muted)] italic">No players in batting order yet</p>
		{:else}
			<div class="space-y-2">
				{#each displayOrder as player (player)}
					{@const originalIndex = battingOrder.indexOf(player)}
					{@const isAttending = isPlayerAttending(player)}
					<div
						class="flex items-center justify-between rounded border bg-[var(--color-bg-secondary)] p-3 {!isAttending
							? 'opacity-60'
							: ''}"
					>
						<div class="flex items-center gap-3">
							<span class="font-medium">{originalIndex + 1}. {player}</span>
							{#if !isAttending}
								<span class="text-sm text-[var(--color-text-muted)] italic">(Not Attending)</span>
							{/if}
						</div>
						<button
							class="rounded px-3 py-1 text-sm font-medium transition-colors {isAttending
								? 'bg-[var(--color-success)] text-white hover:bg-[var(--color-success-dark)]'
								: 'bg-[var(--color-error)] text-white hover:bg-[var(--color-error-dark)]'}"
							onclick={() => togglePlayerAttendance(player)}
						>
							{isAttending ? 'Attending' : 'Not Attending'}
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
