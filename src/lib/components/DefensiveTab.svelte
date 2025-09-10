<script lang="ts">
	import {
		POSITIONS,
		generateDefensiveLineups,
		clearGeneratedLineups,
		validateLineup,
		canPlayerPlayPosition,
		togglePlayerCapability,
		allPlayersHaveCapabilities
	} from '$lib/baseball-lineup-logic.svelte';

	// Props
	let {
		roster = [],
		generatedLineups = {}
	}: {
		roster?: string[];
		generatedLineups?: Record<string, string[]>;
	} = $props();

	// Local state
	let capabilitiesCollapsed = $state(false);

	// Local functions
	function handleGenerateLineups() {
		generateDefensiveLineups();
		capabilitiesCollapsed = true;
	}

	function toggleCapabilitiesPanel() {
		capabilitiesCollapsed = !capabilitiesCollapsed;
	}
</script>

<!-- Defensive Positioning Tab -->
<div class="space-y-6 print:hidden">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-semibold text-[var(--color-text)]">Defensive Positioning</h2>
		<div class="flex gap-2">
			{#if allPlayersHaveCapabilities()}
				<button
					class="rounded bg-[var(--color-success)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-primary-dark)]"
					onclick={handleGenerateLineups}
				>
					Generate Lineups
				</button>
			{/if}
			{#if Object.keys(generatedLineups).length > 0}
				<button
					class="rounded bg-[var(--color-error)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-secondary-dark)]"
					onclick={clearGeneratedLineups}
				>
					Clear Lineups
				</button>
			{/if}
		</div>
	</div>

	<!-- Player Position Capabilities -->
	<div class="player-capabilities rounded-lg bg-[var(--color-bg-accent)] p-4">
		<div class="flex items-center justify-between">
			<button
				class="flex items-center gap-2 text-lg font-medium text-[var(--color-text-light)] transition-colors hover:text-[var(--color-text)]"
				onclick={toggleCapabilitiesPanel}
			>
				<svg
					class="h-5 w-5 transition-transform duration-200 {capabilitiesCollapsed
						? 'rotate-0'
						: 'rotate-90'}"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				Player Position Capabilities
			</button>
			{#if !allPlayersHaveCapabilities()}
				<p class="text-sm text-[var(--color-text-muted)]">
					Assign at least one position to each player to generate lineups
				</p>
			{/if}
		</div>

		{#if !capabilitiesCollapsed}
			<div class="capabilities-content transition-all duration-300 ease-in-out">
				<p class="mb-4 text-sm text-[var(--color-text-muted)]">
					Click to toggle which positions each player can play. Once all players have at least one
					position, you can generate 6 random defensive lineups.
				</p>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse">
						<thead>
							<tr class="border-b border-[var(--color-border)]">
								<th class="p-2 text-left text-sm font-medium text-[var(--color-text-light)]"
									>Player</th
								>
								{#each POSITIONS as position (position)}
									<th class="p-2 text-center text-sm font-medium text-[var(--color-text-light)]"
										>{position}</th
									>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each roster as player (player)}
								<tr class="border-b border-[var(--color-border-light)]">
									<td class="p-2 font-medium text-[var(--color-text)]">{player}</td>
									{#each POSITIONS as position (position)}
										<td class="p-2 text-center">
											<button
												class="h-8 w-8 rounded border-2 transition-colors {canPlayerPlayPosition(
													player,
													position
												)
													? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
													: 'border-[var(--color-border-dark)] bg-transparent text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'}"
												onclick={() => togglePlayerCapability(player, position)}
											>
												{canPlayerPlayPosition(player, position) ? '✓' : '✗'}
											</button>
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>

	<!-- Generated Lineups Results (Screen View) -->
	{#if Object.keys(generatedLineups).length > 0}
		<div class="rounded-lg bg-[var(--color-bg-accent)] p-4 print:hidden">
			<h3 class="mb-3 text-lg font-medium text-[var(--color-text-light)]">
				Generated Defensive Lineups
			</h3>
			<p class="mb-4 text-sm text-[var(--color-text-muted)]">
				Each position shows the player assigned for each of the 6 innings. The "Sitting" rows show
				which {roster.length - 9} players are not on the field for each inning.
				<br /><br />
				<strong>League Rules Applied:</strong>
				• Max 3 innings per position per player • Min 2 infield innings per player (Pitcher, Catcher,
				1st-3rd Base, Shortstop) • Max 1 inning difference in bench time between players • 4+ innings
				catching = no pitching eligibility • 2+ innings pitching = no catching eligibility
			</p>

			<!-- League Rules Validation -->
			<div class="validation-message">
				{#if !validateLineup(generatedLineups).isValid}
					{@const validation = validateLineup(generatedLineups)}
					<div
						class="mb-4 rounded-lg border border-[var(--color-warning)] bg-[var(--color-accent-light)] p-3"
					>
						<h4 class="mb-2 text-sm font-medium text-[var(--color-error)]">
							⚠️ League Rules Violations
						</h4>
						<ul class="space-y-1 text-sm text-[var(--color-secondary-dark)]">
							{#each validation.errors as error (error)}
								<li>• {error}</li>
							{/each}
						</ul>
						<p class="mt-2 text-xs text-[var(--color-error)]">
							Try generating again or adjust player position capabilities to resolve these issues.
						</p>
					</div>
				{:else}
					<div
						class="mb-4 rounded-lg border border-[var(--color-success)] bg-[var(--color-bg-accent)] p-3"
					>
						<h4 class="mb-2 text-sm font-medium text-[var(--color-text)]">
							✅ All League Rules Satisfied
						</h4>
						<p class="text-sm text-[var(--color-text-light)]">
							This lineup complies with all league rules including position limits, infield
							requirements, and bench time fairness.
						</p>
					</div>
				{/if}
			</div>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse">
					<thead>
						<tr class="border-b border-[var(--color-border)]">
							<th class="p-2 text-left text-sm font-medium text-[var(--color-text-light)]"
								>Position</th
							>
							{#each Array(6) as _, inning (inning)}
								<th class="p-2 text-center text-sm font-medium text-[var(--color-text-light)] {_}">
									Inning {inning + 1}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each POSITIONS as position (position)}
							<tr class="border-b border-[var(--color-border-light)]">
								<td class="p-2 font-medium text-[var(--color-text)]">{position}</td>
								{#each generatedLineups[position] || [] as player, inning (inning)}
									<td class="p-2 text-center text-sm">
										{#if player}
											<span class="rounded bg-[var(--color-primary)] px-2 py-1 text-white">
												{player}
											</span>
										{:else}
											<span class="text-[var(--color-text-muted)] italic">-</span>
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
						<!-- Sitting Players Rows -->
						{#each Array.from({ length: roster.length - 9 }, (_, index) => index) as index (index)}
							{@const sittingKey = `Sitting ${index + 1}`}
							<tr
								class="border-b border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]"
							>
								<td class="p-2 font-medium text-[var(--color-text)]">Sitting {index + 1}</td>
								{#each generatedLineups[sittingKey] || [] as sittingPlayer, inning (inning)}
									<td class="p-2 text-center text-sm">
										{#if sittingPlayer}
											<span class="rounded bg-[var(--color-dirt)] px-2 py-1 text-white">
												{sittingPlayer}
											</span>
										{:else}
											<span class="text-[var(--color-text-muted)] italic">-</span>
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
